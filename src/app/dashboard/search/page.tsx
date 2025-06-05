import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";
import { SearchClient } from "./client";

export default async function SearchPage() {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user,
  });

  return <SearchClient permissions={permissions} />;
}
