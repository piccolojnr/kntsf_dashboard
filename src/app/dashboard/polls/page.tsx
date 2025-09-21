import { Suspense } from "react";
import { PollsClient } from "./client";

export default function PollsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Polls</h1>
          <p className="text-muted-foreground">
            Create and manage student polls to gather feedback and opinions.
          </p>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading polls...</div>}>
        <PollsClient />
      </Suspense>
    </div>
  );
}
