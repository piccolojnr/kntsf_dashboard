"use client";

import { useCallback, useState } from "react";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  CreditCard, 
  FileText, 
  Mail, 
  Phone, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AccessRoles } from "@/lib/role";
import { SessionUser } from "@/lib/types/common";
import { useQueryClient } from "@tanstack/react-query";
import services from "@/lib/services";
import Link from "next/link";
import { ResendPermitModal } from "@/components/app/permit/resend-permit-modal";

interface PermitDetailClientProps {
  user: SessionUser;
  permissions: AccessRoles;
  permit: any; // Will be properly typed based on the service response
}

export function PermitDetailClient({ permissions, permit }: PermitDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isExpired = new Date() > new Date(permit.expiryDate);
  const status = isExpired ? "expired" : permit.status;
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(permit.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "revoked":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "expired":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "revoked":
        return "bg-red-100 text-red-800 border-red-200";
      case "expired":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = () => {
    switch (permit.payment?.status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openResendDialog = useCallback(() => {
    setIsResendDialogOpen(true);
  }, []);



  const handleRevoke = useCallback(async () => {
    if (!permissions.isExecutive) {
      toast.error("You don't have permission to revoke permits");
      return;
    }

    if (!confirm("Are you sure you want to revoke this permit?")) return;

    try {
      setIsRevoking(true);
      const response = await services.permit.revoke(permit.id);
      if (response.success && response.data) {
        const { student, originalCode, ...permitData } = response.data;

        // Send revocation email
        await services.email.sendRevokedPermitEmail({
          permit: {
            amountPaid: permitData.amountPaid,
            expiryDate: permitData.expiryDate,
            id: permitData.id + "",
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
        router.refresh();
      } else {
        toast.error(response.error || "Failed to revoke permit");
      }
    } catch (error) {
      console.error("Error revoking permit:", error);
      toast.error("Failed to revoke permit");
    } finally {
      setIsRevoking(false);
    }
  }, [permissions.isExecutive, queryClient, permit.id, router]);

  const handleDelete = useCallback(async () => {
    if (!permissions.isExecutive) {
      toast.error("You don't have permission to delete permits");
      return;
    }

    if (!confirm("Are you sure you want to delete this permit? This action cannot be undone and will also delete the associated payment record.")) return;

    try {
      setIsDeleting(true);
      const response = await services.permit.deletePermit(permit.id);
      if (response.success) {
        toast.success("Permit deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["permits"] });
        router.push("/dashboard/permits");
      } else {
        toast.error(response.error || "Failed to delete permit");
      }
    } catch (error) {
      console.error("Error deleting permit:", error);
      toast.error("Failed to delete permit");
    } finally {
      setIsDeleting(false);
    }
  }, [permissions.isExecutive, queryClient, permit.id, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permit Details</h1>
            <p className="text-muted-foreground">
              Permit Code: {permit.originalCode}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {permit.status === "active" && (
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? "Revoking..." : "Revoke Permit"}
            </Button>
          )}
          {permit.status === "revoked" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permit"}
            </Button>
          )}
          {permit.status !== "revoked" && (
            <Button
              variant="outline"
              onClick={openResendDialog}
            >
              <Mail className="w-4 h-4 mr-2" />
              Resend Email
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Permit Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Permit Status
                {getStatusIcon()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor()} border`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className={`text-2xl font-bold ${
                    daysRemaining <= 30 ? "text-red-600" : 
                    daysRemaining <= 60 ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {daysRemaining}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {format(new Date(permit.startDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">
                    {format(new Date(permit.expiryDate), "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{permit.student.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <Link
                    href={`/dashboard/students/${permit.student.studentId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {permit.student.studentId}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{permit.student.course || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-medium">{permit.student.level || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{permit.student.email || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{permit.student.number || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {permit.payment ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        GHS {permit.amountPaid.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge className={`${getPaymentStatusColor()} border`}>
                        {permit.payment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Reference</p>
                      <p className="font-medium font-mono text-sm">
                        {permit.payment.paymentReference}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{permit.payment.currency}</p>
                    </div>
                  </div>
                  
                  {permit.payment.paystackRef && (
                    <div>
                      <p className="text-sm text-muted-foreground">Paystack Reference</p>
                      <p className="font-medium font-mono text-sm">
                        {permit.payment.paystackRef}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Date</p>
                      <p className="font-medium">
                        {format(new Date(permit.payment.createdAt), "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {format(new Date(permit.payment.updatedAt), "PPP")}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Permit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Permit Code</p>
                <p className="font-mono font-bold text-lg">{permit.originalCode}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Issued By</p>
                <p className="font-medium">
                  {permit.issuedBy?.username || "Unknown"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">
                  {format(new Date(permit.createdAt), "PPP")}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(permit.updatedAt), "PPP")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {permissions.isExecutive && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {permit.status === "active" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleRevoke}
                    disabled={isRevoking}
                  >
                    {isRevoking ? "Revoking..." : "Revoke Permit"}
                  </Button>
                )}
                
                {permit.status === "revoked" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Permit"}
                  </Button>
                )}
                
                {permit.status !== "revoked" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={openResendDialog}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Email
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Resend Permit Modal */}
      <ResendPermitModal
        isOpen={isResendDialogOpen}
        onClose={() => setIsResendDialogOpen(false)}
        permitId={permit.id}
        currentEmail={permit.student.email || ""}
        currentPhone={permit.student.number || ""}
      />
    </div>
  );
}
