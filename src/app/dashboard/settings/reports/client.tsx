"use client";

import type React from "react";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  FileText,
  BarChart2,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AccessPermissions } from "@/lib/permissions";
import services from "@/lib/services";
import { useTheme } from "@/hooks/use-theme";

interface ReportsClientProps {
  permissions: AccessPermissions;
}

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

export default function ReportsClient({ permissions }: ReportsClientProps) {
  const { theme } = useTheme();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [dateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats", selectedPeriod, dateRange],
    queryFn: async () => {
      const response = await services.report.getDashboardData({
        period: selectedPeriod,
        dateRange,
      });
      return response.data;
    },
  });

  const handleDownload = async (
    reportType: string,
    format: "pdf" | "csv" | "excel" = "pdf"
  ) => {
    if (!permissions.canViewReports) {
      toast.error("You don't have permission to download reports");
      return;
    }

    try {
      setIsGenerating(`${reportType}-${format}`);
      const response = await services.report.generate(reportType, {
        format,
        dateRange,
        period: selectedPeriod,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate report");
      }

      const bytes = new Uint8Array(response.data.bytes);
      const mimeType =
        format === "pdf"
          ? "application/pdf"
          : format === "csv"
            ? "text/csv"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = response.data.filename;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} report downloaded successfully`);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setIsGenerating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-4 h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8" />
                <Skeleton className="w-24 h-3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="w-32 h-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-64" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="w-32 h-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-64" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: "Total Revenue",
      value: `GHS ${dashboardData?.totalRevenue?.toLocaleString() || "0"}`,
      change: dashboardData?.revenueChange || 0,
      trend: (dashboardData?.revenueChange || 0) >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Permits",
      value: dashboardData?.activePermits || 0,
      change: dashboardData?.activePermitsChange || 0,
      trend: (dashboardData?.activePermitsChange || 0) >= 0 ? "up" : "down",
      icon: CheckCircle,
      color: "text-blue-600",
    },
    {
      title: "Total Students",
      value: dashboardData?.totalStudents || 0,
      change: dashboardData?.studentsChange || 0,
      trend: (dashboardData?.studentsChange || 0) >= 0 ? "up" : "down",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Expiring Soon",
      value: dashboardData?.expiringSoon || 0,
      change: dashboardData?.expiringSoonChange || 0,
      trend: (dashboardData?.expiringSoonChange || 0) <= 0 ? "up" : "down",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    permits: {
      label: "Permits",
      color: "hsl(var(--chart-2))",
    },
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const reports = [
    {
      type: "comprehensive-overview",
      title: "Comprehensive Overview",
      description: "Complete system overview with all key metrics and trends",
      icon: BarChart2,
      color:
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200",
      iconColor: "text-blue-600",
    },
    {
      type: "financial-analysis",
      title: "Financial Analysis",
      description: "Detailed revenue analysis with forecasting and trends",
      icon: DollarSign,
      color:
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200",
      iconColor: "text-green-600",
    },
    {
      type: "permit-lifecycle",
      title: "Permit Lifecycle Report",
      description:
        "Track permits from issuance to expiry with compliance metrics",
      icon: FileText,
      color:
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200",
      iconColor: "text-purple-600",
    },
    {
      type: "student-insights",
      title: "Student Insights",
      description:
        "Student demographics, behavior patterns, and engagement metrics",
      icon: Users,
      color:
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200",
      iconColor: "text-orange-600",
    },
    {
      type: "compliance-audit",
      title: "Compliance & Audit",
      description: "Regulatory compliance status and audit trail reports",
      icon: CheckCircle,
      color:
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200",
      iconColor: "text-teal-600",
    },
    {
      type: "predictive-analytics",
      title: "Predictive Analytics",
      description: "Future trends, demand forecasting, and risk analysis",
      icon: TrendingUp,
      color:
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and reporting for permit management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  ) : stat.trend === "down" ? (
                    <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  ) : null}
                  <span
                    className={
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                          ? "text-red-600"
                          : ""
                    }
                  >
                    {Math.abs(stat.change)}% from last period
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.revenueChart || []}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permit Status Distribution</CardTitle>
            <CardDescription>Current permit status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.permitStatusChart || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(dashboardData?.permitStatusChart || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Available Reports</h2>
          <Badge variant="secondary" className="text-xs">
            {reports.length} report types available
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card
              key={report.type}
              className={`transition-all hover:shadow-md ${report.color}`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.iconColor}`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleDownload(report.type, "pdf")}
                      disabled={isGenerating === `${report.type}-pdf`}
                    >
                      {isGenerating === `${report.type}-pdf` ? (
                        "Generating..."
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          PDF
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(report.type, "excel")}
                      disabled={isGenerating === `${report.type}-excel`}
                    >
                      {isGenerating === `${report.type}-excel` ? (
                        "..."
                      ) : (
                        <FileSpreadsheet className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(report.type, "csv")}
                    disabled={isGenerating === `${report.type}-csv`}
                    className="text-xs"
                  >
                    {isGenerating === `${report.type}-csv`
                      ? "Generating CSV..."
                      : "Download CSV"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common reporting tasks and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Filter className="w-4 h-4 mr-2" />
              Custom Filter
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Bulk Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
