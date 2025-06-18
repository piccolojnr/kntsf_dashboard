"use client";

import { format } from "date-fns";
import {
  Users,
  FileCheck,
  Calendar,
  Clock,
  BarChart3,
  Plus,
  Mail,
  FileText,
  Lightbulb,
  Newspaper,
  CreditCard,
  TrendingUp,
  Activity,
  Bell,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePermitForm from "../../components/app/permit/create-permit-form";
import { toast } from "sonner";
import services from "@/lib/services";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/lib/types/common";
import type { AccessRoles } from "@/lib/role";

interface DashboardStats {
  totalStudents: number;
  totalUsers: number;
  activePermits: number;
  expiringSoon: number;
  totalPermitRevenue: number;
  totalNewsletters: number;
  sentNewsletters: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalDocuments: number;
  totalDownloads: number;
  totalIdeas: number;
  pendingIdeas: number;
  approvedIdeas: number;
  totalNewsArticles: number;
  publishedArticles: number;
  totalEvents: number;
  upcomingEvents: number;
  totalPayments: number;
  successfulPayments: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function ClientOnly({
  user,
  permissions,
}: {
  user: SessionUser;
  permissions: AccessRoles;
}) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalUsers: 0,
    activePermits: 0,
    expiringSoon: 0,
    totalPermitRevenue: 0,
    totalNewsletters: 0,
    sentNewsletters: 0,
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalDocuments: 0,
    totalDownloads: 0,
    totalIdeas: 0,
    pendingIdeas: 0,
    approvedIdeas: 0,
    totalNewsArticles: 0,
    publishedArticles: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalPayments: 0,
    successfulPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const router = useRouter();
  const [isPermitDialogOpen, setIsPermitDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        services.dashboard.getStats(),
        services.dashboard.getRecentActivity(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        toast.error(
          statsResponse.error || "Failed to fetch dashboard statistics"
        );
      }

      if (activityResponse.success && activityResponse.data) {
        setRecentActivity(activityResponse.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      title: "New Permit",
      description: "Create a new permit application",
      icon: Plus,
      action: () => setIsPermitDialogOpen(true),
      permission: "isExecutive",
    },
    {
      title: "Newsletter",
      description: "Manage newsletter campaigns",
      icon: Mail,
      action: () => router.push("/dashboard/newsletters"),
      permission: "isPro",
    },
    {
      title: "Documents",
      description: "Manage document library",
      icon: FileText,
      action: () => router.push("/dashboard/documents"),
      permission: "isPro",
    },
    {
      title: "Student Ideas",
      description: "Review student suggestions",
      icon: Lightbulb,
      action: () => router.push("/dashboard/ideas"),
      permission: "isPro",
    },
    {
      title: "News & Events",
      description: "Manage news and events",
      icon: Newspaper,
      action: () => router.push("/dashboard/news"),
      permission: "isPro",
    },
    {
      title: "Reports",
      description: "Generate system reports",
      icon: BarChart3,
      action: () => router.push("/dashboard/settings/reports"),
      permission: "isExecutive",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "permit":
        return FileCheck;
      case "newsletter":
        return Mail;
      case "idea":
        return Lightbulb;
      case "payment":
        return CreditCard;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "permit":
        return "bg-blue-100 text-blue-800";
      case "newsletter":
        return "bg-green-100 text-green-800";
      case "idea":
        return "bg-yellow-100 text-yellow-800";
      case "payment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your comprehensive management dashboard
          </p>
          {user && (
            <div className="mt-1 text-lg font-semibold">
              {getGreeting()}, {user.username}!
            </div>
          )}
        </div>
        <Button
          onClick={() => fetchStats()}
          disabled={isLoading}
          className="flex items-center"
        >
          <Clock className="w-4 h-4 mr-2" />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions
          .filter(
            (action) =>
              !action.permission ||
              permissions[action.permission as keyof AccessRoles]
          )
          .map((action, index) => (
            <Card
              key={index}
              className="transition-colors cursor-pointer hover:bg-accent/50"
              onClick={action.action}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {action.title}
                </CardTitle>
                <action.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Main Stats */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Registered students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  GHS {stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Permits
                </CardTitle>
                <FileCheck className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activePermits}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Pending Items
                </CardTitle>
                <Bell className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingIdeas +
                    stats.pendingPayments +
                    stats.expiringSoon}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Permits
                </CardTitle>
                <FileCheck className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activePermits}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
                <Clock className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">Within 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Permit Revenue
                </CardTitle>
                <CreditCard className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  GHS {stats.totalPermitRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">From permits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Utilization Rate
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalStudents > 0
                    ? (
                        (stats.activePermits / stats.totalStudents) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Students with permits
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalDownloads} downloads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  News Articles
                </CardTitle>
                <Newspaper className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalNewsArticles}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.publishedArticles} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
                <Calendar className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.upcomingEvents} upcoming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Student Ideas
                </CardTitle>
                <Lightbulb className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalIdeas}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingIdeas} pending review
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Newsletter Subscribers
                </CardTitle>
                <Mail className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalSubscribers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSubscribers} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Newsletters Sent
                </CardTitle>
                <Mail className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.sentNewsletters}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {stats.totalNewsletters} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Successful Payments
                </CardTitle>
                <CreditCard className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.successfulPayments}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {stats.totalPayments} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Ideas Approved
                </CardTitle>
                <Lightbulb className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedIdeas}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.totalIdeas} submitted
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity & Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              ) : (
                recentActivity.slice(0, 5).map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
                      >
                        <IconComponent className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description} •{" "}
                          {format(
                            new Date(activity.timestamp),
                            "MMM d, h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Frequently accessed sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/permits">
                  <div className="flex flex-col items-center gap-2">
                    <FileCheck className="w-6 h-6" />
                    <span>Permits</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/students">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span>Students</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/newsletter">
                  <div className="flex flex-col items-center gap-2">
                    <Mail className="w-6 h-6" />
                    <span>Newsletter</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/settings">
                  <div className="flex flex-col items-center gap-2">
                    <Settings className="w-6 h-6" />
                    <span>Settings</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current system health and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">
                {/* {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
                 */}
                Jun 18, 2025 at 4:05 AM
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">System Status</p>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                All Systems Operational
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Database Status</p>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Connected
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-sm font-medium">2.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Permit Dialog */}
      {permissions.isExecutive && (
        <Dialog open={isPermitDialogOpen} onOpenChange={setIsPermitDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Permit</DialogTitle>
              <DialogDescription>
                Create a new permit for a student
              </DialogDescription>
            </DialogHeader>
            <CreatePermitForm
              onSuccess={() => {
                setIsPermitDialogOpen(false);
                fetchStats(); // Refresh stats after creating permit
              }}
              setIsDialogOpen={setIsPermitDialogOpen}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
