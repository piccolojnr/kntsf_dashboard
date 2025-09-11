import type { Metadata } from "next";
import { getEvent } from "@/lib/services/events.service";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EventForm } from "@/components/app/event/event-form";
import { format } from "date-fns";

interface EditEventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditEventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEvent(slug);

  if (!result.success || !result.data) {
    return {
      title: "Edit Event | Dashboard",
    };
  }

  return {
    title: `Edit ${result.data.title} | Dashboard`,
    description: `Edit event: ${result.data.title}`,
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { slug } = await params;
  const result = await getEvent(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const event = result.data;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/events/${slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Event</h2>
        <p className="text-muted-foreground">Update the event details below</p>
      </div>

      <EventForm
        initialData={{
          id: event.id,
          title: event.title,
          description: event.description,
          excerpt: event.excerpt,
          date: format(new Date(event.date), "yyyy-MM-dd"),
          time: event.time,
          location: event.location,
          category: event.category,
          categoryColor: event.categoryColor,
          featured: event.featured,
          published: event.published,
          maxAttendees: event.maxAttendees,
          image: event.image,
          images: event.images as any,
        }}
      />
    </div>
  );
}
