import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <SettingsClient user={user} permissions={permissions} />;
}
