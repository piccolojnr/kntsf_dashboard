import { Metadata } from "next";
import { ArticleForm } from "@/components/dashboard/news/article-form";
import { getArticle } from "@/lib/services/news.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Article | Dashboard",
  description: "Edit news article",
};

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }
  const result = await getArticle(id);

  if (!result.success) {
    notFound();
  }

  const article = result.data;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Article</h2>
      </div>
      <div className="container mx-auto py-10">
        <ArticleForm
          initialData={{
            id: article?.id,
            title: article?.title || "",
            content: article?.content || "",
            excerpt: article?.excerpt || "",
            category: article?.category || "",
            categoryColor: article?.categoryColor || "",
            featured: article?.featured || false,
            published: article?.published || false,
            readTime: article?.readTime || "",
            image: article?.image || "",
          }}
        />
      </div>
    </div>
  );
}
