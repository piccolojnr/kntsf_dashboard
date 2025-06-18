import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import ReportsClient from "./client";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return <ReportsClient permissions={permissions} />;
}
