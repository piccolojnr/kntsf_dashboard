"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PollForm } from "./poll-form";
import { checkPollHasVotesAction } from "@/app/actions/poll.actions";
import { AlertTriangle, Users } from "lucide-react";

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

export function EditPollDialog({
  open,
  onOpenChange,
  onSuccess,
  poll,
}: EditPollDialogProps) {
  const [voteCount, setVoteCount] = useState(0);
  const [hasVotes, setHasVotes] = useState(false);

  // Check for votes when dialog opens with a poll
  useEffect(() => {
    if (open && poll?.id) {
      checkPollHasVotesAction(poll.id).then((result) => {
        if (result.success && result.data) {
          setHasVotes(result.data.hasVotes);
          setVoteCount(result.data.voteCount);
        }
      });
    }
  }, [open, poll?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Poll</DialogTitle>
            {hasVotes && (
              <Badge
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <Users className="w-3 h-3" />
                <span>{voteCount} votes</span>
              </Badge>
            )}
          </div>
          {hasVotes && (
            <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
              <AlertTriangle className="w-4 h-4" />
              <span>
                This poll has active votes. Changing options will delete them.
              </span>
            </div>
          )}
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
              options: poll.options.map((opt) => ({ text: opt.text })),
            }}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
