"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import services from "@/lib/services";
import { Switch } from "@/components/ui/switch";
import { SemesterConfig } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, CheckCircle } from "lucide-react";

interface SemesterSettingsProps {
  semesterConfig: SemesterConfig | null;
  onUpdate: () => void;
}

export function SemesterSettings({
  semesterConfig,
  onUpdate,
}: SemesterSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentSemester: semesterConfig?.currentSemester || "",
    academicYear: semesterConfig?.academicYear || "",
    startDate: semesterConfig?.startDate
      ? new Date(semesterConfig.startDate).toISOString().split("T")[0]
      : "",
    endDate: semesterConfig?.endDate
      ? new Date(semesterConfig.endDate).toISOString().split("T")[0]
      : "",
    isActive: semesterConfig?.isActive || false,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await services.config.updateSemesterConfig({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
        });

        if (response.success) {
          toast.success("Semester configuration updated successfully");
          onUpdate();
        } else {
          toast.error(
            response.error || "Failed to update semester configuration"
          );
        }
      } catch (error) {
        console.error("Error updating semester configuration:", error);
        toast.error("An error occurred while updating semester configuration");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onUpdate]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Semester Information */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            Semester Information
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure the current academic semester and year
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currentSemester" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Semester
              </Label>
              <Input
                id="currentSemester"
                value={formData.currentSemester}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentSemester: e.target.value,
                  }))
                }
                placeholder="e.g., First Semester, Second Semester"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Academic Year
              </Label>
              <Input
                id="academicYear"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    academicYear: e.target.value,
                  }))
                }
                placeholder="e.g., 2023/2024"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Configuration */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Date Configuration
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set the start and end dates for the current semester
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Configuration */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Status Configuration
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control whether this semester is currently active
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Semester
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable this to mark the current semester as active
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="px-8 py-3 h-12 text-base font-medium bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
