import { EventsClient } from "@/components/app/event/events-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | Dashboard",
  description: "Manage events and activities",
};

export default function EventsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Create and manage your events and activities
          </p>
        </div>
      </div>
      <EventsClient />
    </div>
  );
}
