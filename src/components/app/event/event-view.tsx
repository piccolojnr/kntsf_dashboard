"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

interface EventViewProps {
  event: {
    id: number;
    title: string;
    slug: string;
    description: string;
    excerpt: string;
    image: string;
    date: Date;
    time: string;
    location: string;
    category: string;
    categoryColor: string;
    featured: boolean;
    published: boolean;
    publishedAt: Date | null;
    maxAttendees: number;
    currentAttendees: number;
    createdAt: Date;
    updatedAt: Date;
    organizer: {
      username: string;
      image: string | null;
    };
  };
}

export function EventView({ event }: EventViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>

        <Button asChild>
          <Link href={`/dashboard/events/${event.slug}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Link>
        </Button>
      </div>

      {/* Event Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="pt-6">
              {/* Event Header */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={event.categoryColor}>
                    {event.category}
                  </Badge>
                  {event.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  <Badge
                    variant={event.published ? "default" : "outline"}
                    className={
                      event.published
                        ? "bg-green-100 text-green-700 border-green-200"
                        : ""
                    }
                  >
                    {event.published ? "Published" : "Draft"}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold leading-tight">
                  {event.title}
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed">
                  {event.excerpt}
                </p>
              </div>

              {/* Event Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-8">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(event.date), "EEEE, MMMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Attendees</p>
                    <p className="text-sm text-muted-foreground">
                      {event.currentAttendees} / {event.maxAttendees || "∞"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Meta */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {event.organizer.username}
                    </p>
                    <p className="text-xs text-muted-foreground">Organizer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(event.createdAt), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                </div>

                {event.publishedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(event.publishedAt), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">Published</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/events/${event.slug}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Link>
                </Button>

                {event.published && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/events/${event.slug}`} target="_blank">
                      View Live Event
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
