import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { RolesClient } from "./client";

export default async function RolesPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return <RolesClient permissions={permissions} />;
}
