import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { DocumentViewClient } from "./client";

export default async function DocumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return (
    <DocumentViewClient
      user={user}
      permissions={permissions}
      documentId={resolvedParams.id}
    />
  );
}
