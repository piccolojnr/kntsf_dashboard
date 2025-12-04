"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import services from "@/lib/services";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { MyPagination } from "@/components/common/my-pagination";
import { VerifyPaymentsDialog } from "@/components/app/payments/verify-payments-dialog";
import { Loader2, RefreshCw } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "sonner";

const STATUSES = ["SUCCESS", "FAILED", "PENDING", "CANCELLED"];
const PAGE_SIZE = 10;

export function PaymentsClient() {
  // Filter state
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  // Dialog state
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  // Row verification state
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Paginated query with optional search
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "payments-history-paginated",
      {
        status,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        currentPage,
        pageSize: PAGE_SIZE,
        query: debouncedSearchTerm.trim(),
      },
    ],
    queryFn: async () => {
      const response = await services.payment.getPaymentsPaginated({
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        page: currentPage,
        pageSize: PAGE_SIZE,
        query: debouncedSearchTerm.trim() || undefined,
      });
      if (!response.success)
        throw new Error(response.error || "Failed to load payments");
      return response.data;
    },
  });

  const effectivePayments = data?.data || [];

  const totalPages = data?.total
    ? Math.max(1, Math.ceil(data.total / PAGE_SIZE))
    : 1;

  // Reset to page 1 when filters change
  function handleFilterChange() {
    setCurrentPage(1);
  }

  const handleVerificationSuccess = () => {
    // Refresh the payments list after successful verification
    queryClient.invalidateQueries({
      queryKey: ["payments-history-paginated"],
    });
  };

  const handleVerifySingle = async (payment: any) => {
    try {
      setVerifyingId(payment.id);

      const response = await fetch(`/api/payments/verify-bulk`, {
        method: "POST",
        body: JSON.stringify({ reference: payment.paymentReference }),
      });
      handleVerificationSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to verify payment. Please try again.";
      toast.error(message);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Payments History</CardTitle>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <label className="block text-xs font-medium mb-1">Search</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm w-56"
                  placeholder="Name, Student ID, or Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVerifyDialogOpen(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verify Payments
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-6 items-end">
            <div className="sm:hidden w-full">
              <label className="block text-xs font-medium mb-1">Search</label>
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm w-full"
                placeholder="Name, Student ID, or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                className="border rounded px-2 py-1"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleFilterChange();
                }}
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">End Date</label>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Min Amount
              </label>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value);
                  handleFilterChange();
                }}
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Max Amount
              </label>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value);
                  handleFilterChange();
                }}
                min={0}
              />
            </div>
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{(error as Error).message}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Permit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effectivePayments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No payments found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      effectivePayments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.paymentReference}</TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {payment.student.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.student.studentId}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.student.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.amount} {payment.currency}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  payment.status === "SUCCESS"
                                    ? "default"
                                    : payment.status === "FAILED"
                                    ? "destructive"
                                    : payment.status === "PENDING"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {payment.status}
                              </Badge>
                              {payment.status === "PENDING" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  disabled={verifyingId === payment.id}
                                  onClick={() => handleVerifySingle(payment)}
                                >
                                  {verifyingId === payment.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    "Verify"
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.createdAt), "PPP p")}
                          </TableCell>
                          <TableCell>
                            {payment.permit ? (
                              <Link
                                href={`/dashboard/permits/${payment.permit.id}`}
                                className="underline text-blue-600"
                              >
                                View Permit
                              </Link>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-center">
                <MyPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <VerifyPaymentsDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        onSuccess={handleVerificationSuccess}
      />
    </>
  );
}
