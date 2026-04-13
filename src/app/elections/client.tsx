"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { ArrowRight, Clock3, Users } from "lucide-react";
import { toast } from "sonner";
import { getActiveElectionsForVotingAction } from "@/app/actions/election.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ElectionsVotingClient() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveElectionsForVotingAction().then((result) => {
      if (!result.success) {
        toast.error(result.error || "Unable to load elections");
        setLoading(false);
        return;
      }
      setElections(result.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="py-12 text-center">Loading elections...</div>;
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          There are no active elections right now.
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
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Active now
                  </span>
                  <span className="rounded-full bg-slate-200 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {election.positions.length} position
                    {election.positions.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <Button asChild>
                <Link href={`/elections/${election.id}`}>
                  Open Ballot
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
          <CardContent className="grid gap-6 p-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <Clock3 className="h-4 w-4" />
                  Starts
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(election.startAt), "MMM dd, yyyy h:mm a")}
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <Clock3 className="h-4 w-4" />
                  Ends
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(election.endAt), "MMM dd, yyyy h:mm a")}
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <Users className="h-4 w-4" />
                  Candidate Preview
                </div>
                <div className="flex items-center -space-x-3">
                  {election.positions
                    .flatMap((position: any) => position.candidates)
                    .slice(0, 4)
                    .map((candidate: any, index: number) => (
                      <CandidateAvatar
                        key={`${candidate.id}-${index}`}
                        candidate={candidate}
                      />
                    ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {election.positions.map((position: any) => (
                <div
                  key={position.id}
                  className="rounded-2xl border bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {position.title}
                    </p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {position.votingMode === "CANDIDATE_APPROVAL"
                        ? "Approve / Reject"
                        : `${position.candidates.length} candidates`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {position.candidates.slice(0, 2).map((candidate: any) => (
                      <CandidateAvatar
                        key={candidate.id}
                        candidate={candidate}
                        compact
                      />
                    ))}
                    <div className="text-xs text-muted-foreground">
                      {position.candidates
                        .map(
                          (candidate: any) =>
                            candidate.student.name ||
                            candidate.student.studentId,
                        )
                        .join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CandidateAvatar({
  candidate,
  compact = false,
}: {
  candidate: any;
  compact?: boolean;
}) {
  const size = compact ? "h-10 w-10" : "h-14 w-14";

  if (!candidate.photoUrl) {
    return (
      <div
        className={`flex ${size} items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-medium text-slate-500 shadow-sm dark:border-slate-900 dark:bg-slate-700 dark:text-slate-300`}
      >
        N/A
      </div>
    );
  }

  return (
    <div
      className={`relative ${size} overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-slate-900`}
    >
      <Image
        src={candidate.photoUrl}
        alt={`${candidate.student.name || candidate.student.studentId} profile`}
        fill
        className="object-cover"
      />
    </div>
  );
}
