import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return <SettingsClient user={user} permissions={permissions} />;
}
