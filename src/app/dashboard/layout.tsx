import { BaseLayout } from "@/components/layouts/base-layout";
import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user: user,
  });

  return (
    <BaseLayout permissions={permissions} user={user}>
      {children}
    </BaseLayout>
  );
}
