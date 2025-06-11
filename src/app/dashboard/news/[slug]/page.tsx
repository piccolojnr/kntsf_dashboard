import type { Metadata } from "next";
import { getArticle } from "@/lib/services/news.service";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/app/article/article-view";

interface ViewArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ViewArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (!result.success || !result.data) {
    return {
      title: "Article Not Found | Dashboard",
    };
  }

  return {
    title: `${result.data.title} | Dashboard`,
    description: result.data.excerpt,
  };
}

export default async function ViewArticlePage({
  params,
}: ViewArticlePageProps) {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ArticleView article={result.data} />
    </div>
  );
}
