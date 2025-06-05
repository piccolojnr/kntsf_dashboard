import { BaseLayout } from "@/components/layouts/base-layout";
import { getCurrentUser } from "@/lib/auth/auth";
import { getPermissions } from "@/lib/permissions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const permissions = await getPermissions({
    user: user,
  });

  return (
    <BaseLayout permissions={permissions} user={user}>
      {children}
    </BaseLayout>
  );
}
