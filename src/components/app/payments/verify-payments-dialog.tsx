"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import services from "@/lib/services";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, SkipForward } from "lucide-react";

type FilterMode = "today" | "dateRange" | "single";

interface VerifyPaymentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VerifyPaymentsDialog({
  open,
  onOpenChange,
  onSuccess,
}: VerifyPaymentsDialogProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>("today");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    errors: Array<{ paymentId: number; error: string }>;
  } | null>(null);

  const handleVerify = async () => {
    // Validation
    if (filterMode === "dateRange" && (!startDate || !endDate)) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (filterMode === "single" && !reference.trim()) {
      toast.error("Please enter a payment reference");
      return;
    }

    setIsVerifying(true);
    setResults(null);

    try {
      const filters: {
        startDate?: string;
        endDate?: string;
        reference?: string;
      } = {};

      if (filterMode === "today") {
        const today = new Date().toISOString().split("T")[0];
        filters.startDate = today;
        filters.endDate = today;
      } else if (filterMode === "dateRange") {
        filters.startDate = startDate;
        filters.endDate = endDate;
      } else if (filterMode === "single") {
        filters.reference = reference.trim();
      }

      const response = await services.payment.verifyPaymentsBulk(filters);

      if (!response.success) {
        toast.error(response.error || "Failed to verify payments");
        return;
      }

      setResults(response.data!);
      toast.success(
        `Verification complete: ${response.data!.successful} successful, ${
          response.data!.failed
        } failed, ${response.data!.skipped} skipped`
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error verifying payments:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while verifying payments"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    if (!isVerifying) {
      setFilterMode("today");
      setStartDate("");
      setEndDate("");
      setReference("");
      setResults(null);
      onOpenChange(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Payments</DialogTitle>
          <DialogDescription>
            Verify payment transactions with ExpressPay. Payments without a
            gateway reference (token) will be skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filter Mode Selection */}
          <div className="space-y-3">
            <Label>Verification Mode</Label>
            <RadioGroup
              value={filterMode}
              onValueChange={(value) => setFilterMode(value as FilterMode)}
              disabled={isVerifying}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="today" />
                <Label htmlFor="today" className="font-normal cursor-pointer">
                  Today Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dateRange" id="dateRange" />
                <Label
                  htmlFor="dateRange"
                  className="font-normal cursor-pointer"
                >
                  Date Range
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="font-normal cursor-pointer">
                  Single Payment (by Reference)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Range Inputs */}
          {filterMode === "dateRange" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isVerifying}
                  max={getTodayDate()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isVerifying}
                  max={getTodayDate()}
                  min={startDate || undefined}
                />
              </div>
            </div>
          )}

          {/* Single Reference Input */}
          {filterMode === "single" && (
            <div className="space-y-2">
              <Label htmlFor="reference">Payment Reference</Label>
              <Input
                id="reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                disabled={isVerifying}
                placeholder="Enter payment reference or token"
              />
            </div>
          )}

          {/* Loading State */}
          {isVerifying && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Verifying payments...</span>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <Progress value={undefined} className="h-2" />
              <p className="text-xs text-muted-foreground">
                This may take a few moments. Please do not close this dialog.
              </p>
            </div>
          )}

          {/* Results Display */}
          {results && !isVerifying && (
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-semibold text-lg">Verification Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {results.total}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Processed</p>
                    <p className="text-xs text-muted-foreground">
                      Payments verified
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      {results.successful}
                    </p>
                    <p className="text-xs text-muted-foreground">Successful</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      {results.failed}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SkipForward className="w-8 h-8 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {results.skipped}
                    </p>
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  </div>
                </div>
              </div>

              {/* Errors List */}
              {results.errors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-red-600">
                    Errors ({results.errors.length}):
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {results.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded"
                      >
                        <span className="font-medium">
                          Payment #{error.paymentId}:
                        </span>{" "}
                        {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isVerifying}
          >
            {results ? "Close" : "Cancel"}
          </Button>
          {!results && (
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Payments"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
