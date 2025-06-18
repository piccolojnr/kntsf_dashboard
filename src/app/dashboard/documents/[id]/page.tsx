import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { DocumentViewClient } from "./client";

export default async function DocumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  const permissions = await getPermissions({
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