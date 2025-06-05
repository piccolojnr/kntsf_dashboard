import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { StudentsClient } from "./client";

export default async function StudentsPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <StudentsClient user={user} permissions={permissions} />;
}
