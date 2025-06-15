"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import services from "@/lib/services";

interface PermitConfig {
  id: number;
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
    expirationDate: permitConfig?.expirationDate ? new Date(permitConfig.expirationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    defaultAmount: permitConfig?.defaultAmount || 0,
    currency: permitConfig?.currency || "GHS",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await services.config.updatePermitConfig({
          ...formData,
          expirationDate: new Date(formData.expirationDate)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="expirationDate">Expiration Date</Label>
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
          />
        </div>

        <div>
          <Label htmlFor="defaultAmount">Default Amount</Label>
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
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
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
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
