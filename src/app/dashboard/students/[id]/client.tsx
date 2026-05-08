"use client";

import { format } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import CreatePermitForm from "@/components/app/permit/create-permit-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import services from "@/lib/services";
import {
  SessionUser,
  StudentDetails as StudentDetailsType,
} from "@/lib/types/common";
import { AccessRoles } from "@/lib/role";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  activateStudentAccountAction,
  disableStudentAccountAction,
  getStudentAccountStatusAction,
  sendStudentPasswordResetLinkAction,
  sendStudentPasswordSetupLinkAction,
} from "@/app/actions/student-auth.actions";

interface StudentDetailsClientProps {
  user: SessionUser;
  permissions: AccessRoles;
  studentId: string;
}

export function StudentDetailsClient({
  permissions,
  studentId,
}: StudentDetailsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPermitDialogOpen, setIsPermitDialogOpen] = useState(false);
  const [studentAccountBusyAction, setStudentAccountBusyAction] = useState<string | null>(null);
  const { data: permitConfig } = useQuery({
    queryKey: ["permitConfig"],
    queryFn: async () => {
      const response = await services.config.getPermitConfig();
      if (!response.success) {
        throw new Error(response.error || "Failed to load configuration");
      }
      return response.data;
    },
  });
  const {
    data: student,
    isLoading,
    error,
  } = useQuery<StudentDetailsType, Error>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const response = await services.student.getById(studentId);
      if (!response.success) {
        throw new Error(response.error || "Failed to load student details");
      }
      return response.data as StudentDetailsType;
    },
    retry: 1,
  });
  const {
    data: studentAccountResponse,
    isLoading: isStudentAccountLoading,
  } = useQuery({
    queryKey: ["student-account", studentId],
    queryFn: async () => {
      const response = await getStudentAccountStatusAction(studentId);
      if (!response.success) {
        throw new Error(response.error || "Failed to load account status");
      }
      return "data" in response ? response.data ?? null : null;
    },
    retry: 1,
  });

  if (error) {
    toast.error(error.message || "Failed to load student details");
    router.back();
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const runStudentAccountAction = async (
    actionKey: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
  ) => {
    setStudentAccountBusyAction(actionKey);
    try {
      const response = await action();
      if (!response.success) {
        toast.error(response.error || "Action failed");
        return;
      }
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ["student-account", studentId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setStudentAccountBusyAction(null);
    }
  };

  const getStudentAccountBadge = () => {
    const status = studentAccountResponse?.status ?? "not_activated";
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending_setup":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending setup</Badge>;
      case "disabled":
        return <Badge className="bg-red-100 text-red-800">Disabled</Badge>;
      default:
        return <Badge variant="outline">Not activated</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Skeleton className="w-48 h-9" />
          </div>
          <Skeleton className="w-32 h-10" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="w-40 h-6" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                      <Skeleton className="w-24 h-4 mb-2" />
                      <Skeleton className="w-full h-6" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="w-40 h-6" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
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
                  queryClient.invalidateQueries({
                    queryKey: ["student", studentId],
                  });
                }}
                permitConfig={permitConfig}
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Student ID
                  </p>
                  <p className="mt-1">{student.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="mt-1">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="mt-1">{student.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Course
                  </p>
                  <p className="mt-1">{student.course}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Level
                  </p>
                  <p className="mt-1">{student.level}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Account</CardTitle>
          </CardHeader>
          <CardContent>
            {isStudentAccountLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStudentAccountBadge()}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="mt-1">{studentAccountResponse?.username || "Not created"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="mt-1">{studentAccountResponse?.email || student.email || "Unavailable"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                    <p className="mt-1">
                      {studentAccountResponse?.lastLoginAt
                        ? format(new Date(studentAccountResponse.lastLoginAt), "MMM d, yyyy h:mm a")
                        : "Never"}
                    </p>
                  </div>
                </div>

                {permissions.isExecutive ? (
                  <div className="flex flex-wrap gap-2">
                    {!studentAccountResponse ? (
                      <Button
                        disabled={studentAccountBusyAction !== null}
                        onClick={() =>
                          runStudentAccountAction(
                            "activate",
                            async () => {
                              const activateResponse = await activateStudentAccountAction(student.studentId);
                              if (!activateResponse.success) return activateResponse;
                              return sendStudentPasswordSetupLinkAction(student.studentId);
                            },
                            "Account activated and setup link sent",
                          )
                        }
                      >
                        Activate Account
                      </Button>
                    ) : null}
                    {studentAccountResponse && !studentAccountResponse.hasPassword ? (
                      <Button
                        disabled={studentAccountBusyAction !== null}
                        variant="secondary"
                        onClick={() =>
                          runStudentAccountAction(
                            "setup",
                            () => sendStudentPasswordSetupLinkAction(student.studentId),
                            "Setup link sent",
                          )
                        }
                      >
                        Resend Setup Link
                      </Button>
                    ) : null}
                    {studentAccountResponse?.hasPassword ? (
                      <Button
                        disabled={studentAccountBusyAction !== null}
                        variant="secondary"
                        onClick={() =>
                          runStudentAccountAction(
                            "reset",
                            () => sendStudentPasswordResetLinkAction(student.studentId),
                            "Password reset link sent",
                          )
                        }
                      >
                        Send Password Reset Link
                      </Button>
                    ) : null}
                    {studentAccountResponse?.isActive ? (
                      <Button
                        disabled={studentAccountBusyAction !== null}
                        variant="destructive"
                        onClick={() =>
                          runStudentAccountAction(
                            "disable",
                            () => disableStudentAccountAction(student.studentId),
                            "Student account disabled",
                          )
                        }
                      >
                        Disable Account
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
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
                      <Badge
                        variant="outline"
                        className={getStatusColor(permit.status)}
                      >
                        {permit.status}
                      </Badge>
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
                      className="text-center text-muted-foreground"
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
