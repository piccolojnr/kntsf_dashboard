"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getElectionBallotAction } from "@/app/actions/election.actions";
import { ElectionBallot } from "@/components/app/election/election-ballot";
import { Button } from "@/components/ui/button";

interface ElectionBallotClientProps {
  electionId: number;
}

export function ElectionBallotClient({ electionId }: ElectionBallotClientProps) {
  const [election, setElection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElectionBallotAction(electionId).then((result) => {
      if (!result.success) {
        toast.error(result.error || "Unable to load ballot");
        setLoading(false);
        return;
      }
      setElection(result.data);
      setLoading(false);
    });
  }, [electionId]);

  if (loading) {
    return <div className="py-12 text-center">Loading ballot...</div>;
  }

  if (!election) {
    return <div className="py-12 text-center">Election not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/elections">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Elections
        </Link>
      </Button>
      <ElectionBallot election={election} />
    </div>
  );
}
