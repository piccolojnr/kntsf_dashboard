import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { StudentDetailsClient } from "./client";

export default async function StudentDetailsPage({
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
    <StudentDetailsClient
      user={user}
      permissions={permissions}
      studentId={resolvedParams.id}
    />
  );
}
