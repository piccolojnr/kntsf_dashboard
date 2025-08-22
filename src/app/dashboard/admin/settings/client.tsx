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
import { AppInfoSettings } from "@/components/app/settings/sections/app-info-settings";
import { Settings, Contact, Calendar, FileText, Info } from "lucide-react";

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
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Configuration Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Unable to load the application configuration. Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3   rounded-lg">
            <Settings className="w-8 h-8 " />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your application configuration and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1  ">
            <TabsTrigger 
              value="contact" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              <Contact className="w-4 h-4" />
              <span className="hidden sm:inline">Contact Info</span>
              <span className="sm:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger 
              value="semester"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Semester</span>
              <span className="sm:hidden">Semester</span>
            </TabsTrigger>
            <TabsTrigger 
              value="permit"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Permit Settings</span>
              <span className="sm:hidden">Permit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appinfo"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">App Info & Logins</span>
              <span className="sm:hidden">App Info</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="contact" className="space-y-6">
          <Card className="border-0 shadow-lg ">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-gray-100">
                <Contact className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Contact Information
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Update your organization&apos;s contact details and social media links
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <ContactSettings
                contactInfo={config.contactInfo as any}
                onUpdate={handleConfigUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semester" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-gray-100">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                Semester Configuration
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Manage academic calendar settings and semester information
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <SemesterSettings
                semesterConfig={config.semesterConfig}
                onUpdate={handleConfigUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permit" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-gray-100">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Permit Configuration
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Configure permit request settings and payment options
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <PermitSettings
                permitConfig={config.permitConfig}
                onUpdate={handleConfigUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appinfo" className="space-y-6">
          <Card className="border-0 shadow-lg ">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-gray-100">
                <Info className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                App Information & Logins
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Manage application credentials and service information
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <AppInfoSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
