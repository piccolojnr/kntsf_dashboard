"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Copy, Star } from "lucide-react";
import { EmailPreview } from "./email-preview";
import Image from "next/image";

export function NewsletterTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const templates = [
    {
      id: 1,
      name: "Newsletter Base",
      description: "Clean and professional newsletter template",
      category: "update",
      template: "newsletter-base",
      preview: "/placeholder.svg?height=200&width=300",
      popular: true,
      sampleData: {
        title: "Weekly Update #45",
        content:
          "This is a sample newsletter content. You can customize this with your own content, including multiple paragraphs, links, and formatting.\n\nThis template is perfect for regular updates and announcements to your subscribers.",
        previewText: "Weekly update from KNUST SRC",
      },
    },
    {
      id: 2,
      name: "Event Announcement",
      description: "Perfect for promoting events and activities",
      category: "event",
      template: "event-announcement",
      preview: "/placeholder.svg?height=200&width=300",
      popular: false,
      sampleData: {
        eventTitle: "Annual Tech Conference 2024",
        eventDate: "March 15, 2024",
        eventTime: "9:00 AM - 5:00 PM",
        eventLocation: "KNUST Great Hall",
        eventDescription:
          "Join us for an exciting day of technology talks, networking, and innovation. This year's conference features industry leaders, student presentations, and hands-on workshops.",
        registrationUrl: "#",
      },
    },
    {
      id: 3,
      name: "Welcome Series",
      description: "Onboard new subscribers with style",
      category: "welcome",
      template: "welcome-series",
      preview: "/placeholder.svg?height=200&width=300",
      popular: true,
      sampleData: {
        firstName: "John",
        organizationName: "KNUST SRC",
        websiteUrl: "#",
      },
    },
    {
      id: 4,
      name: "Monthly Digest",
      description: "Comprehensive monthly roundup template",
      category: "update",
      template: "monthly-digest",
      preview: "/placeholder.svg?height=200&width=300",
      popular: true,
      sampleData: {
        month: "January",
        year: "2024",
        highlights: [
          {
            title: "New Student Portal Launch",
            description:
              "We've launched a brand new student portal with improved features and better user experience.",
            imageUrl: "/placeholder.svg?height=200&width=400",
            readMoreUrl: "#",
          },
          {
            title: "Academic Excellence Awards",
            description:
              "Congratulations to all students who received academic excellence awards this semester.",
            readMoreUrl: "#",
          },
        ],
        upcomingEvents: [
          {
            title: "Orientation Week",
            date: "February 5-9, 2024",
            location: "Various Locations",
          },
          {
            title: "Career Fair",
            date: "February 15, 2024",
            location: "University Hall",
          },
        ],
      },
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: any) => {
    // This would typically navigate to the editor with the template pre-loaded
    console.log("Using template:", template.name);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Templates</CardTitle>
          <CardDescription>
            Choose from professionally designed templates to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="update">Updates</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="promotion">Promotions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {template.popular && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <EmailPreview
                      template={template.template}
                      data={template.sampleData}
                      trigger={
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
