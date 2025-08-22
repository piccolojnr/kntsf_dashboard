"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import services from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, DollarSign, Settings } from "lucide-react";

interface PermitConfig {
  id: number;
  enablePermitRequest: boolean;
  expirationDate: Date;
  defaultAmount: number;
  currency: string;
}

interface PermitSettingsProps {
  permitConfig: PermitConfig | null;
  onUpdate: () => void;
}

export function PermitSettings({
  permitConfig,
  onUpdate,
}: PermitSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    expirationDate: permitConfig?.expirationDate
      ? new Date(permitConfig.expirationDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    defaultAmount: permitConfig?.defaultAmount || 0,
    currency: permitConfig?.currency || "GHS",
    enablePermitRequest: permitConfig?.enablePermitRequest || false,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await services.config.updatePermitConfig({
          ...formData,
          expirationDate: new Date(formData.expirationDate),
        });
        if (response.success) {
          toast.success("Permit configuration updated successfully");
          onUpdate();
        } else {
          toast.error(
            response.error || "Failed to update permit configuration"
          );
        }
      } catch (error) {
        console.error("Error updating permit configuration:", error);
        toast.error("An error occurred while updating permit configuration");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onUpdate]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Permit Request Settings */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Permit Request Settings
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control whether permit requests are enabled for students
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-1">
              <Label
                htmlFor="enablePermitRequest"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enable Permit Requests
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow students to submit permit requests through the system
              </p>
            </div>
            <Switch
              id="enablePermitRequest"
              checked={formData.enablePermitRequest}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  enablePermitRequest: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expiration Settings */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            Expiration Settings
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure when permits expire and become invalid
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label
              htmlFor="expirationDate"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Permit Expiration Date
            </Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expirationDate: e.target.value,
                }))
              }
              className="h-11 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permits will expire on this date and become invalid
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Configuration */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Payment Configuration
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set default payment amounts and currency for permits
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="defaultAmount"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Default Amount
              </Label>
              <Input
                id="defaultAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.defaultAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Default cost for permit requests
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="currency"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Currency
              </Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                placeholder="e.g., GHS, USD"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Currency code for payments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 h-12 text-base font-medium bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
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
