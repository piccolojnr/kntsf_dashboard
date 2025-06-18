import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { PermitsClient } from "./client";

export default async function PermitsPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return <PermitsClient user={user} permissions={permissions} />;
}
