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
    optionId: number;
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
  // Helper function to get vote count for each option
  const getOptionVoteCount = (optionId: number) => {
    if (!poll?.votes) return 0;
    return poll.votes.filter((vote: any) => vote.optionId === optionId).length;
  };

  // Transform poll data to include results for PollResults component
  const pollWithResults = poll ? {
    ...poll,
    results: poll.options.map(option => {
      const voteCount = getOptionVoteCount(option.id);
      const totalVotes = poll.votes.length;
      
      return {
        id: option.id,
        text: option.text,
        voteCount: voteCount,
        percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
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
