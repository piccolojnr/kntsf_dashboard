import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Trophy } from "lucide-react";
import { PublicElectionResultsListClient } from "./client";
import { Button } from "@/components/ui/button";
import { getElectionUrl } from "@/lib/election-url";

export default function PublicElectionResultsPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 px-6 py-8 text-white shadow-sm dark:border-slate-700/80 md:px-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-[1.3fr_0.8fr] md:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <BarChart3 className="h-4 w-4" />
              Published Results
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse election outcomes that have been released to students.</h1>
              <p className="max-w-2xl text-sm text-slate-200 md:text-base">
                Review turnout, published positions, and final outcomes for completed elections. Archived elections are not shown on the public side.
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
            <div className="flex items-center gap-2 font-medium">
              <Trophy className="h-4 w-4 text-amber-300" />
              Public release
            </div>
            <p>Only elections whose results are available to students appear here.</p>
            <p>Approval-vote positions show approved, vacant, or separately filled outcomes alongside yes and no totals.</p>
            <Button asChild variant="secondary" className="mt-2 w-fit">
              <Link href={getElectionUrl("/elections")}>
                Return to Active Elections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Suspense fallback={<div>Loading published results...</div>}>
        <PublicElectionResultsListClient />
      </Suspense>
    </div>
  );
}
