"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import services from "@/lib/services";
import { Switch } from "@/components/ui/switch";
import { SemesterConfig } from "@prisma/client";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="currentSemester">Current Semester</Label>
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
          />
        </div>

        <div>
          <Label htmlFor="academicYear">Academic Year</Label>
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
          />
        </div>

        <div>
          <Label htmlFor="startDate">Start Date</Label>
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
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
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
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
          />
          <Label htmlFor="isActive">Active Semester</Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
