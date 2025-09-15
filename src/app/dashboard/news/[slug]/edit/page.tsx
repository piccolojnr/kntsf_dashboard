import type { Metadata } from "next";
import { getArticle } from "@/lib/services/news.service";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArticleForm } from "@/components/app/article/article-form";

interface EditArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (!result.success || !result.data) {
    return {
      title: "Edit Article | Dashboard",
    };
  }

  return {
    title: `Edit ${result.data.title} | Dashboard`,
    description: `Edit article: ${result.data.title}`,
  };
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const article = result.data;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/news/${slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Article
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Article</h2>
        <p className="text-muted-foreground">
          Update the article details below
        </p>
      </div>

      <ArticleForm
        initialData={{
          id: article.id,
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          category: article.category,
          categoryColor: article.categoryColor,
          featured: article.featured,
          published: article.published,
          readTime: article.readTime,
          image: article.image,
          images: article.images as any,
        }}
      />
    </div>
  );
}
