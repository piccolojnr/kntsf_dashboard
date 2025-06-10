"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  Edit,
  User,
  Mail,
  Camera,
  X,
  Upload,
  Eye,
  EyeClosed,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import services from "@/lib/services";
import { User as UserType } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import Image from "next/image";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserType | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await services.user.getUser();

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch profile");
      }

      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile ? { ...profile } : null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile ? { ...profile } : null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await services.user.updateUser(
        editedProfile as UserType
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update profile");
      }

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await services.user.uploadProfileImage(formData);
      if (!response.success || !response.data || !response.data.image) {
        throw new Error(response.error || "Failed to upload image");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              image: response.data?.image ? response.data?.image : null,
            }
          : null
      );
      setImageFile(null);
      setImagePreview(null);
      toast.success("Profile image updated successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageRemove = async () => {
    setIsUploadingImage(true);
    try {
      const response = await fetch("/api/users/profile/image", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to remove image");
      }

      setProfile((prev) => (prev ? { ...prev, image: null } : null));
      toast.success("Profile image removed successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to remove image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setError(null);

    // Validate passwords
    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      setIsUpdatingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const response = await services.user.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update password");
      }

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load profile information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                {isEditing ? (
                  <Input
                    value={editedProfile?.username || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, username: e.target.value } : null
                      )
                    }
                    placeholder="Enter username"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">
                    <span className="font-mono">@{profile.username}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                {isEditing ? (
                  <Input
                    value={editedProfile?.name || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    placeholder="Enter full name"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">{profile.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedProfile?.email || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">{profile.email}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Profile Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {imagePreview ? (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        width={128}
                        height={128}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile.image ? (
                      <Image
                        src={profile.image || "/placeholder.svg"}
                        width={128}
                        height={128}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {profile.image && !imagePreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImageRemove}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Upload New Image
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose a profile picture. Recommended size: 400x400px
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    disabled={isUploadingImage}
                  />
                </div>

                {imageFile && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImageUpload}
                      disabled={isUploadingImage}
                      size="sm"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      size="sm"
                      disabled={isUploadingImage}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Position/Title</label>
                {isEditing ? (
                  <Input
                    value={editedProfile?.position || ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, position: e.target.value } : null
                      )
                    }
                    placeholder="Your position or title"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">
                    {profile.position || "Not specified"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                {isEditing ? (
                  <Select
                    value={editedProfile?.category || ""}
                    onValueChange={(value) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, category: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main_executive">
                        Main Executive
                      </SelectItem>
                      <SelectItem value="other_executive">
                        Other Executive
                      </SelectItem>
                      <SelectItem value="all_present">All Present</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-muted rounded-md">
                    {profile.category ? (
                      <Badge variant="outline">
                        {profile.category
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    ) : (
                      "Not specified"
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Position Description
              </label>
              {isEditing ? (
                <Textarea
                  value={editedProfile?.positionDescription || ""}
                  onChange={(e) =>
                    setEditedProfile((prev) =>
                      prev
                        ? { ...prev, positionDescription: e.target.value }
                        : null
                    )
                  }
                  placeholder="Brief description of your role"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-muted rounded-md min-h-[80px]">
                  {profile.positionDescription || "No description provided"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Biography</label>
              {isEditing ? (
                <Textarea
                  value={editedProfile?.biography || ""}
                  onChange={(e) =>
                    setEditedProfile((prev) =>
                      prev ? { ...prev, biography: e.target.value } : null
                    )
                  }
                  placeholder="Tell us about yourself"
                  rows={5}
                />
              ) : (
                <div className="p-3 bg-muted rounded-md min-h-[120px] whitespace-pre-wrap">
                  {profile.biography || "No biography provided"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["linkedin", "twitter", "instagram", "facebook"].map(
                (platform) => (
                  <div key={platform} className="space-y-2">
                    <label className="text-sm font-medium capitalize">
                      {platform}
                    </label>
                    {isEditing ? (
                      <Input
                        value={
                          editedProfile?.socialLinks?.[
                            platform as keyof typeof editedProfile.socialLinks
                          ] || ""
                        }
                        onChange={(e) =>
                          setEditedProfile((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  socialLinks: {
                                    ...((prev.socialLinks || {}) as Record<
                                      string,
                                      unknown
                                    >),
                                    [platform]: e.target.value,
                                  } as JsonValue,
                                }
                              : null
                          )
                        }
                        placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                      />
                    ) : (
                      <div className="p-2 bg-muted rounded-md">
                        {profile.socialLinks?.[
                          platform as keyof typeof profile.socialLinks
                        ] ? (
                          <a
                            href={
                              profile.socialLinks[
                                platform as keyof typeof profile.socialLinks
                              ]
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {
                              profile.socialLinks[
                                platform as keyof typeof profile.socialLinks
                              ]
                            }
                          </a>
                        ) : (
                          <span className="text-muted-foreground">
                            Not provided
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                    {showCurrentPassword ? (
                      <EyeClosed
                        className="cursor-pointer"
                        onClick={() => setShowCurrentPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="cursor-pointer"
                        onClick={() => setShowCurrentPassword(true)}
                      />
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                    {showNewPassword ? (
                      <EyeClosed
                        className="cursor-pointer"
                        onClick={() => setShowNewPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="cursor-pointer"
                        onClick={() => setShowNewPassword(true)}
                      />
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                    {showConfirmPassword ? (
                      <EyeClosed
                        className="cursor-pointer"
                        onClick={() => setShowConfirmPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="cursor-pointer"
                        onClick={() => setShowConfirmPassword(true)}
                      />
                    )}
                  </span>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUpdatingPassword || !passwordData.newPassword}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
