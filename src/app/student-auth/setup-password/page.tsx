import { Suspense } from "react";
import { StudentPasswordSetupClient } from "./client";

export default function StudentPasswordSetupPage() {
  return (
    <Suspense fallback={null}>
      <StudentPasswordSetupClient />
    </Suspense>
  );
}
