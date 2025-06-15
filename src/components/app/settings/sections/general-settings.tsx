"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import services from "@/lib/services";
import Image from "next/image";

interface GeneralSettingsProps {
  config: any; // Replace with proper type
  onUpdate: () => void;
}

export function GeneralSettings({ config, onUpdate }: GeneralSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState<"logo" | "favicon" | null>(
    null
  );
  const [formData, setFormData] = useState({
    appName: config.appName || "",
    appDescription: config.appDescription || "",
    appLogo: config.appLogo || "",
    appFavicon: config.appFavicon || "",
    socialLinks: config.socialLinks || {
      facebook: "",
      twitter: "",
      instagram: "",
    },
  });

  const handleImageUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "logo" | "favicon"
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(type);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await services.config.uploadConfigImage(
          formData,
          type
        );
        if (response.success && response.data) {
          setFormData((prev) => ({
            ...prev,
            [type === "logo" ? "appLogo" : "appFavicon"]: response.data?.url,
          }));
          toast.success(
            `${type === "logo" ? "Logo" : "Favicon"} uploaded successfully`
          );
        } else {
          toast.error(response.error || `Failed to upload ${type}`);
        }
      } catch (error) {
        console.error(`Error uploading ${type}:`, error);
        toast.error(`Failed to upload ${type}`);
      } finally {
        setIsUploading(null);
      }
    },
    []
  );

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
        <div>
          <Label htmlFor="appName">Application Name</Label>
          <Input
            id="appName"
            value={formData.appName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, appName: e.target.value }))
            }
            placeholder="Enter application name"
          />
        </div>

        <div>
          <Label htmlFor="appDescription">Application Description</Label>
          <Textarea
            id="appDescription"
            value={formData.appDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                appDescription: e.target.value,
              }))
            }
            placeholder="Enter application description"
          />
        </div>

        <div>
          <Label htmlFor="appLogo">Application Logo</Label>
          <div className="flex items-center gap-4">
            {formData.appLogo && (
              <div className="relative w-20 h-20">
                <Image
                  src={formData.appLogo}
                  alt="App Logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                id="appLogo"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "logo")}
                disabled={isUploading === "logo"}
              />
              {isUploading === "logo" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Uploading...
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="appFavicon">Favicon</Label>
          <div className="flex items-center gap-4">
            {formData.appFavicon && (
              <div className="relative w-8 h-8">
                <Image
                  src={formData.appFavicon}
                  alt="Favicon"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                id="appFavicon"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "favicon")}
                disabled={isUploading === "favicon"}
              />
              {isUploading === "favicon" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Uploading...
                </p>
              )}
            </div>
          </div>
        </div>

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

      <Button type="submit" disabled={isLoading || isUploading !== null}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
