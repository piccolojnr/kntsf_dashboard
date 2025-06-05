import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import ReportsClient from "./client";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <ReportsClient permissions={permissions} />;
}
