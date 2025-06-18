import { format } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreatePermitForm from "../permit/create-permit-form";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import services from "@/lib/services";
import {
  SessionUser,
  StudentDetails as StudentDetailsType,
} from "@/lib/types/common";
import { AccessRoles } from "@/lib/role";

export function StudentDetails({
  permissions,
}: {
  user: SessionUser;
  permissions: AccessRoles;
}) {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPermitDialogOpen, setIsPermitDialogOpen] = useState(false);

  useEffect(() => {
    loadStudentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStudentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await services.student.getById(id as string);
      if (response.success && response.data) {
        setStudent(response.data);
      } else {
        toast.error(response.error || "Failed to load student details");
        router.back();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load student details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Student Details</h2>
        </div>
        {permissions.isExecutive && (
          <Dialog
            open={isPermitDialogOpen}
            onOpenChange={setIsPermitDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Permit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Permit</DialogTitle>
                <DialogDescription>
                  Create a new permit for {student.name}
                </DialogDescription>
              </DialogHeader>
              <CreatePermitForm
                onSuccess={() => {
                  setIsPermitDialogOpen(false);
                  loadStudentDetails();
                }}
                setIsDialogOpen={setIsPermitDialogOpen}
                studentId={student.studentId}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Student ID
                  </p>
                  <p className="mt-1">{student.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Phone Number
                  </p>
                  <p className="mt-1">{student.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p className="mt-1">{student.course}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Level</p>
                  <p className="mt-1">{student.level}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permit History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permit Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Issued By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.permits.map((permit) => (
                  <TableRow key={permit.id}>
                    <TableCell className="font-medium">
                      {permit.originalCode}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(permit.status)}`}
                      >
                        {permit.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(permit.startDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(permit.expiryDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>GHS {permit.amountPaid.toFixed(2)}</TableCell>
                    <TableCell>
                      {permit.issuedBy?.username || "Unknown"}
                    </TableCell>
                  </TableRow>
                ))}
                {student.permits.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500"
                    >
                      No permits found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
