"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface VoteDeletionWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  voteCount: number;
  pollTitle: string;
}

export function VoteDeletionWarning({
  open,
  onOpenChange,
  onConfirm,
  voteCount,
  pollTitle,
}: VoteDeletionWarningProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <DialogTitle>Delete Existing Votes?</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            <p className="mb-3">
              <strong>&ldquo;{pollTitle}&rdquo;</strong> has{" "}
              <strong>{voteCount} existing vote(s)</strong>.
            </p>
            <p className="mb-3">
              Updating the poll options will{" "}
              <strong>permanently delete all existing votes</strong>. This
              action cannot be undone.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Alternative:</strong> Consider creating a new poll instead
              of modifying this one to preserve existing vote data.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete Votes & Update Poll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
