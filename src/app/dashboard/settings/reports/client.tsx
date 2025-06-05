"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileText, BarChart2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessPermissions } from "@/lib/permissions";
import services from "@/lib/services";

interface ReportsClientProps {
  permissions: AccessPermissions;
}

export default function ReportsClient({ permissions }: ReportsClientProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["report-stats"],
    queryFn: async () => {
      const [permitStats, revenueStats, studentStats] = await Promise.all([
        services.report.generate("permit-stats"),
        services.report.generate("revenue"),
        services.report.generate("student-analytics"),
      ]);

      return {
        permitStats,
        revenueStats,
        studentStats,
      };
    },
  });

  const handleDownload = async (reportType: string) => {
    if (!permissions.canViewReports) {
      toast.error("You don't have permission to download reports");
      return;
    }

    try {
      setIsGenerating(reportType);
      const response = await services.report.generate(reportType);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate report");
      }

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = response.data.url;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setIsGenerating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-4 mt-2" />
              <Skeleton className="w-full h-10 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const reports = [
    {
      type: "permit-stats",
      title: "Permit Statistics",
      description: "View active permits, revoked permits, and expiring permits",
      icon: FileText,
      stats: stats?.permitStats,
    },
    {
      type: "revenue",
      title: "Revenue Report",
      description: "View total revenue and monthly breakdown",
      icon: BarChart2,
      stats: stats?.revenueStats,
    },
    {
      type: "student-analytics",
      title: "Student Analytics",
      description: "View student statistics and permit distribution",
      icon: Users,
      stats: stats?.studentStats,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.type}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <report.icon className="w-5 h-5" />
              <CardTitle>{report.title}</CardTitle>
            </div>
            <CardDescription>{report.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleDownload(report.type)}
              disabled={isGenerating === report.type}
            >
              {isGenerating === report.type ? (
                "Generating..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
