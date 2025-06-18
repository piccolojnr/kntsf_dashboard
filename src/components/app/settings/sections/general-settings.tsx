"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import services from "@/lib/services";

interface GeneralSettingsProps {
  config: any; // Replace with proper type
  onUpdate: () => void;
}

export function GeneralSettings({ config, onUpdate }: GeneralSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    socialLinks: config.socialLinks || {
      facebook: "",
      twitter: "",
      instagram: "",
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await services.config.updateConfig(formData);
        if (response.success) {
          toast.success("General settings updated successfully");
          onUpdate();
        } else {
          toast.error(response.error || "Failed to update settings");
        }
      } catch (error) {
        console.error("Error updating settings:", error);
        toast.error("An error occurred while updating settings");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onUpdate]
  );

  const handleSocialLinkChange = useCallback(
    (platform: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value,
        },
      }));
    },
    []
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-4">
          <Label>Social Media Links</Label>
          <div className="space-y-2">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={formData.socialLinks.facebook}
                onChange={(e) =>
                  handleSocialLinkChange("facebook", e.target.value)
                }
                placeholder="Enter Facebook URL"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.socialLinks.twitter}
                onChange={(e) =>
                  handleSocialLinkChange("twitter", e.target.value)
                }
                placeholder="Enter Twitter URL"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.socialLinks.instagram}
                onChange={(e) =>
                  handleSocialLinkChange("instagram", e.target.value)
                }
                placeholder="Enter Instagram URL"
              />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
