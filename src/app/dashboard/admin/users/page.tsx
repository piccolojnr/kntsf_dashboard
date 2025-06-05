import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { UsersClient } from "./client";

export default async function UsersPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <UsersClient permissions={permissions} />;
}
