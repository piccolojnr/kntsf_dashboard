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
import { toast } from "sonner";
import { createArticle, updateArticle } from "@/lib/services/news.service";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/common/image-upload";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  category: z.string().min(1, "Category is required"),
  categoryColor: z.string().min(1, "Category color is required"),
  featured: z.boolean(),
  published: z.boolean(),
  readTime: z.string().min(1, "Read time is required"),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: ArticleFormValues & { id?: number; image?: string };
  onSuccess?: () => void;
}

export function ArticleForm({ initialData, onSuccess }: ArticleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          published: initialData?.published || false,
        }
      : {
          title: "",
          content: "",
          excerpt: "",
          category: "",
          categoryColor: "bg-blue-100 text-blue-700 border-blue-200",
          featured: false,
          published: false,
          readTime: "5 min read",
        },
  });

  const onSubmit = async (data: ArticleFormValues) => {
    try {
      setIsLoading(true);

      if (!imageFile && !initialData) {
        toast.error("Please upload an image");
        return;
      }

      if (initialData?.id) {
        const result = await updateArticle(
          initialData.id,
          data,
          imageFile || undefined
        );
        if (result.success) {
          toast.success("Article updated successfully");
          onSuccess?.();
          router.push("/dashboard/news");
        } else {
          toast.error(result.error || "Failed to update article");
        }
      } else {
        if (!imageFile) {
          toast.error("Please upload an image");
          return;
        }
        const result = await createArticle(data, imageFile);
        if (result.success) {
          toast.success("Article created successfully");
          onSuccess?.();
          router.push("/dashboard/news");
        } else {
          toast.error(result.error || "Failed to create article");
        }
      }
    } catch (error) {
      console.error("Error submitting article form:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter article title" {...field} />
                  </FormControl>
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
                      placeholder="Enter article excerpt"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
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
                      placeholder="Enter article content"
                      className="h-48"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category" {...field} />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>
                        Show this article in featured section
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
                      <FormLabel className="text-base">Published</FormLabel>
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
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="categoryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Color</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            "bg-blue-100 text-blue-700 border-blue-200",
                            "bg-green-100 text-green-700 border-green-200",
                            "bg-red-100 text-red-700 border-red-200",
                            "bg-yellow-100 text-yellow-700 border-yellow-200",
                            "bg-purple-100 text-purple-700 border-purple-200",
                            "bg-pink-100 text-pink-700 border-pink-200",
                            "bg-indigo-100 text-indigo-700 border-indigo-200",
                            "bg-emerald-100 text-emerald-700 border-emerald-200",
                          ].map((color) => (
                            <Button
                              key={color}
                              type="button"
                              variant={
                                field.value === color ? "default" : "outline"
                              }
                              className={color}
                              onClick={() => field.onChange(color)}
                            >
                              Color
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FormItem>
                  <FormLabel>Article Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={initialData?.image}
                      onChange={(file) => setImageFile(file)}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a high-quality image for your article
                  </FormDescription>
                </FormItem>
              </CardContent>
            </Card>
          </div>
        </div>

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
