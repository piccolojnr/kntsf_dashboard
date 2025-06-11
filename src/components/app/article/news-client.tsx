"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { getAllArticles, deleteArticle } from "@/lib/services/news.service";
import { MyPagination } from "@/components/common/my-pagination";

const CATEGORIES = [
  { value: "news", label: "News" },
  { value: "updates", label: "Updates" },
  { value: "academic", label: "Academic" },
  { value: "announcements", label: "Announcements" },
  { value: "education", label: "Education" },
];
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export function NewsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>();

  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  const {
    data: newsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "news-articles",
      currentPage,
      debouncedSearch,
      categoryFilter,
      statusFilter,
      featuredFilter,
    ],
    queryFn: async () => {
      const response = await getAllArticles({
        page: currentPage,
        pageSize,
        search: debouncedSearch || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        published:
          statusFilter === "all" ? undefined : statusFilter === "published",
        featured: featuredFilter,
      });
      console.log(response);
      if (!response.success) {
        throw new Error(response.error || "Failed to load articles");
      }

      return response.data;
    },
  });

  const handleDelete = useCallback(
    async (articleId: number, articleTitle: string) => {
      if (
        !confirm(
          `Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        const response = await deleteArticle(articleId);
        if (response.success) {
          toast.success("Article deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["news-articles"] });
        } else {
          toast.error(response.error || "Failed to delete article");
        }
      } catch (error) {
        console.error("Error deleting article:", error);
        toast.error("An unexpected error occurred");
      }
    },
    [queryClient]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((type: string, value: string) => {
    if (type === "category") {
      setCategoryFilter(value);
    } else if (type === "status") {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load articles</p>
            <Button
              variant="outline"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["news-articles"] })
              }
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="pl-9 w-[300px]"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={featuredFilter === true ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setFeaturedFilter(featuredFilter === true ? undefined : true)
            }
          >
            <Filter className="h-4 w-4 mr-2" />
            Featured
          </Button>
        </div>

        <Button asChild>
          <Link href="/dashboard/news/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : newsData?.articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <p>No articles found</p>
                      <Button asChild className="mt-2">
                        <Link href="/dashboard/news/new">
                          Create your first article
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                newsData?.articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="   max-w-[300px]">
                      <div className="space-y-1">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {article.excerpt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={article.categoryColor}>
                        {article.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{article.author.username}</div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {article.publishedAt
                          ? format(
                              new Date(article.publishedAt),
                              "MMM dd, yyyy"
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/news/${article.slug}`}>
                              View Article
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/news/${article.slug}/edit`}>
                              Edit Article
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDelete(article.id, article.title)
                            }
                          >
                            Delete Article
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {newsData && newsData.total > pageSize && (
        <MyPagination
          currentPage={currentPage}
          totalPages={Math.ceil(newsData.total / pageSize)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
