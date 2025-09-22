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
import {
  createPollAction,
  updatePollAction,
  updatePollSafeAction,
  checkPollHasVotesAction,
} from "@/app/actions/poll.actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

const pollFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  showResults: z.boolean(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
      })
    )
    .min(2, "At least 2 options are required"),
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
  const [hasVotes, setHasVotes] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [showVoteWarning, setShowVoteWarning] = useState(false);
  const [optionsChanged, setOptionsChanged] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
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
    formState: { errors },
  } = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      startAt: initialData?.startAt
        ? formatDateForInput(initialData.startAt)
        : "",
      endAt: initialData?.endAt ? formatDateForInput(initialData.endAt) : "",
      showResults: initialData?.showResults ?? true,
      options: initialData?.options || [{ text: "" }, { text: "" }],
    },
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

  // Check for existing votes when editing
  useEffect(() => {
    if (isEditing && initialData?.id) {
      checkPollHasVotesAction(initialData.id).then((result) => {
        if (result.success && result.data) {
          setHasVotes(result.data.hasVotes);
          setVoteCount(result.data.voteCount);
        }
      });
    }
  }, [isEditing, initialData?.id]);

  const options = watch("options");

  const addOption = () => {
    setValue("options", [...options, { text: "" }]);

    // Mark as changed when adding options
    if (isEditing && hasVotes) {
      setOptionsChanged(true);
      setShowVoteWarning(true);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setValue(
        "options",
        options.filter((_, i) => i !== index)
      );

      // Mark as changed when removing options
      if (isEditing && hasVotes) {
        setOptionsChanged(true);
        setShowVoteWarning(true);
      }
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { text };
    setValue("options", newOptions);

    // Check if options have changed from initial data
    if (isEditing && initialData?.options) {
      const initialOptions = initialData.options.map((opt) => opt.text);
      const currentOptions = newOptions.map((opt) => opt.text);
      const changed =
        JSON.stringify(initialOptions) !== JSON.stringify(currentOptions);
      setOptionsChanged(changed);
      if (changed && hasVotes) {
        setShowVoteWarning(true);
      }
    }
  };

  const onSubmit = async (data: PollFormData) => {
    setIsSubmitting(true);
    try {
      const pollData = {
        ...data,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      };

      let result;
      if (isEditing) {
        // If options changed and poll has votes, require force flag
        if (optionsChanged && hasVotes && !forceUpdate) {
          toast.error(
            `Cannot update poll options: This poll has ${voteCount} existing vote(s). Please confirm to proceed.`
          );
          setIsSubmitting(false);
          return;
        }

        // Use safe update if options haven't changed
        if (!optionsChanged) {
          result = await updatePollSafeAction(initialData!.id!, {
            title: pollData.title,
            description: pollData.description,
            startAt: pollData.startAt,
            endAt: pollData.endAt,
            showResults: pollData.showResults,
          });
        } else {
          // Force update with options
          result = await updatePollAction(initialData!.id!, {
            ...pollData,
            forceUpdateOptions: true,
          });
        }
      } else {
        result = await createPollAction(pollData);
      }

      if (result.success) {
        toast.success(
          isEditing ? "Poll updated successfully" : "Poll created successfully"
        );
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
    <div className="space-y-6">
      {/* Vote Warning Alert */}
      {showVoteWarning && hasVotes && optionsChanged && (
        <Alert className="border-destructive/50 text-destructive dark:border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: This will delete existing votes!</AlertTitle>
          <AlertDescription className="mt-2">
            This poll has <strong>{voteCount} vote(s)</strong>. Changing the
            options will permanently delete all existing votes.
            <div className="mt-3 flex items-center space-x-2">
              <Checkbox
                id="forceUpdate"
                checked={forceUpdate}
                onCheckedChange={(checked) => setForceUpdate(!!checked)}
              />
              <Label htmlFor="forceUpdate" className="text-sm">
                I understand and want to proceed anyway
              </Label>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert for polls with votes */}
      {hasVotes && !optionsChanged && isEditing && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Poll has active votes</AlertTitle>
          <AlertDescription>
            This poll has {voteCount} vote(s). You can safely update the title,
            description, and dates without affecting existing votes.
          </AlertDescription>
        </Alert>
      )}

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
            <Input id="endAt" type="datetime-local" {...register("endAt")} />
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
            <div className="flex items-center space-x-2">
              <Label>Poll Options *</Label>
              {hasVotes && isEditing && (
                <div className="flex items-center space-x-1 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Has {voteCount} votes</span>
                </div>
              )}
            </div>
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
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (showVoteWarning && optionsChanged && hasVotes && !forceUpdate)
            }
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? optionsChanged && hasVotes && forceUpdate
                  ? "Update Poll (Delete Votes)"
                  : "Update Poll"
                : "Create Poll"}
          </Button>
        </div>
      </form>
    </div>
  );
}
