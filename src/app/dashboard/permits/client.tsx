"use client";

import { useCallback, useState } from "react";
import { format } from "date-fns";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MyPagination } from "@/components/common/my-pagination";
import services from "@/lib/services";
import Link from "next/link";
import { AccessRoles } from "@/lib/role";
import { SessionUser } from "@/lib/types/common";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface PermitsClientProps {
  user: SessionUser;
  permissions: AccessRoles;
}

export function PermitsClient({ permissions }: PermitsClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  const { data: permitsData, isLoading } = useQuery({
    queryKey: ["permits", currentPage, debouncedSearch, statusFilter],
    queryFn: async () => {
      const response = await services.permit.getAll({
        page: currentPage,
        pageSize,
        search: debouncedSearch,
        status: statusFilter,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to load permits");
      }
      return response.data;
    },
  });

  const handleRevoke = useCallback(
    async (permitId: number) => {
      if (!permissions.isExecutive) {
        toast.error("You don't have permission to revoke permits");
        return;
      }

      if (!confirm("Are you sure you want to revoke this permit?")) return;

      try {
        const response = await services.permit.revoke(permitId);
        if (response.success && response.data) {
          const { student, originalCode, ...permit } = response.data;

          // Send revocation email
          await services.email.sendRevokedPermitEmail({
            permit: {
              amountPaid: permit.amountPaid,
              expiryDate: permit.expiryDate,
              id: permit.id + "",
            },
            student: student,
            permitCode: originalCode,
          });

          toast.success("Permit revoked successfully");
          queryClient.invalidateQueries({ queryKey: ["permits"] });
        } else {
          toast.error(response.error || "Failed to revoke permit");
        }
      } catch (error) {
        console.error("Error revoking permit:", error);
        toast.error("Failed to revoke permit");
      }
    },
    [permissions.isExecutive, queryClient]
  );

  const isExpired = useCallback((expiryDate: Date): boolean => {
    const now = new Date();
    return now > expiryDate;
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Permits</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permits..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          {permissions.isExecutive && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Permit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Permit</DialogTitle>
                  <DialogDescription>
                    Create a new permit for a student
                  </DialogDescription>
                </DialogHeader>
                <CreatePermitForm
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["permits"] });
                  }}
                  setIsDialogOpen={setIsDialogOpen}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-48 h-10" />
            <Skeleton className="w-32 h-10" />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permit Code</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="w-8 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-24 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-32 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-20 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-24 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-24 h-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-24 h-4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Skeleton className="w-16 h-9" />
                          <Skeleton className="h-9 w-9" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permit Code</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Issued By</TableHead>
                  {permissions.isExecutive && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permitsData?.data.map((permit) => {
                  const isPermitExpired = isExpired(permit.expiryDate);
                  const status = isPermitExpired ? "expired" : permit.status;
                  return (
                    <TableRow key={permit.id}>
                      <TableCell className="font-medium">
                        {permit.originalCode}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/students/${permit.student.studentId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {permit.student.name} ({permit.student.studentId})
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            status === "active"
                              ? "bg-green-100 text-green-800"
                              : status === "revoked"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
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
                      <TableCell>
                        {permit.status === "active" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevoke(permit.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <MyPagination
        currentPage={currentPage}
        totalPages={permitsData?.totalPages || 1}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
