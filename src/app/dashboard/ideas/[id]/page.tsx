import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { IdeaViewClient } from "./client";

export default async function IdeaViewPage({
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
    <IdeaViewClient
      user={user}
      permissions={permissions}
      ideaId={resolvedParams.id}
    />
  );
} 