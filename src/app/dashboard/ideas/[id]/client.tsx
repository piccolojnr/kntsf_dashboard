"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import services from "@/lib/services";
import { SessionUser } from "@/lib/types/common";
import { AccessPermissions } from "@/lib/permissions";

interface IdeaViewClientProps {
  user: SessionUser;
  permissions: AccessPermissions;
  ideaId: string;
}

export function IdeaViewClient({
  ideaId,
}: IdeaViewClientProps) {
  const router = useRouter();

  const {
    data: idea,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["idea", ideaId],
    queryFn: async () => {
      const response = await services.idea.getById(parseInt(ideaId));
      if (!response.success) {
        throw new Error(response.error || "Failed to load idea details");
      }
      return response.data;
    },
    retry: 1,
  });

  if (error) {
    toast.error(error.message || "Failed to load idea details");
    router.back();
    return null;
  }

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    IMPLEMENTED: "bg-purple-100 text-purple-800",
  } as const;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="h-9 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-6 w-full bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Idea Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{idea.title}</h1>
        </div>
        <Badge className={statusColors[idea.status]}>
          {idea.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Idea Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap">{idea.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1">{idea.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Submitted
                  </p>
                  <p className="mt-1">
                    {format(new Date(idea.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="mt-1">{idea.student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Student ID
                  </p>
                  <p className="mt-1">{idea.student.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1">{idea.student.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 