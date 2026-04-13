"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getElectionResultsAction } from "@/app/actions/election.actions";
import { ElectionResults } from "@/components/app/election/election-results";
import { Button } from "@/components/ui/button";

interface PublicElectionResultsClientProps {
  electionId: number;
}

export function PublicElectionResultsClient({ electionId }: PublicElectionResultsClientProps) {
  const [election, setElection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElectionResultsAction(electionId).then((result) => {
      if (!result.success) {
        toast.error(result.error || "Unable to load election results");
        setLoading(false);
        return;
      }
      setElection(result.data);
      setLoading(false);
    });
  }, [electionId]);

  if (loading) {
    return <div className="py-12 text-center">Loading results...</div>;
  }

  if (!election) {
    return <div className="py-12 text-center">Election results not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/elections/results">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Link>
      </Button>
      <ElectionResults election={election} />
    </div>
  );
}
