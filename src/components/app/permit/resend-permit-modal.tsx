"use client";

import { useState, useEffect } from "react";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import services from "@/lib/services";

interface ResendPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
  permitId: number;
  currentEmail: string;
  currentPhone: string;
}

export function ResendPermitModal({
  isOpen,
  onClose,
  permitId,
  currentEmail,
  currentPhone,
}: ResendPermitModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(currentEmail || "");
  const [phone, setPhone] = useState(currentPhone || "");
  const [isResending, setIsResending] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setEmail(currentEmail || "");
    setPhone(currentPhone || "");
  }, [currentEmail, currentPhone]);

  const handleConfirmResend = async () => {
    try {
      setIsResending(true);
      
      // Update student information if changed
      if (email !== currentEmail || phone !== currentPhone) {
        // First, get the permit to find the student ID
        const permitResponse = await services.permit.getById(permitId);
        if (permitResponse.success && permitResponse.data) {
          const studentId = permitResponse.data.student.id;
          
          // Update student information
          await services.student.update(studentId.toString(), {
            email: email.trim() || null,
            number: phone.trim() || null,
          });
        }
      }

      // Resend permit email
      const response = await services.permit.resendPermitEmail(permitId, email);
      if (response.success) {
        toast.success("Permit email resent successfully");
        onClose();
        queryClient.invalidateQueries({ queryKey: ["permits"] });
        queryClient.invalidateQueries({ queryKey: ["students"] });
      } else {
        toast.error(response.error || "Failed to resend permit email");
      }
    } catch (error) {
      console.error("Error resending permit email:", error);
      toast.error("Failed to resend permit email");
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setEmail(currentEmail || "");
    setPhone(currentPhone || "");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resend Permit Email</DialogTitle>
          <DialogDescription>
            Update the student&apos;s contact information if needed, then resend the permit and receipt emails.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Student Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Student Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isResending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmResend} 
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
