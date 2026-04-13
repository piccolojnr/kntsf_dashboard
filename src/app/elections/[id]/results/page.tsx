import { Suspense } from "react";
import { PublicElectionResultsClient } from "./client";

interface PublicElectionResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicElectionResultsDetailPage({ params }: PublicElectionResultsPageProps) {
  const electionId = Number((await params).id);

  if (Number.isNaN(electionId)) {
    return <div className="container mx-auto px-4 py-10 text-center">Invalid election ID.</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<div>Loading results...</div>}>
        <PublicElectionResultsClient electionId={electionId} />
      </Suspense>
    </div>
  );
}
