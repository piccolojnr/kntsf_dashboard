import { Suspense } from "react";
import { PollDetailsClient } from "./client";

interface PollDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PollDetailsPage({ params }: PollDetailsPageProps) {
  const pollId = parseInt((await params).id);

  if (isNaN(pollId)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Invalid Poll ID</h1>
        <p className="text-muted-foreground">The poll ID provided is not valid.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading poll details...</div>}>
        <PollDetailsClient pollId={pollId} />
      </Suspense>
    </div>
  );
}
