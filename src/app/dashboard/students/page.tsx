import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { StudentsClient } from "./client";

export default async function StudentsPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return <StudentsClient user={user} permissions={permissions} />;
}
