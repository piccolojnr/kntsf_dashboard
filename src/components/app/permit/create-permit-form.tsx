"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { usePermitCreation } from "@/hooks/use-permit-creation";
import {
  permitFormSchema,
  PermitFormValues,
} from "@/lib/schemas/permit-schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

import { toast } from "sonner";

interface CreatePermitFormProps {
  setIsDialogOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
  studentId?: string;
}

export default function CreatePermitForm({
  setIsDialogOpen,
  onSuccess,
  studentId,
}: CreatePermitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPermit } = usePermitCreation();

  const form = useForm<PermitFormValues>({
    resolver: zodResolver(permitFormSchema),
    defaultValues: {
      studentId: studentId || "",
    },
  });

  const onSubmit = async (values: PermitFormValues) => {
    setIsSubmitting(true);

    try {
      const res = await createPermit({
        ...values,
      });
      console.log("Permit creation response:", res);

      if (!res.success) {
        toast.error(res.error || "Failed to create permit");
        return;
      }

      form.reset({
        studentId: "",
      });

      setIsDialogOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating permit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Please correct the errors below before submitting.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter student ID"
                      disabled={!!studentId || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {studentId
                      ? "Student ID is pre-filled"
                      : "Enter the student's unique ID number"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Permit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
