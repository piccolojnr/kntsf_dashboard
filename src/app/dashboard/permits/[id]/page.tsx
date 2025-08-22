import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { notFound } from "next/navigation";
import { PermitDetailClient } from "./client";
import services from "@/lib/services";

interface PermitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PermitDetailPage({ params }: PermitDetailPageProps) {
  const user = await getCurrentUser();
  const permissions = await getRole({
    user,
  });

  // Fetch permit details
  const permitResponse = await services.permit.getById(parseInt((await params).id));
  
  if (!permitResponse.success || !permitResponse.data) {
    notFound();
  }

  return (
    <PermitDetailClient 
      user={user} 
      permissions={permissions} 
      permit={permitResponse.data}
    />
  );
}
