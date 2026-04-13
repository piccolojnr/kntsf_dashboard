"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowRight, BarChart3, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { getPublicElectionResultsListAction } from "@/app/actions/election.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getElectionUrl } from "@/lib/election-url";

export function PublicElectionResultsListClient() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicElectionResultsListAction().then((result) => {
      if (!result.success) {
        toast.error(result.error || "Unable to load election results");
        setLoading(false);
        return;
      }
      setElections(result.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">Loading published results...</div>
    );
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No public election results are available right now.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      {elections.map((election) => (
        <Card
          key={election.id}
          className="overflow-hidden border-slate-200 dark:border-slate-700 pt-0"
        >
          <CardHeader className="border-b bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/60 pt-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{election.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-cyan-100 px-3 py-1 font-medium text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-300">
                    Results available
                  </span>
                  <span className="rounded-full bg-slate-200 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {election.positions.length} position
                    {election.positions.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <Button asChild>
                <Link href={getElectionUrl(`/elections/${election.id}/results`)}>
                  View Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {election.description ? (
              <p className="text-sm text-muted-foreground">
                {election.description}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <Calendar className="h-4 w-4" />
                  Ended
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(election.endAt), "MMM dd, yyyy h:mm a")}
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <Users className="h-4 w-4" />
                  Turnout
                </div>
                <p className="text-sm text-muted-foreground">
                  {election.turnout} / {election.totalEligibleVoters} voters
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {election.turnoutRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <BarChart3 className="h-4 w-4" />
                  Positions
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {election.positions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Published on the public results board
                </p>
              </div>
            </div>
            <div className="rounded-2xl border bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                Included offices
              </p>
              <div className="flex flex-wrap gap-2">
                {election.positions.map((position: any) => (
                  <span
                    key={position.id}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {position.title}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
