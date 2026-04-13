import { Suspense } from "react";
import { PublicElectionResultsListClient } from "./client";

export default function PublicElectionResultsPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Published Election Results</h1>
        <p className="text-muted-foreground">
          View election outcomes that have been released to students. Archived elections are not shown here.
        </p>
      </div>
      <Suspense fallback={<div>Loading published results...</div>}>
        <PublicElectionResultsListClient />
      </Suspense>
    </div>
  );
}
