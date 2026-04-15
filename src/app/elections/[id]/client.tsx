"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Clock3, Vote } from "lucide-react";
import { toast } from "sonner";
import { getPublicElectionByIdAction } from "@/app/actions/election.actions";
import { ElectionBallot } from "@/components/app/election/election-ballot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getElectionUrl } from "@/lib/election-url";

interface ElectionBallotClientProps {
  electionId: number;
}

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function ElectionBallotClient({ electionId }: ElectionBallotClientProps) {
  const [election, setElection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    getPublicElectionByIdAction(electionId).then((result) => {
      if (!result.success) {
        toast.error(result.error || "Unable to load election");
        setLoading(false);
        return;
      }

      setElection(result.data);
      setLoading(false);
    });
  }, [electionId]);

  const countdown = useMemo(() => {
    if (!election) {
      return null;
    }

    const startAt = new Date(election.startAt).getTime();
    const remaining = Math.max(0, startAt - now);
    const totalSeconds = Math.floor(remaining / 1000);

    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    } satisfies CountdownParts;
  }, [election, now]);

  if (loading) {
    return <div className="py-12 text-center">Loading ballot...</div>;
  }

  if (!election) {
    return <div className="py-12 text-center">Election not found.</div>;
  }

  const startAt = new Date(election.startAt).getTime();
  const endAt = new Date(election.endAt).getTime();
  const votingOpen = election.status === "ACTIVE" && now >= startAt && now <= endAt;
  const votingClosed = now > endAt || ["CLOSED", "RESULTS_PUBLISHED", "ARCHIVED"].includes(election.status);
  const votingPending = !votingOpen && !votingClosed;
  const statusLabel = votingOpen
    ? "Voting open"
    : votingPending
      ? election.status === "ACTIVE"
        ? "Activated, waiting to open"
        : "Scheduled"
      : "Voting closed";

  if (votingOpen) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href={getElectionUrl("/elections")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Elections
          </Link>
        </Button>
        <ElectionBallot election={election} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href={getElectionUrl("/elections")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Elections
        </Link>
      </Button>

      <Card className="overflow-hidden border-slate-200 pt-0 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-10 text-white md:px-10">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              <Clock3 className="h-3 w-3" />
              {statusLabel}
            </Badge>
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/15" variant="outline">
              {election.positions.length} position{election.positions.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <CardTitle className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Voting opens soon
          </CardTitle>
          <p className="max-w-2xl text-sm text-slate-200 md:text-base">
            {election.status === "ACTIVE"
              ? "This election has been activated and will accept votes automatically when the timer reaches zero."
              : "This election is scheduled and will open once it is activated."}
          </p>
        </CardHeader>

        <CardContent className="space-y-8 p-6 md:p-10">
          <div className="grid gap-4 md:grid-cols-4">
            <TimerBlock label="Days" value={countdown?.days ?? 0} />
            <TimerBlock label="Hours" value={countdown?.hours ?? 0} />
            <TimerBlock label="Minutes" value={countdown?.minutes ?? 0} />
            <TimerBlock label="Seconds" value={countdown?.seconds ?? 0} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock
              label="Opens at"
              value={format(new Date(election.startAt), "MMM dd, yyyy h:mm a")}
              icon={<Clock3 className="h-4 w-4" />}
            />
            <InfoBlock
              label="Closes at"
              value={format(new Date(election.endAt), "MMM dd, yyyy h:mm a")}
              icon={<Vote className="h-4 w-4" />}
            />
          </div>

          {election.description ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
              {election.description}
            </div>
          ) : null}

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-950/40">
            Ballot access will unlock automatically when the countdown reaches zero.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimerBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 text-center text-white shadow-sm backdrop-blur">
      <div className="text-4xl font-black tabular-nums tracking-tight md:text-6xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-300">
        {label}
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
        {icon}
        {label}
      </div>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
