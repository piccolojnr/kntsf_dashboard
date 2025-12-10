"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: number;
    paymentReference: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
    student: {
      studentId: string;
      name: string;
      email: string;
      course: string;
      level: string;
    };
    permit?: {
      id: number;
      permitCode: string;
      originalCode: string;
      status: string;
      createdAt: Date;
    } | null;
    metadata?: Record<string, any>;
    gatewayRef?: string | null;
  } | null;
}

export function PaymentDetailsDialog({
  open,
  onOpenChange,
  payment,
}: PaymentDetailsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!payment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "default";
      case "FAILED":
        return "destructive";
      case "PENDING":
        return "secondary";
      default:
        return "outline";
    }
  };

  const CopyableField = ({
    label,
    value,
    fieldId,
  }: {
    label: string;
    value: string;
    fieldId: string;
  }) => (
    <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-md">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-mono break-all">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 shrink-0 ml-2"
        onClick={() => copyToClipboard(value, fieldId)}
      >
        {copiedField === fieldId ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto xl:min-w-4xl lg:min-w-3xl sm:min-w-sm">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Complete information for payment {payment.paymentReference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Status Section */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">Payment Status</h3>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusColor(payment.status)}>
                {payment.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(payment.createdAt), "PPP p")}
              </span>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold mb-3">Payment Information</h3>
            <div className="space-y-2">
              <CopyableField
                label="Payment Reference"
                value={payment.paymentReference}
                fieldId="paymentReference"
              />
              <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-md">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Amount
                  </p>
                  <p className="text-sm font-semibold">
                    {payment.amount} {payment.currency}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="font-semibold mb-3">Student Information</h3>
            <div className="space-y-2">
              <CopyableField
                label="Student ID"
                value={payment.student.studentId}
                fieldId="studentId"
              />
              <div className="py-2 px-3 bg-muted rounded-md">
                <p className="text-xs font-medium text-muted-foreground">
                  Full Name
                </p>
                <p className="text-sm">{payment.student.name}</p>
              </div>
              <CopyableField
                label="Email"
                value={payment.student.email}
                fieldId="studentEmail"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="py-2 px-3 bg-muted rounded-md">
                  <p className="text-xs font-medium text-muted-foreground">
                    Course
                  </p>
                  <p className="text-sm">{payment.student.course || "N/A"}</p>
                </div>
                <div className="py-2 px-3 bg-muted rounded-md">
                  <p className="text-xs font-medium text-muted-foreground">
                    Level
                  </p>
                  <p className="text-sm">{payment.student.level || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Information */}
          <div>
            <h3 className="font-semibold mb-3">Gateway Information</h3>
            <div className="space-y-2">
              <div className="py-2 px-3 bg-muted rounded-md">
                <p className="text-xs font-medium text-muted-foreground">
                  Payment ID
                </p>
                <p className="text-sm font-mono">{payment.id}</p>
              </div>
              {payment.gatewayRef && (
                <CopyableField
                  label="Gateway Reference (Token)"
                  value={payment.gatewayRef}
                  fieldId="gatewayRef"
                />
              )}
            </div>
          </div>

          {/* Permit Information */}
          {payment.permit && (
            <div>
              <h3 className="font-semibold mb-3">Associated Permit</h3>
              <div className="space-y-2 border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Permit Created</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(payment.permit.createdAt), "PPP p")}
                  </span>
                </div>
                <CopyableField
                  label="Permit Code"
                  value={
                    payment.permit.originalCode ||
                    payment.permit.permitCode +
                      " Please decode to get original code."
                  }
                  fieldId="permitCode"
                />
                <div className="py-2 px-3 bg-white dark:bg-slate-900 rounded-md">
                  <p className="text-xs font-medium text-muted-foreground">
                    Permit Status
                  </p>
                  <p className="text-sm">
                    <Badge variant={getStatusColor(payment.permit.status)}>
                      {payment.permit.status}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata (if available) */}
          {payment.metadata && Object.keys(payment.metadata).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Additional Metadata</h3>
              <div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(payment.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>
              Created:{" "}
              {format(new Date(payment.createdAt), "yyyy-MM-dd HH:mm:ss")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
