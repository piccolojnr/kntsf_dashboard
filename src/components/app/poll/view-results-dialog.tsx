"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PollResults } from "./poll-results";
import { DynamicPollManager } from "./dynamic-poll-manager";
import { getAllPollsAction } from "@/app/actions/poll.actions";

interface Poll {
  id: number;
  title: string;
  description?: string;
  type: "FIXED_OPTIONS" | "DYNAMIC_OPTIONS";
  startAt: string;
  endAt: string;
  showResults: boolean;
  createdAt: string;
  updatedAt: string;
  options: {
    id: number;
    text: string;
    createdBy?: {
      studentId: string;
      name?: string;
    };
    votes?: {
      id: number;
      student: {
        name?: string;
        studentId: string;
      };
    }[];
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
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(poll);

  // Refresh poll data when dialog opens
  useEffect(() => {
    if (open && poll) {
      setCurrentPoll(poll);
    }
  }, [open, poll]);

  const refreshPollData = async () => {
    if (!poll) return;
    
    try {
      const result = await getAllPollsAction();
      if (result.success && result.data) {
        const updatedPoll = result.data.find((p: any) => p.id === poll.id);
        if (updatedPoll) {
          setCurrentPoll(updatedPoll as any);
        }
      }
    } catch (error) {
      console.error("Error refreshing poll data:", error);
    }
  };

  // Helper function to get vote count for each option
  const getOptionVoteCount = (optionId: number) => {
    if (!currentPoll?.votes) return 0;
    return currentPoll.votes.filter((vote: any) => vote.optionId === optionId).length;
  };

  // Transform poll data to include results for PollResults component
  const pollWithResults = currentPoll ? {
    ...currentPoll,
    results: currentPoll.options.map(option => {
      const voteCount = getOptionVoteCount(option.id);
      const totalVotes = currentPoll.votes.length;
      
      return {
        id: option.id,
        text: option.text,
        voteCount: voteCount,
        percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
      };
    }),
    totalVotes: currentPoll.votes.length
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentPoll?.title} - {currentPoll?.type === "DYNAMIC_OPTIONS" ? "Dynamic Poll" : "Results"}
          </DialogTitle>
        </DialogHeader>
        {currentPoll && (
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Results</TabsTrigger>
              {currentPoll.type === "DYNAMIC_OPTIONS" && (
                <TabsTrigger value="manage">Manage Options</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="results" className="mt-6">
              {pollWithResults && (
                <PollResults poll={pollWithResults as any} />
              )}
            </TabsContent>
            {currentPoll.type === "DYNAMIC_OPTIONS" && (
              <TabsContent value="manage" className="mt-6">
                <DynamicPollManager
                  pollId={currentPoll.id}
                  options={currentPoll.options}
                  onOptionsChange={refreshPollData}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
