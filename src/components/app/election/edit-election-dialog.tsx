"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ElectionForm } from "./election-form";

interface EditElectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  election: any | null;
}

export function EditElectionDialog({ open, onOpenChange, onSuccess, election }: EditElectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Election</DialogTitle>
        </DialogHeader>
        {election ? <ElectionForm initialData={election} onSuccess={onSuccess} /> : null}
      </DialogContent>
    </Dialog>
  );
}
