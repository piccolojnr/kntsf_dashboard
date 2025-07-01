"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Send,
  TrendingUp,
  FileText,
  RefreshCcw,
} from "lucide-react";
import { NewsletterEditor } from "./newsletter-editor";
import { NewsletterList } from "./newsletter-list";
import { SubscriberManagement } from "./subscriber-management";
import { useQuery } from "@tanstack/react-query";
import services from "@/lib/services";
import { Button } from "@/components/ui/button";

export function NewsletterDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["newsletter-stats"],
    queryFn: async () => {
      const [subscribersRes, newslettersRes] = await Promise.all([
        services.newsletter.getSubscribers(),
        services.newsletter.getNewsletters(),
      ]);

      const subscribers = subscribersRes.success ? subscribersRes.data : [];
      const newsletters = newslettersRes.success ? newslettersRes.data : [];

      return {
        totalSubscribers: subscribers?.length || 0,
        activeSubscribers:
          subscribers?.filter((s) => s.status === "ACTIVE").length || 0,
        totalNewsletters: newsletters?.length || 0,
        sentNewsletters:
          newsletters?.filter((n) => n.status === "SENT").length || 0,
        draftNewsletters:
          newsletters?.filter((n) => n.status === "DRAFT").length || 0,
        scheduledNewsletters:
          newsletters?.filter((n) => n.status === "SCHEDULED").length || 0,
      };
    },
  });

  const StatCard = ({ title, value, description, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoadingStats ? "..." : value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">
            Manage newsletters, subscribers, and analytics
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoadingStats || isFetching || isRefetching}
          className="btn btn-primary"
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${isLoadingStats || isFetching || isRefetching} ? "animate-spin" : ""}`}
          />
          Refresh Stats
        </Button>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          {/* <TabsTrigger value="templates">Templates</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Subscribers"
              value={stats?.totalSubscribers}
              description="Active newsletter subscribers"
              icon={Users}
              trend="+12% from last month"
            />
            <StatCard
              title="Total Newsletters"
              value={stats?.totalNewsletters}
              description="All newsletters created"
              icon={Mail}
              trend="+5 this month"
            />
            <StatCard
              title="Sent Newsletters"
              value={stats?.sentNewsletters}
              description="Successfully delivered"
              icon={Send}
              trend="98% delivery rate"
            />
            <StatCard
              title="Draft Newsletters"
              value={stats?.draftNewsletters}
              description="Pending newsletters"
              icon={FileText}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common newsletter management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setActiveTab("create")}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Create Newsletter</div>
                  <div className="text-sm text-muted-foreground">
                    Start a new newsletter campaign
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("subscribers")}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Manage Subscribers</div>
                  <div className="text-sm text-muted-foreground">
                    View and manage your subscriber list
                  </div>
                </button>
                {/* <button
                onClick={() => setActiveTab("templates")}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium">Browse Templates</div>
                <div className="text-sm text-muted-foreground">
                  Use pre-designed newsletter templates
                </div>
              </button> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest newsletter activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Sent</Badge>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Weekly Update #45
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2 hours ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">Draft</Badge>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Event Announcement
                      </div>
                      <div className="text-xs text-muted-foreground">
                        1 day ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Sent</Badge>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Monthly Newsletter
                      </div>
                      <div className="text-xs text-muted-foreground">
                        3 days ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <NewsletterEditor />
        </TabsContent>

        <TabsContent value="newsletters">
          <NewsletterList />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscriberManagement />
        </TabsContent>

        {/* <TabsContent value="templates">
        <NewsletterTemplates />
      </TabsContent> */}
      </Tabs>
    </div>
  );
}
