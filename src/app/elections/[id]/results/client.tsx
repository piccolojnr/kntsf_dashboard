"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, Calendar, Trophy, Users } from "lucide-react";
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
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 px-6 py-8 text-white shadow-sm dark:border-slate-700/80 md:px-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-4">
            <Button asChild variant="secondary" className="w-fit">
              <Link href="/elections/results">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Results
              </Link>
            </Button>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
                <Trophy className="h-4 w-4" />
                Published Election Outcome
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{election.title}</h1>
              {election.description ? <p className="max-w-2xl text-sm text-slate-200 md:text-base">{election.description}</p> : null}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Ended
              </div>
              <p className="text-sm text-slate-200">{new Date(election.endAt).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Turnout
              </div>
              <p className="text-lg font-semibold">{election.turnoutRate.toFixed(1)}%</p>
              <p className="text-sm text-slate-200">
                {election.turnout} of {election.totalEligibleVoters} voters
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="h-4 w-4" />
                Published offices
              </div>
              <div className="flex flex-wrap gap-2">
                {election.positions.map((position: any) => (
                  <span key={position.id} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                    {position.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ElectionResults election={election} />
    </div>
  );
}
