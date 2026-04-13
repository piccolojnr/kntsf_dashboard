import { Suspense } from "react";
import { ElectionDetailsClient } from "./client";

interface ElectionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ElectionDetailsPage({ params }: ElectionDetailsPageProps) {
  const electionId = Number((await params).id);

  if (Number.isNaN(electionId)) {
    return <div className="py-12 text-center">Invalid election ID.</div>;
  }

  return (
    <Suspense fallback={<div>Loading election...</div>}>
      <ElectionDetailsClient electionId={electionId} />
    </Suspense>
  );
}
