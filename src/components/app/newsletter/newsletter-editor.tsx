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

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Eye, Save, Send } from "lucide-react";
import services from "@/lib/services";
import { EmailPreview } from "./email-preview";

export function NewsletterEditor() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    template: "default",
    priority: "normal",
    tags: [] as string[],
    scheduledFor: null as Date | null,
  });

  const handleSubmit = async (action: "draft" | "send" | "schedule") => {
    setIsLoading(true);

    try {
      let status: "DRAFT" | "SENT" | "SCHEDULED" = "DRAFT";

      if (action === "send") {
        status = "SENT";
      } else if (action === "schedule") {
        status = "SCHEDULED";
      }

      const response = await services.newsletter.createNewsletter({
        title: formData.title,
        content: formData.content,
        status,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create newsletter");
      }

      if (action === "send") {
        const sendResponse = await services.newsletter.sendNewsletter(
          response.data.id
        );
        if (!sendResponse.success) {
          throw new Error(sendResponse.error || "Failed to send newsletter");
        }
        toast.success("Newsletter sent successfully!");
      } else if (action === "schedule") {
        toast.success("Newsletter scheduled successfully!");
      } else {
        toast.success("Newsletter saved as draft!");
      }

      setFormData({
        title: "",
        content: "",
        template: "default",
        priority: "normal",
        tags: [],
        scheduledFor: null,
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Newsletter Editor</CardTitle>
                <CardDescription>
                  Create and customize your newsletter
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <EmailPreview
                  template="newsletter-base"
                  data={{
                    title: formData.title || "Newsletter Title",
                    content:
                      formData.content ||
                      "Newsletter content will appear here...",
                    previewText: `${formData.title} - KNUST SRC Newsletter`,
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Email Preview
                    </Button>
                  }
                />
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? "Edit" : "Web Preview"}
                </Button> */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Newsletter Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter an engaging title..."
                required
              />
            </div>
            {/* 
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={formData.template}
                      onValueChange={(value) =>
                        setFormData({ ...formData, template: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="announcement">
                          Announcement
                        </SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div> */}

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your newsletter content here..."
                required
                rows={12}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publish Options</CardTitle>
            <CardDescription>
              Choose how to publish your newsletter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => handleSubmit("draft")}
              disabled={isLoading || !formData.title || !formData.content}
              variant="outline"
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>

            <Button
              onClick={() => handleSubmit("send")}
              disabled={isLoading || !formData.title || !formData.content}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>

            <Separator />

            {/* <div className="space-y-3">
              <Label>Schedule for Later</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => handleSubmit("schedule")}
                disabled={
                  isLoading ||
                  !formData.title ||
                  !formData.content ||
                  !scheduleDate
                }
                variant="secondary"
                className="w-full"
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule Newsletter
              </Button>
            </div> */}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Newsletter Stats</CardTitle>
            <CardDescription>Estimated reach and engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Estimated Recipients
              </span>
              <span className="text-sm font-medium">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expected Open Rate
              </span>
              <span className="text-sm font-medium">24%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Word Count</span>
              <span className="text-sm font-medium">
                {formData.content.split(" ").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Reading Time
              </span>
              <span className="text-sm font-medium">
                {Math.ceil(formData.content.split(" ").length / 200)} min
              </span>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
