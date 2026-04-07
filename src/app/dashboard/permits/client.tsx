"use client";

import { useCallback, useState, useMemo } from "react";
import { format } from "date-fns";
import { Mail, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ResendPermitModal } from "@/components/app/permit/resend-permit-modal";
import { toast } from "sonner";
import { MyPagination } from "@/components/common/my-pagination";
import services from "@/lib/services";
import Link from "next/link";
import { AccessRoles } from "@/lib/role";
import { SessionUser } from "@/lib/types/common";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [issuedByFilter, setIssuedByFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"all" | "duplicates" | "expiring">(
    "all"
  );
  const [expiringDays, setExpiringDays] = useState<number>(30);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [resendPermitId, setResendPermitId] = useState<number | null>(null);
  const [resendEmail, setResendEmail] = useState<string>("");
  const [resendPhone, setResendPhone] = useState<string>("");
  const [isBulkResendOpen, setIsBulkResendOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<"hours" | "range">("hours");
  const [bulkHours, setBulkHours] = useState<string>("2");
  const [bulkStartDate, setBulkStartDate] = useState<string>("");
  const [bulkEndDate, setBulkEndDate] = useState<string>("");
  const [isBulkSending, setIsBulkSending] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

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

  const { data: permitsData, isLoading } = useQuery({
    queryKey: [
      "permits",
      viewMode,
      currentPage,
      debouncedSearch,
      statusFilter,
      issuedByFilter,
      expiringDays,
    ],
    queryFn: async () => {
      if (viewMode === "duplicates") {
        const res = await services.permit.getDuplicates({
          page: currentPage,
          pageSize,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to load duplicates");
        return res.data;
      }
      if (viewMode === "expiring") {
        const res = await services.permit.getExpiringSoon({
          days: expiringDays,
          page: currentPage,
          pageSize,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to load expiring permits");
        return res.data;
      }
      const response = await services.permit.getAll({
        page: currentPage,
        pageSize,
        search: debouncedSearch,
        status: statusFilter,
        issuedBy: issuedByFilter,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to load permits");
      }
      return response.data;
    },
  });

  // Get unique issuers for the filter
  const { data: issuersData } = useQuery({
    queryKey: ["unique-issuers"],
    queryFn: async () => {
      const response = await services.permit.getUniqueIssuers();
      if (!response.success) {
        throw new Error(response.error || "Failed to load issuers");
      }
      return response.data;
    },
  });

  const uniqueIssuers = useMemo(() => {
    if (!issuersData) return [];
    return issuersData;
  }, [issuersData]);

  const openResendDialog = useCallback(
    (permitId: number) => {
      const permit = permitsData?.data.find((p) => p.id === permitId);
      if (permit) {
        // Set all state values first
        setResendPermitId(permitId);
        setResendEmail(permit.student.email ?? "");
        setResendPhone(permit.student.number ?? "");
        // Open modal after state is set
        setIsResendDialogOpen(true);
      }
    },
    [permitsData?.data]
  );

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
            student: {
              email: student.email ?? "",
              name: student.name ?? "",
              studentId: student.studentId,
              course: student.course ?? "",
              level: student.level ?? "",
            },
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

  const handleDelete = useCallback(
    async (permitId: number) => {
      if (!permissions.isExecutive) {
        toast.error("You don't have permission to delete permits");
        return;
      }

      if (
        !confirm(
          "Are you sure you want to delete this permit? This action cannot be undone and will also delete the associated payment record."
        )
      )
        return;

      try {
        const response = await services.permit.deletePermit(permitId);
        if (response.success) {
          toast.success("Permit deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["permits"] });
        } else {
          toast.error(response.error || "Failed to delete permit");
        }
      } catch (error) {
        console.error("Error deleting permit:", error);
        toast.error("Failed to delete permit");
      }
    },
    [permissions.isExecutive, queryClient]
  );

  const isExpired = useCallback((expiryDate: Date): boolean => {
    const now = new Date();
    return now > expiryDate;
  }, []);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      // Reset filters when searching
      if (query !== searchQuery) {
        setStatusFilter("");
        setIssuedByFilter("");
      }
    },
    [searchQuery]
  );

  const resetFilters = useCallback(() => {
    setStatusFilter("");
    setIssuedByFilter("");
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleIssuedByChange = useCallback((value: string) => {
    setIssuedByFilter(value);
    setCurrentPage(1);
  }, []);

  const handleViewModeChange = useCallback(
    (value: "all" | "duplicates" | "expiring") => {
      setViewMode(value);
      setCurrentPage(1);
    },
    []
  );

  const handleExpiringDaysChange = useCallback((value: string) => {
    const parsed = parseInt(value, 10);
    setExpiringDays(Number.isNaN(parsed) ? 30 : parsed);
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Permits</h2>
        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <Select
            value={viewMode}
            onValueChange={(v) => handleViewModeChange(v as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="duplicates">Duplicates</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === "expiring" && (
            <Select
              value={String(expiringDays)}
              onValueChange={handleExpiringDaysChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">In 7 days</SelectItem>
                <SelectItem value="14">In 14 days</SelectItem>
                <SelectItem value="30">In 30 days</SelectItem>
                <SelectItem value="60">In 60 days</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permits..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={handleStatusChange}
            disabled={viewMode !== "all"}
          >
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
          <Select
            value={issuedByFilter}
            onValueChange={handleIssuedByChange}
            disabled={viewMode !== "all"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by issuer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issuers</SelectItem>
              {uniqueIssuers.map((issuer) => (
                <SelectItem key={issuer} value={issuer}>
                  {issuer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {viewMode === "all" && (statusFilter || issuedByFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
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
                  permitConfig={permitConfig}
                  setIsDialogOpen={setIsDialogOpen}
                />
              </DialogContent>
            </Dialog>
          )}
          {false && (
            <Dialog open={isBulkResendOpen} onOpenChange={setIsBulkResendOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Bulk Resend
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Resend Permit Emails</DialogTitle>
                  <DialogDescription>
                    Resend permit emails for permits created within a time
                    window. Only active permits with an email will be included.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Mode</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={bulkMode === "hours" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBulkMode("hours")}
                        disabled={isBulkSending}
                      >
                        Last N hours
                      </Button>
                      <Button
                        type="button"
                        variant={bulkMode === "range" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBulkMode("range")}
                        disabled={isBulkSending}
                      >
                        Date range
                      </Button>
                    </div>
                  </div>
                  {bulkMode === "hours" && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium">
                        Hours back
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={168}
                        value={bulkHours}
                        onChange={(e) => setBulkHours(e.target.value)}
                        disabled={isBulkSending}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: 2 = resend for permits created in the last 2
                        hours.
                      </p>
                    </div>
                  )}
                  {bulkMode === "range" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium">
                          Start date
                        </label>
                        <Input
                          type="date"
                          value={bulkStartDate}
                          onChange={(e) => setBulkStartDate(e.target.value)}
                          disabled={isBulkSending}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium">
                          End date
                        </label>
                        <Input
                          type="date"
                          value={bulkEndDate}
                          onChange={(e) => setBulkEndDate(e.target.value)}
                          disabled={isBulkSending}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={isBulkSending}
                    onClick={() => setIsBulkResendOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    disabled={isBulkSending}
                    onClick={async () => {
                      try {
                        setIsBulkSending(true);

                        if (bulkMode === "hours") {
                          const hours = parseInt(bulkHours || "0", 10);
                          if (!hours || hours <= 0) {
                            toast.error("Please provide a valid hours value");
                            setIsBulkSending(false);
                            return;
                          }
                          const res =
                            await services.permit.bulkResendPermitEmails({
                              hoursBack: hours,
                            });
                          if (!res.success || !res.data) {
                            toast.error(
                              res.error || "Failed to bulk resend emails"
                            );
                          } else {
                            toast.success(
                              `Bulk resend complete. Total: ${res.data.total}, sent: ${res.data.emailed}, skipped: ${res.data.skipped}`
                            );
                          }
                        } else {
                          if (!bulkStartDate || !bulkEndDate) {
                            toast.error(
                              "Please select both start and end date"
                            );
                            setIsBulkSending(false);
                            return;
                          }
                          const res =
                            await services.permit.bulkResendPermitEmails({
                              startDate: bulkStartDate,
                              endDate: bulkEndDate,
                            });
                          if (!res.success || !res.data) {
                            toast.error(
                              res.error || "Failed to bulk resend emails"
                            );
                          } else {
                            toast.success(
                              `Bulk resend complete. Total: ${res.data.total}, sent: ${res.data.emailed}, skipped: ${res.data.skipped}`
                            );
                          }
                        }

                        setIsBulkResendOpen(false);
                      } catch (e) {
                        console.error(e);
                        toast.error(
                          "An error occurred while bulk resending emails"
                        );
                      } finally {
                        setIsBulkSending(false);
                      }
                    }}
                  >
                    {isBulkSending ? "Sending..." : "Resend emails"}
                  </Button>
                </div>
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
                    <TableHead>Card</TableHead>
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
                        <Skeleton className="w-4 h-4" />
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
                  <TableHead>Card</TableHead>
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
                        <Link
                          href={`/dashboard/permits/${permit.id}`}
                          className="text-blue-600 hover:underline font-mono"
                        >
                          {permit.originalCode}
                        </Link>
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
                        <Checkbox
                          checked={permit.cardDelivered}
                          disabled={!permissions.isExecutive}
                          onCheckedChange={async (checked) => {
                            try {
                              const res = await services.permit.setCardDelivered(
                                permit.id,
                                checked === true
                              );
                              if (res.success) {
                                queryClient.invalidateQueries({ queryKey: ["permits"] });
                              } else {
                                toast.error(res.error || "Failed to update card status");
                              }
                            } catch {
                              toast.error("Failed to update card status");
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {permit.status === "active" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevoke(permit.id)}
                              title="Revoke Permit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {permit.status === "revoked" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(permit.id)}
                              title="Delete Permit"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          {permit.status === "revoked" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!permissions.isExecutive) {
                                  toast.error(
                                    "You don't have permission to reactivate permits"
                                  );
                                  return;
                                }
                                try {
                                  const res = await services.permit.reactivate(
                                    permit.id
                                  );
                                  if (res.success) {
                                    toast.success(
                                      "Permit reactivated successfully"
                                    );
                                    queryClient.invalidateQueries({
                                      queryKey: ["permits"],
                                    });
                                  } else {
                                    toast.error(
                                      res.error || "Failed to reactivate permit"
                                    );
                                  }
                                } catch (e) {
                                  console.error(e);
                                  toast.error("Failed to reactivate permit");
                                }
                              }}
                              title="Reactivate Permit"
                            >
                              Reactivate
                            </Button>
                          )}
                          {permit.status !== "revoked" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openResendDialog(permit.id)}
                              title="Resend Permit"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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

      {/* Resend Permit Modal */}
      <ResendPermitModal
        isOpen={isResendDialogOpen}
        onClose={() => setIsResendDialogOpen(false)}
        permitId={resendPermitId || 0}
        currentEmail={resendEmail}
        currentPhone={resendPhone}
      />
    </div>
  );
}
