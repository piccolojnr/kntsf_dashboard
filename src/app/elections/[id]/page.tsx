import { Suspense } from "react";
import { ElectionBallotClient } from "./client";

interface ElectionBallotPageProps {
  params: Promise<{ id: string }>;
}

export default async function ElectionBallotPage({ params }: ElectionBallotPageProps) {
  const electionId = Number((await params).id);

  if (Number.isNaN(electionId)) {
    return <div className="container mx-auto px-4 py-10 text-center">Invalid election ID.</div>;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Suspense fallback={<div>Loading ballot...</div>}>
        <ElectionBallotClient electionId={electionId} />
      </Suspense>
    </div>
  );
}
