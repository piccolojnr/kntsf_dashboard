import ClientOnly from "./client";
import { getPermissions } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/auth/auth";

export default async function Dashboard() {
  const user = await getCurrentUser();

  const permissions = await getPermissions({
    user,
  });

  return <ClientOnly user={user} permissions={permissions} />;
}
