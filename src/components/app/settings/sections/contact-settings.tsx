"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import services from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail,  Share2 } from "lucide-react";

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

interface ContactInfo {
  id: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  socialLinks: SocialLinks | null;
}

interface ContactSettingsProps {
  contactInfo: ContactInfo | null;
  onUpdate: () => void;
}

export function ContactSettings({
  contactInfo,
  onUpdate,
}: ContactSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: contactInfo?.email || "",
    phone: contactInfo?.phone || "",
    address: contactInfo?.address || "",
    website: contactInfo?.website || "",
    socialLinks: contactInfo?.socialLinks || {
      facebook: "",
      twitter: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      linkedin: "",
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await services.config.updateContactInfo(formData);
        if (response.success) {
          toast.success("Contact information updated successfully");
          onUpdate();
        } else {
          toast.error(response.error || "Failed to update contact information");
        }
      } catch (error) {
        console.error("Error updating contact information:", error);
        toast.error("An error occurred while updating contact information");
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Contact Information */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Basic Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email address"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter phone number"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Enter complete address"
              className="min-h-[100px] border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="https://example.com"
              className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Social Media Links
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add your social media profiles to help users connect with you
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Facebook
              </Label>
              <Input
                id="facebook"
                value={formData.socialLinks.facebook}
                onChange={(e) =>
                  handleSocialLinkChange("facebook", e.target.value)
                }
                placeholder="https://facebook.com/yourpage"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Twitter
              </Label>
              <Input
                id="twitter"
                value={formData.socialLinks.twitter}
                onChange={(e) =>
                  handleSocialLinkChange("twitter", e.target.value)
                }
                placeholder="https://twitter.com/yourhandle"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.socialLinks.instagram}
                onChange={(e) =>
                  handleSocialLinkChange("instagram", e.target.value)
                }
                placeholder="https://instagram.com/yourprofile"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                TikTok
              </Label>
              <Input
                id="tiktok"
                value={formData.socialLinks.tiktok}
                onChange={(e) =>
                  handleSocialLinkChange("tiktok", e.target.value)
                }
                placeholder="https://tiktok.com/@yourusername"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                YouTube
              </Label>
              <Input
                id="youtube"
                value={formData.socialLinks.youtube}
                onChange={(e) =>
                  handleSocialLinkChange("youtube", e.target.value)
                }
                placeholder="https://youtube.com/yourchannel"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={formData.socialLinks.linkedin}
                onChange={(e) =>
                  handleSocialLinkChange("linkedin", e.target.value)
                }
                placeholder="https://linkedin.com/company/yourcompany"
                className="h-11 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="px-8 py-3 h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
