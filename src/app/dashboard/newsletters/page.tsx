import type { Metadata } from "next";
import { NewsletterDashboard } from "@/components/app/newsletter/newsletter-dashboard";

export const metadata: Metadata = {
  title: "Newsletter Management | KNUTSFORD SRC",
  description:
    "Comprehensive newsletter management system with analytics and subscriber management",
};

export default function NewsletterPage() {
  return <NewsletterDashboard />;
}
