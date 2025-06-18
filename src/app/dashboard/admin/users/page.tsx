import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { UsersClient } from "./client";

export default async function UsersPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return <UsersClient permissions={permissions} user={user} />;
}
