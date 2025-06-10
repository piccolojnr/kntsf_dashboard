import { Metadata } from "next";
import { ArticleForm } from "@/components/dashboard/news/article-form";

export const metadata: Metadata = {
  title: "New Article | Dashboard",
  description: "Create a new news article",
};

export default function NewArticlePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">New Article</h2>
      </div>
      <div className="container mx-auto py-10">
        <ArticleForm />
      </div>
    </div>
  );
}