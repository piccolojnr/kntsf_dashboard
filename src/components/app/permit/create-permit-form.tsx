"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Loader2,
  User,
  CreditCard,
  CheckCircle,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import services from "@/lib/services";
import * as z from "zod";

const permitFormSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student ID is required")
    .regex(/^\d+$/, "Student ID must contain only numbers"),
  amountPaid: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num > 0;
    }, "Amount must be greater than 0"),
  expiryDate: z
    .date({
      required_error: "Expiry date is required",
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Expiry date cannot be in the past"),
});

type PermitFormValues = z.infer<typeof permitFormSchema>;

interface CreatePermitData extends Omit<PermitFormValues, "amountPaid"> {
  amountPaid: number;
}

interface CreatePermitFormProps {
  setIsDialogOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
  studentId?: string;
}

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  course: string;
  level: string;
}

// const getTomorrowDate = (): Date => {
//   const tomorrow = new Date()
//   tomorrow.setDate(tomorrow.getDate() + 1)
//   return tomorrow
// }

const getDefaultExpiryDate = (): Date => {
  const today = new Date();
  // Default to 4 months from now (semester permit)
  return new Date(today.setMonth(today.getMonth() + 4));
};

export default function CreatePermitForm({
  setIsDialogOpen,
  onSuccess,
  studentId,
}: CreatePermitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  const form = useForm<PermitFormValues>({
    resolver: zodResolver(permitFormSchema),
    defaultValues: {
      studentId: studentId || "",
      expiryDate: getDefaultExpiryDate(),
      amountPaid: "50.00",
    },
  });

  const watchedStudentId = form.watch("studentId");

  // Search for student when student ID changes
  useEffect(() => {
    const searchStudent = async () => {
      if (watchedStudentId && watchedStudentId.length >= 3) {
        setIsSearchingStudent(true);
        try {
          const response =
            await services.student.searchStudent(watchedStudentId);
          if (response.success && response.data) {
            setSearchResults(
              response.data.map((student: any) => ({
                id: student.id,
                studentId: student.studentId,
                name: student.name || "",
                email: student.email || "",
                course: student.course || "",
                level: student.level || "",
              }))
            );
          } else {
            setSearchResults([]);
            console.error("Error searching student:", response.error);
          }
        } catch (error) {
          console.error("Error searching student:", error);
          setSearchResults([]);
        } finally {
          setIsSearchingStudent(false);
        }
      } else {
        setStudentData(null);
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchStudent, 300);
    return () => clearTimeout(timeoutId);
  }, [watchedStudentId]);

  const onSubmit = async (values: PermitFormValues) => {
    setIsSubmitting(true);

    try {
      const permitData: CreatePermitData = {
        ...values,
        amountPaid: Number.parseFloat(values.amountPaid),
      };

      const response = await services.permit.create(permitData);

      if (!response.success) {
        toast.error(response.error || "Failed to create permit");
        return;
      }

      toast.success("Permit created successfully!");
      form.reset({
        studentId: "",
        amountPaid: "50.00",
        expiryDate: getDefaultExpiryDate(),
      });
      setStudentData(null);
      setSearchResults([]);
      setIsDialogOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating permit:", error);
      toast.error("Failed to create permit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStudent = (student: Student) => {
    setStudentData(student);
    form.setValue("studentId", student.studentId);
    setSearchResults([]);
  };

  const clearSelection = () => {
    setStudentData(null);
    form.setValue("studentId", "");
    setSearchResults([]);
  };

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="space-y-6">
      {hasErrors && (
        <Alert
          variant="destructive"
          className="border-red-200 dark:border-red-800"
        >
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Please correct the errors below before submitting.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Information Section */}
          <Card className="border-border/50 dark:border-border/20 bg-card dark:bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-primary" />
                Student Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Search and select the student for the permit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">
                      Student ID *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          autoComplete="off"
                          placeholder="Enter student ID (e.g., 20123456)"
                          disabled={!!studentId || isSubmitting}
                          className="bg-background dark:bg-background/50 border-input focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
                        {isSearchingStudent && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-sm">
                      {studentId
                        ? "Student ID is pre-filled"
                        : "Enter the student's unique ID number"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Search Results */}
              {searchResults.length > 0 && !studentData && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">
                    Search Results:
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border border-border/50 rounded-lg cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/20 transition-colors"
                        onClick={() => selectStudent(student)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {student.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {student.studentId}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.course} • {student.level}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          Select
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Student */}
              {studentData && (
                <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                        Selected Student
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      disabled={isSubmitting}
                      className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Name:
                      </span>
                      <span className="ml-2 text-green-700 dark:text-green-300">
                        {studentData.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-200">
                        ID:
                      </span>
                      <span className="ml-2 text-green-700 dark:text-green-300">
                        {studentData.studentId}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Course:
                      </span>
                      <span className="ml-2 text-green-700 dark:text-green-300">
                        {studentData.course}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Level:
                      </span>
                      <span className="ml-2 text-green-700 dark:text-green-300">
                        {studentData.level}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* No Student Found */}
              {watchedStudentId &&
                watchedStudentId.length >= 3 &&
                searchResults.length === 0 &&
                !studentData &&
                !isSearchingStudent && (
                  <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      No student found with ID &quot;{watchedStudentId}&quot;.
                      Please verify the student ID or ensure the student is
                      registered in the system.
                    </AlertDescription>
                  </Alert>
                )}

              {/* Search Instructions */}
              {!watchedStudentId && (
                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    Enter at least 3 characters of the student ID to search for
                    students.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Permit Details Section */}
          <Card className="border-border/50 dark:border-border/20 bg-card dark:bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="w-5 h-5 text-primary" />
                Permit Details
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure the payment and expiry details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">
                        Amount Paid (GHS) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          disabled={isSubmitting}
                          className="bg-background dark:bg-background/50 border-input focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground text-sm">
                        Amount paid for the permit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">
                        Expiry Date *
                      </FormLabel>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-background dark:bg-background/50 border-input hover:bg-accent/50 dark:hover:bg-accent/20",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value instanceof Date &&
                              !Number.isNaN(field.value.getTime()) ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-popover dark:bg-popover border-border"
                          align="start"
                          avoidCollisions={true}
                          sideOffset={4}
                          onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                            className="bg-popover dark:bg-popover"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-muted-foreground text-sm">
                        When the permit will expire
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Section */}
          {studentData && (
            <Card className="border-border/50 dark:border-border/20 bg-card dark:bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground">
                  Permit Summary
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Review the permit details before creating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Student:
                    </span>
                    <span className="text-foreground">
                      {studentData.name} ({studentData.studentId})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">
                      Amount:
                    </span>
                    <span className="text-foreground font-medium">
                      GHS {form.watch("amountPaid")}
                    </span>
                  </div>
                  <div className="flex justify-between md:col-span-2">
                    <span className="font-medium text-muted-foreground">
                      Expires:
                    </span>
                    <span className="text-foreground">
                      {form.watch("expiryDate")
                        ? format(form.watch("expiryDate"), "PPP")
                        : "Not set"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator className="bg-border/50" />

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
              className="border-border hover:bg-accent/50 dark:hover:bg-accent/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !studentData}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Permit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
