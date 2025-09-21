"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PollResults } from "./poll-results";

interface Poll {
  id: number;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  showResults: boolean;
  createdAt: string;
  updatedAt: string;
  options: {
    id: number;
    text: string;
  }[];
  votes: {
    id: number;
    student: {
      name?: string;
      studentId: string;
    };
  }[];
}

interface ViewResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll | null;
}

export function ViewResultsDialog({ open, onOpenChange, poll }: ViewResultsDialogProps) {
  // Transform poll data to include results for PollResults component
  const pollWithResults = poll ? {
    ...poll,
    results: poll.options.map(option => {
      // For now, we'll create mock results since the actual vote-option relationship
      // needs to be properly established in the database query
      // This is a simplified version that distributes votes evenly
      const totalVotes = poll.votes.length;
      const optionCount = poll.options.length;
      const baseVotes = Math.floor(totalVotes / optionCount);
      const remainder = totalVotes % optionCount;
      
      // Give the first few options one extra vote if there's a remainder
      const voteCount = baseVotes + (option.id <= remainder ? 1 : 0);
      
      return {
        id: option.id,
        text: option.text,
        voteCount: voteCount,
        percentage: totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
      };
    }),
    totalVotes: poll.votes.length
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Poll Results</DialogTitle>
        </DialogHeader>
        {pollWithResults && (
          <PollResults poll={pollWithResults as any} />
        )}
      </DialogContent>
    </Dialog>
  );
}
