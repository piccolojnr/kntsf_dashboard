import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Vote } from "lucide-react";
import { ElectionsVotingClient } from "./client";
import { Button } from "@/components/ui/button";
import { getElectionUrl } from "@/lib/election-url";

export default function ElectionsVotingPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-sm dark:border-slate-700/80 md:px-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr] md:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <Vote className="h-4 w-4" />
              Student Elections
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Vote in active elections with full candidate profiles.</h1>
              <p className="max-w-2xl text-sm text-slate-200 md:text-base">
                Review each position, inspect candidate photos and profiles clearly, then submit one anonymous ballot as a verified student.
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
            <div className="flex items-center gap-2 font-medium">
              <Trophy className="h-4 w-4 text-amber-300" />
              Before you vote
            </div>
            <p>Candidate photos and profile summaries are shown directly on the ballot for easier comparison.</p>
            <p>Single-candidate positions use approve or reject voting. If rejected, the position may be left vacant or filled through a separate process if necessary.</p>
            <Button asChild variant="secondary" className="mt-2 w-fit">
              <Link href={getElectionUrl("/elections/results")}>
                View Published Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href={getElectionUrl("/elections/results")}>View Published Results</Link>
        </Button>
      </div>
      <Suspense fallback={<div>Loading elections...</div>}>
        <ElectionsVotingClient />
      </Suspense>
    </div>
  );
}
