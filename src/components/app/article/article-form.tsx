"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle } from "@/lib/services/news.service";
import { ImageUpload } from "@/components/common/image-upload";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "news", label: "News" },
  { value: "updates", label: "Updates" },
  { value: "academic", label: "Academic" },
  { value: "announcements", label: "Announcements" },
  { value: "education", label: "Education" },
];

const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  categoryColor: z.string().min(1, "Category color is required"),
  featured: z.boolean(),
  published: z.boolean(),
  readTime: z.string().min(1, "Read time is required"),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: ArticleFormValues & { id?: number; image?: string };
}

const CATEGORY_COLORS = [
  { name: "Blue", value: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Green", value: "bg-green-100 text-green-700 border-green-200" },
  { name: "Red", value: "bg-red-100 text-red-700 border-red-200" },
  { name: "Yellow", value: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { name: "Purple", value: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Pink", value: "bg-pink-100 text-pink-700 border-pink-200" },
  { name: "Indigo", value: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  {
    name: "Emerald",
    value: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
];

export function ArticleForm({ initialData }: ArticleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: initialData || {
      title: "",
      content: "",
      excerpt: "",
      category: CATEGORIES[0].value,
      categoryColor: "bg-blue-100 text-blue-700 border-blue-200",
      featured: false,
      published: false,
      readTime: "5 min read",
    },
  });

  const onSubmit = async (data: ArticleFormValues) => {
    try {
      setIsLoading(true);

      // Validate image for new articles
      if (!initialData && !imageFile) {
        toast.error("Please upload an image for the article");
        return;
      }

      let result;
      if (initialData?.id) {
        // Update existing article
        result = await updateArticle(
          initialData.id,
          data,
          imageFile || undefined
        );
      } else {
        // Create new article
        if (!imageFile) {
          toast.error("Please upload an image for the article");
          return;
        }
        result = await createArticle(data, imageFile);
      }

      if (result.success) {
        toast.success(
          initialData
            ? "Article updated successfully"
            : "Article created successfully"
        );
        router.push("/dashboard/news");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save article");
      }
    } catch (error) {
      console.error("Error submitting article form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a compelling article title"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Keep it concise and engaging (max 200 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a brief summary of your article"
                          className="h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short summary that appears in article previews (max
                        500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your article content here..."
                          className="min-h-[400px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The main content of your article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Article Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Article Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="readTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Read Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5 min read" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Color</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-4 gap-2">
                          {CATEGORY_COLORS.map((color) => (
                            <Button
                              key={color.value}
                              type="button"
                              variant={
                                field.value === color.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className={`${color.value} hover:opacity-80`}
                              onClick={() => field.onChange(color.value)}
                            >
                              <Badge className={color.value}>
                                {color.name}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Featured Article
                          </FormLabel>
                          <FormDescription>
                            Show this article in the featured section
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish Article
                          </FormLabel>
                          <FormDescription>
                            Make this article visible to the public
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Article Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={initialData?.image}
                      onChange={(file) => setImageFile(file)}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a high-quality image that represents your article
                  </FormDescription>
                </FormItem>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? "Saving..."
              : initialData
                ? "Update Article"
                : "Create Article"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
