import { notFound } from "next/navigation";
import { getElectionByIdAction } from "@/app/actions/election.actions";
import { ElectionForm } from "@/components/app/election/election-form";

interface EditElectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditElectionPage({ params }: EditElectionPageProps) {
  const electionId = Number((await params).id);
  if (Number.isNaN(electionId)) {
    notFound();
  }

  const result = await getElectionByIdAction(electionId);
  if (!result.success || !result.data) {
    notFound();
  }

  return <ElectionForm initialData={result.data} />;
}
