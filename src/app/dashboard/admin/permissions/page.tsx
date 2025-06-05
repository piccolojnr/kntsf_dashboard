import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { PermissionsClient } from "./client";

export default async function PermissionsPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <PermissionsClient permissions={permissions} />;
}
