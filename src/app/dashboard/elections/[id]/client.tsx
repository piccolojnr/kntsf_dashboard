"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getElectionResultsAction } from "@/app/actions/election.actions";
import { ElectionResults } from "@/components/app/election/election-results";
import { Button } from "@/components/ui/button";

const EXPORTABLE_STATUSES = ["CLOSED", "RESULTS_PUBLISHED", "ARCHIVED"];

interface ElectionDetailsClientProps {
  electionId: number;
}

export function ElectionDetailsClient({
  electionId,
}: ElectionDetailsClientProps) {
  const [election, setElection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchElection = async () => {
    setLoading(true);
    const result = await getElectionResultsAction(electionId, true);
    if (!result.success) {
      toast.error(result.error || "Unable to load election");
      setLoading(false);
      return;
    }
    setElection(result.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchElection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!election) {
    return <div className="py-12 text-center">Election not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/dashboard/elections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Elections
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {EXPORTABLE_STATUSES.includes(election.status) && (
            <Button asChild variant="outline">
              <a href={`/api/elections/${electionId}/export/pdf`} download>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={fetchElection}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      <ElectionResults election={election} />
    </div>
  );
}
