"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Trash2,
  RefreshCcw,
  Copy,
  Eye,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import services from "@/lib/services";
import { EmailPreview } from "./email-preview";

export function NewsletterList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: newsletters,
    isLoading: isLoadingNewsletters,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["newsletters"],
    queryFn: async () => {
      const response = await services.newsletter.getNewsletters();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load newsletters");
      }
      return response.data;
    },
  });

  const handleSend = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await services.newsletter.sendNewsletter(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to send newsletter");
      }
      toast.success(response.data.message);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (newsletter: any) => {
    setIsLoading(true);
    try {
      const response = await services.newsletter.createNewsletter({
        title: `${newsletter.title} (Copy)`,
        content: newsletter.content,
        status: "DRAFT",
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to duplicate newsletter");
      }
      toast.success("Newsletter duplicated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await services.newsletter.deleteNewsletter(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete newsletter");
      }
      toast.success("Newsletter deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNewsletters =
    newsletters?.filter((newsletter) => {
      const matchesSearch =
        newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsletter.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        newsletter.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const NewsletterCard = ({ newsletter }: { newsletter: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{newsletter.title}</CardTitle>
            <CardDescription className="mt-1">
              Created by {newsletter.sentBy.name} on{" "}
              {format(new Date(newsletter.createdAt), "PPP")}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(newsletter.status)}>
              {newsletter.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EmailPreview
                  template="newsletter-base"
                  data={{
                    title: newsletter.title,
                    content: newsletter.content,
                    previewText: `${newsletter.title} - KNUTSFORD SRC Newsletter`,
                  }}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                  }
                />
                {newsletter.status === "DRAFT" && (
                  <>
                    {/* <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem> */}
                    <DropdownMenuItem
                      onClick={() => handleSend(newsletter.id)}
                      disabled={isLoading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => handleDuplicate(newsletter)}
                  disabled={isLoading}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDelete(newsletter.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {newsletter.content}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{newsletter.content.split(" ").length} words</span>
          {newsletter.sentAt && (
            <span>Sent {format(new Date(newsletter.sentAt), "PPp")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Management</CardTitle>
          <CardDescription>
            View and manage all your newsletters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search newsletters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="grid" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              <Button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="btn btn-primary"
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${isRefetching} ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
            <TabsContent value="grid">
              {isLoadingNewsletters ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredNewsletters.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No newsletters found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Create your first newsletter to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredNewsletters.map((newsletter) => (
                    <NewsletterCard
                      key={newsletter.id}
                      newsletter={newsletter}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredNewsletters.map((newsletter) => (
                  <Card key={newsletter.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{newsletter.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(newsletter.createdAt), "PPP")} •{" "}
                            {newsletter.sentBy.name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(newsletter.status)}>
                            {newsletter.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <EmailPreview
                                template="newsletter-base"
                                data={{
                                  title: newsletter.title,
                                  content: newsletter.content,
                                  previewText: `${newsletter.title} - KNUTSFORD SRC Newsletter`,
                                }}
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                }
                              />
                              {newsletter.status === "DRAFT" && (
                                <DropdownMenuItem
                                  onClick={() => handleSend(newsletter.id)}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Now
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(newsletter)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
