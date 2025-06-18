import ClientOnly from "./client";
import { getRole } from "@/lib/role";
import { getCurrentUser } from "@/lib/auth/auth";

export default async function Dashboard() {
  const user = await getCurrentUser();

  const permissions = await getRole({
    user,
  });

  return <ClientOnly user={user} permissions={permissions} />;
}
