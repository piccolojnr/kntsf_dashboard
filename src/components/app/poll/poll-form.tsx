"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { createPollAction, updatePollAction } from "@/app/actions/poll.actions";
import { toast } from "sonner";
import { format } from "date-fns";

const pollFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  showResults: z.boolean(),
  options: z.array(z.object({
    text: z.string().min(1, "Option text is required")
  })).min(2, "At least 2 options are required")
});

type PollFormData = z.infer<typeof pollFormSchema>;

interface PollFormProps {
  initialData?: {
    id?: number;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    showResults: boolean;
    options: { text: string }[];
  };
  onSuccess?: () => void;
}

export function PollForm({ initialData, onSuccess }: PollFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?.id;

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      startAt: initialData?.startAt ? formatDateForInput(initialData.startAt) : "",
      endAt: initialData?.endAt ? formatDateForInput(initialData.endAt) : "",
      showResults: initialData?.showResults ?? true,
      options: initialData?.options || [{ text: "" }, { text: "" }]
    }
  });

  // Update form values when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title);
      setValue("description", initialData.description || "");
      setValue("startAt", formatDateForInput(initialData.startAt));
      setValue("endAt", formatDateForInput(initialData.endAt));
      setValue("showResults", initialData.showResults);
      setValue("options", initialData.options);
    }
  }, [initialData, setValue]);

  const options = watch("options");

  const addOption = () => {
    setValue("options", [...options, { text: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setValue("options", options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { text };
    setValue("options", newOptions);
  };

  const onSubmit = async (data: PollFormData) => {
    setIsSubmitting(true);
    try {
      const pollData = {
        ...data,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt)
      };

      let result;
      if (isEditing) {
        result = await updatePollAction(initialData!.id!, pollData);
      } else {
        result = await createPollAction(pollData);
      }

      if (result.success) {
        toast.success(isEditing ? "Poll updated successfully" : "Poll created successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to save poll");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter poll title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter poll description (optional)"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start Date & Time *</Label>
              <Input
                id="startAt"
                type="datetime-local"
                {...register("startAt")}
              />
              {errors.startAt && (
                <p className="text-sm text-red-500">{errors.startAt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endAt">End Date & Time *</Label>
              <Input
                id="endAt"
                type="datetime-local"
                {...register("endAt")}
              />
              {errors.endAt && (
                <p className="text-sm text-red-500">{errors.endAt.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showResults"
              checked={watch("showResults")}
              onCheckedChange={(checked) => setValue("showResults", !!checked)}
            />
            <Label htmlFor="showResults">Show results to students</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Poll Options *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {errors.options && (
              <p className="text-sm text-red-500">{errors.options.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Poll" : "Create Poll"}
            </Button>
          </div>
    </form>
  );
}
