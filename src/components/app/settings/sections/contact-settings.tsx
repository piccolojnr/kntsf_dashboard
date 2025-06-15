"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import services from "@/lib/services";

interface ContactInfo {
  id: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter email address"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Enter address"
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
            placeholder="Enter website URL"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
