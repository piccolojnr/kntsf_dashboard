import { Metadata } from "next";
import { getArticle } from "@/lib/services/news.service";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Edit } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "View Article | Dashboard",
  description: "View news article? details",
};

interface ViewArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewArticlePage({
  params,
}: ViewArticlePageProps) {
  const paramsResolved = await params;
  const result = await getArticle(paramsResolved.id);
  if (!result.success) {
    console.log("Failed to fetch article:", result.error);
    notFound();
  }

  const article = result.data;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Article Details</h2>
        <Button asChild>
          <Link href={`/dashboard/news/${article?.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Article
          </Link>
        </Button>
      </div>
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-semibold mb-4">
                  {article?.title}
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <Badge className={article?.categoryColor}>
                    {article?.category}
                  </Badge>
                  {article?.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  <Badge
                    variant={article?.published ? "default" : "outline"}
                    className={
                      article?.published
                        ? "bg-green-100 text-green-700 border-green-200"
                        : ""
                    }
                  >
                    {article?.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="prose max-w-none">
                  <p className="text-lg text-muted-foreground mb-6">
                    {article?.excerpt}
                  </p>
                  <div className="whitespace-pre-wrap">{article?.content}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-4">Article Image</h4>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={article?.image || "/placeholder.png"}
                    alt={article?.title || "Article Image"}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-4">Article Details</h4>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Author
                    </dt>
                    <dd className="mt-1">{article?.author.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Read Time
                    </dt>
                    <dd className="mt-1">{article?.readTime}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created At
                    </dt>
                    <dd className="mt-1">
                      {format(new Date(article?.createdAt || ""), "PPP")}
                    </dd>
                  </div>
                  {article?.publishedAt && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Published At
                      </dt>
                      <dd className="mt-1">
                        {format(new Date(article?.publishedAt), "PPP")}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
