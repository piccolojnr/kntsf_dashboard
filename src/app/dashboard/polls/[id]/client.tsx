"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { PollResults } from "@/components/app/poll/poll-results";
import { getPollResultsAction } from "@/app/actions/poll.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PollDetailsClientProps {
  pollId: number;
}

export function PollDetailsClient({ pollId }: PollDetailsClientProps) {
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPollResults = async () => {
    try {
      const result = await getPollResultsAction(pollId);
      if (result.success) {
        setPoll(result.data);
      } else {
        toast.error(result.error || "Failed to fetch poll results");
      }
    } catch (error) {
      console.error("Error fetching poll results:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPollResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading poll results...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Poll Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested poll could not be found.</p>
        <Button onClick={() => router.push("/dashboard/polls")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push("/dashboard/polls")}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Button>
        <Button onClick={fetchPollResults} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <PollResults poll={poll} />
    </div>
  );
}
