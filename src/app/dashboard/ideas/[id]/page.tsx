import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { IdeaViewClient } from "./client";

export default async function IdeaViewPage({
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
    <IdeaViewClient
      user={user}
      permissions={permissions}
      ideaId={resolvedParams.id}
    />
  );
}
