"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PollForm } from "./poll-form";

interface Poll {
  id: number;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  showResults: boolean;
  options: {
    id: number;
    text: string;
  }[];
}

interface EditPollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  poll: Poll | null;
}

export function EditPollDialog({ open, onOpenChange, onSuccess, poll }: EditPollDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Poll</DialogTitle>
        </DialogHeader>
        {poll && (
          <PollForm
            initialData={{
              id: poll.id,
              title: poll.title,
              description: poll.description,
              startAt: poll.startAt,
              endAt: poll.endAt,
              showResults: poll.showResults,
              options: poll.options.map(opt => ({ text: opt.text }))
            }}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
