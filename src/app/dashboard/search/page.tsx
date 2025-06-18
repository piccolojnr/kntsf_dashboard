import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { SearchClient } from "./client";

export default async function SearchPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  return <SearchClient permissions={permissions} />;
}
