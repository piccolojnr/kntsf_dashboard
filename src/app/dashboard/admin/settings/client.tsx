"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import services from "@/lib/services";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactSettings } from "@/components/app/settings/sections/contact-settings";
import { SemesterSettings } from "@/components/app/settings/sections/semester-settings";
import { PermitSettings } from "@/components/app/settings/sections/permit-settings";
import { AccessRoles } from "@/lib/role";
import { SessionUser } from "@/lib/types/common";

interface SettingsClientProps {
  user: SessionUser;
  permissions: AccessRoles;
}

export function SettingsClient({}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("contact");
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const response = await services.config.getConfig();
      if (!response.success) {
        throw new Error(response.error || "Failed to load configuration");
      }
      return response.data;
    },
  });

  const handleConfigUpdate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["config"] });
    toast.success("Configuration updated successfully");
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!config) {
    return <div>Configuration not found</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="semester">Semester</TabsTrigger>
          <TabsTrigger value="permit">Permit Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactSettings
                contactInfo={config.contactInfo as any}
                onUpdate={handleConfigUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semester">
          <Card>
            <CardHeader>
              <CardTitle>Semester Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <SemesterSettings
                semesterConfig={config.semesterConfig}
                onUpdate={handleConfigUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="permit">
          <Card>
            <CardHeader>
              <CardTitle>Permit Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <PermitSettings
                permitConfig={config.permitConfig}
                onUpdate={handleConfigUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
