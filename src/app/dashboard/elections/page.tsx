import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { ElectionsClient } from "./client";

export default async function ElectionsPage() {
  const user = await getCurrentUser();
  const permissions = await getRole({ user });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Elections</h1>
        <p className="text-muted-foreground">
          Manage formal SRC voting with multi-position ballots, approvals, turnout tracking, and controlled result release.
        </p>
      </div>
      <Suspense fallback={<div>Loading elections...</div>}>
        <ElectionsClient permissions={permissions} />
      </Suspense>
    </div>
  );
}
