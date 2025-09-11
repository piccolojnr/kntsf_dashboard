"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { getHtmlFromString } from "@/components/form/fields/initial-value";
import { ImageGallery } from "@/components/common/image-gallery";

interface ArticleViewProps {
  article: {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    image: string;
    images?: any; // JSON field containing additional images
    category: string;
    categoryColor: string;
    featured: boolean;
    published: boolean;
    publishedAt: Date | null;
    readTime: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      username: string;
      image: string | null;
    };
  };
}

export function ArticleView({ article }: ArticleViewProps) {
  const html = getHtmlFromString(article.content);

  // Parse additional images from JSON
  const additionalImages = (() => {
    try {
      if (article.images) {
        return Array.isArray(article.images)
          ? article.images
          : JSON.parse(article.images as string);
      }
      return [];
    } catch {
      return [];
    }
  })();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Link>
          </Button>
        </div>

        <Button asChild>
          <Link href={`/dashboard/news/${article.slug}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Article
          </Link>
        </Button>
      </div>

      {/* Article Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="pt-6">
              {/* Article Header */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={article.categoryColor}>
                    {article.category}
                  </Badge>
                  {article.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  <Badge
                    variant={article.published ? "default" : "outline"}
                    className={
                      article.published
                        ? "bg-green-100 text-green-700 border-green-200"
                        : ""
                    }
                  >
                    {article.published ? "Published" : "Draft"}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold leading-tight">
                  {article.title}
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              {/* Article Images */}
              <ImageGallery
                featuredImage={article.image}
                images={additionalImages}
                alt={article.title}
                className="mb-8"
              />

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Meta */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Article Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {article.author.username}
                    </p>
                    <p className="text-xs text-muted-foreground">Author</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{article.readTime}</p>
                    <p className="text-xs text-muted-foreground">Read time</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(article.createdAt), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                </div>

                {article.publishedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(article.publishedAt), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">Published</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/news/${article.slug}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Article
                  </Link>
                </Button>

                {article.published && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/news/${article.slug}`} target="_blank">
                      View Live Article
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
