"use client";

import { FileCheck, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessRoles } from "@/lib/role";
import services from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchClientProps {
  permissions: AccessRoles;
}

export function SearchClient({ permissions }: SearchClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const { data: permitsData, isLoading: isLoadingPermits } = useQuery({
    queryKey: ["permits", "search", query],
    queryFn: async () => {
      if (!query) return [];
      const response = await services.permit.getAll({ search: query });
      if (!response.success) {
        throw new Error(response.error || "Failed to search permits");
      }
      return response.data?.data?.map((permit: any) => ({
        id: permit.id,
        type: "permit" as const,
        title: `Permit #${permit.id}`,
        description: `Status: ${permit.status}`,
        date: new Date(permit.createdAt).toLocaleDateString(),
      }));
    },
    enabled: !!query && permissions.isExecutive,
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", "search", query],
    queryFn: async () => {
      if (!query) return [];
      const response = await services.student.getAll({ search: query });
      if (!response.success) {
        throw new Error(response.error || "Failed to search students");
      }
      return (response.data?.data ?? []).map((student: any) => ({
        id: student.id,
        type: "student" as const,
        title: student.name,
        description: `ID: ${student.studentId}`,
        date: new Date(student.createdAt).toLocaleDateString(),
      }));
    },
    enabled: !!query && permissions.isExecutive,
  });

  const results = [...(permitsData || []), ...(studentsData || [])];
  const permits = results.filter((result) => result.type === "permit");
  const students = results.filter((result) => result.type === "student");
  const isLoading = isLoadingPermits || isLoadingStudents;

  if (!query) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Search</h2>
        <p className="text-muted-foreground">
          Enter a search term to find permits and students
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
      <p className="text-muted-foreground">
        Showing results for &quot;{query}&quot;
      </p>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({results.length})</TabsTrigger>
          {permissions.isExecutive && (
            <TabsTrigger value="permits">
              Permits ({permits.length})
            </TabsTrigger>
          )}
          {permissions.isExecutive && (
            <TabsTrigger value="students">
              Students ({students.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="w-48 h-6" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-32 h-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <Card key={`${result.type}-${result.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.type === "permit" ? (
                      <FileCheck className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    {result.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{result.description}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Created: {result.date}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No results found</p>
          )}
        </TabsContent>

        {permissions.isExecutive && (
          <TabsContent value="permits" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="w-48 h-6" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-32 h-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : permits.length > 0 ? (
              permits.map((permit) => (
                <Card key={`permit-${permit.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      {permit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{permit.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Created: {permit.date}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No permits found</p>
            )}
          </TabsContent>
        )}

        {permissions.isExecutive && (
          <TabsContent value="students" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="w-48 h-6" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-32 h-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : students.length > 0 ? (
              students.map((student) => (
                <Card key={`student-${student.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {student.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{student.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Created: {student.date}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No students found</p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
