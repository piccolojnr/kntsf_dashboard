"use client";

import { useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
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
import { createEvent, updateEvent } from "@/lib/services/events.service";
import { ImageUpload } from "@/components/common/image-upload";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { RichTextField } from "@/components/form/fields/rich-text-field";

const CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "workshop", label: "Workshop" },
  { value: "conference", label: "Conference" },
];

const eventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required"),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt must be less than 500 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  categoryColor: z.string().min(1, "Category color is required"),
  featured: z.boolean(),
  published: z.boolean(),
  maxAttendees: z
    .number()
    .min(0, "Maximum attendees must be 0 or greater")
    .max(1000, "Maximum attendees must be less than 1000"),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: EventFormValues & { id?: number; image?: string };
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

export function EventForm({ initialData }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      excerpt: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "12:00",
      location: "",
      category: CATEGORIES[0].value,
      categoryColor: "bg-blue-100 text-blue-700 border-blue-200",
      featured: false,
      published: false,
      maxAttendees: 100,
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsLoading(true);

      // Validate image for new events
      if (!initialData && !imageFile) {
        toast.error("Please upload an image for the event");
        return;
      }

      let result;
      if (initialData?.id) {
        // Update existing event
        result = await updateEvent(
          initialData.id,
          data as any,
          imageFile || undefined
        );
      } else {
        // Create new event
        if (!imageFile) {
          toast.error("Please upload an image for the event");
          return;
        }
        result = await createEvent(data as any, imageFile);
      }

      if (result.success) {
        toast.success(
          initialData
            ? "Event updated successfully"
            : "Event created successfully"
        );
        router.push("/dashboard/events");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Error submitting event form:", error);
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
                <CardTitle>Event Content</CardTitle>
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
                          placeholder="Enter an engaging event title"
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
                          placeholder="Write a brief summary of your event"
                          className="h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short summary that appears in event previews (max 500
                        characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextField
                          name="description"
                          field={field as ControllerRenderProps<any, string>}
                        />
                      </FormControl>
                      <FormDescription>
                        The main content of your event description
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
            {/* Event Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Event Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1000}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Set to 0 for unlimited attendees
                      </FormDescription>
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
                            Featured Event
                          </FormLabel>
                          <FormDescription>
                            Show this event in the featured section
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
                            Publish Event
                          </FormLabel>
                          <FormDescription>
                            Make this event visible to the public
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
                <CardTitle>Event Image</CardTitle>
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
                    Upload a high-quality image that represents your event
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
                ? "Update Event"
                : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
