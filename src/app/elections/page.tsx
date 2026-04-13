import { Suspense } from "react";
import { ElectionsVotingClient } from "./client";

export default function ElectionsVotingPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Active Elections</h1>
        <p className="text-muted-foreground">Verified students can vote once per active election.</p>
      </div>
      <Suspense fallback={<div>Loading elections...</div>}>
        <ElectionsVotingClient />
      </Suspense>
    </div>
  );
}
