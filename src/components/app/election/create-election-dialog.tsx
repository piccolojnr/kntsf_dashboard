"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ElectionForm } from "./election-form";

interface CreateElectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateElectionDialog({ open, onOpenChange, onSuccess }: CreateElectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Election</DialogTitle>
        </DialogHeader>
        <ElectionForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
