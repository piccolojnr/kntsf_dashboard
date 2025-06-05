import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { RolesClient } from "./client";

export default async function RolesPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <RolesClient permissions={permissions} />;
}
