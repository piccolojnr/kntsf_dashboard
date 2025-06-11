import { NewsClient } from "@/components/app/article/news-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News Articles | Dashboard",
  description: "Manage news articles and publications",
};

export default function NewsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">News Articles</h2>
          <p className="text-muted-foreground">
            Create and manage your news articles and publications
          </p>
        </div>
      </div>
      <NewsClient />
    </div>
  );
}
