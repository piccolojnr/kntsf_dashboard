import type { Metadata } from "next";
import { getEvent } from "@/lib/services/events.service";
import { notFound } from "next/navigation";
import { EventView } from "@/components/app/event/event-view";

interface ViewEventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ViewEventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEvent(slug);

  if (!result.success || !result.data) {
    return {
      title: "Event Not Found | Dashboard",
    };
  }

  return {
    title: `${result.data.title} | Dashboard`,
    description: result.data.excerpt,
  };
}

export default async function ViewEventPage({ params }: ViewEventPageProps) {
  const { slug } = await params;
  const result = await getEvent(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <EventView event={result.data} />
    </div>
  );
}
