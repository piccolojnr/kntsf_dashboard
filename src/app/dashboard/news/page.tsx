import { Metadata } from "next";
import { NewsClient } from "./client";
import { getAdminArticles } from "@/lib/services/news.service";

export const metadata: Metadata = {
  title: "News Articles | Dashboard",
  description: "Manage news articles",
};

export default async function NewsPage() {
  const result = await getAdminArticles(1, 10);
  const stats = {
    total: result.success ? result.data?.total ?? 0 : 0,
    published: result.success
      ? result.data?.articles.filter((article) => article.published).length ?? 0
      : 0,
    drafts: result.success
      ? result.data?.articles.filter((article) => !article.published).length ?? 0
      : 0,
    featured: result.success
      ? result.data?.articles.filter((article) => article.featured).length ?? 0
      : 0,
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <NewsClient initialStats={stats} />
    </div>
  );
}
