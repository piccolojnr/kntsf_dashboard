import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { PermitsClient } from "./client";

export default async function PermitsPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <PermitsClient user={user} permissions={permissions} />;
}
