import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArticleForm } from "@/components/app/article/article-form";

export const metadata: Metadata = {
  title: "Create New Article | Dashboard",
  description: "Create a new news article",
};

export default function NewArticlePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/news">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Create New Article
        </h2>
        <p className="text-muted-foreground">
          Fill in the details below to create a new news article
        </p>
      </div>

      <ArticleForm />
    </div>
  );
}
