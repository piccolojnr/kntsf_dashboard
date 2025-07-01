import type { Metadata } from "next";
import { NewsletterDashboard } from "@/components/app/newsletter/newsletter-dashboard";

export const metadata: Metadata = {
  title: "Newsletter Management | KNUTSFORD SRC",
  description:
    "Comprehensive newsletter management system with analytics and subscriber management",
};

export default function NewsletterPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">
            Manage newsletters, subscribers, and analytics
          </p>
        </div>
      </div>
      <NewsletterDashboard />
    </div>
  );
}
