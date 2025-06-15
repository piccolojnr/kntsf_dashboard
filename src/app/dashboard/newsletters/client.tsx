"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import services from "@/lib/services";
import { useQuery } from "@tanstack/react-query";

export function NewsletterClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const { data: newsletters, isLoading: isLoadingNewsletters } = useQuery({
    queryKey: ["newsletters"],
    queryFn: async () => {
      const response = await services.newsletter.getNewsletters();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load newsletters");
      }
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await services.newsletter.createNewsletter({
        content: formData.content,
        title: formData.title,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create newsletter");
      }

      toast.success("Newsletter created successfully");
      setFormData({ title: "", content: "" });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (id: number) => {
    setIsLoading(true);

    try {
      const response = await services.newsletter.sendNewsletter(id);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to send newsletter");
      }

      toast.success(response.data.message);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="create" className="space-y-4">
      <TabsList>
        <TabsTrigger value="create">Create Newsletter</TabsTrigger>
        <TabsTrigger value="list">Newsletter List</TabsTrigger>
      </TabsList>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Create New Newsletter</CardTitle>
            <CardDescription>
              Create a new newsletter to send to your subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter newsletter title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter newsletter content"
                  required
                  rows={10}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Newsletter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="list">
        <Card>
          <CardHeader>
            <CardTitle>Newsletter List</CardTitle>
            <CardDescription>View and manage your newsletters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingNewsletters ? (
                <p>Loading newsletters...</p>
              ) : newsletters?.length === 0 ? (
                <p>No newsletters found</p>
              ) : null}
              {newsletters?.map((newsletter) => (
                <Card key={newsletter.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{newsletter.title}</CardTitle>
                        <CardDescription>
                          Created by {newsletter.sentBy.name} on{" "}
                          {format(new Date(newsletter.createdAt), "PPP")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            newsletter.status === "SENT"
                              ? "bg-green-100 text-green-800"
                              : newsletter.status === "DRAFT"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {newsletter.status}
                        </span>
                        {newsletter.status === "DRAFT" && (
                          <Button
                            size="sm"
                            onClick={() => handleSend(newsletter.id)}
                            disabled={isLoading}
                          >
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {newsletter.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
