"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ImageUpload from "./image-upload";

interface ProfileEditFormProps {
  userId: string;
  currentFullName: string;
  currentBio: string | null;
  currentAvailability: string | null;
  currentProfileImageUrl: string | null;
}

export default function ProfileEditForm({
  userId,
  currentFullName,
  currentBio,
  currentAvailability,
  currentProfileImageUrl,
}: ProfileEditFormProps) {
  const [fullName, setFullName] = useState(currentFullName || "");
  const [bio, setBio] = useState(currentBio || "");
  const [availability, setAvailability] = useState(currentAvailability || "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    currentProfileImageUrl || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleImageUploaded = (url: string) => {
    setProfileImageUrl(url);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    // Validate that userId is available
    if (!userId) {
      setError("User ID is missing. Please refresh the page and try again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    const supabase = createClient();

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: fullName.trim(),
          bio: bio.trim() || null,
          availability: availability.trim() || null,
          profile_image_url: profileImageUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Show success message and refresh the page
      setIsSuccess(true);
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disable form if userId is not available
  const isFormDisabled = !userId || isLoading;

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div className="flex justify-center mb-2">
        <ImageUpload
          userId={userId}
          currentImageUrl={profileImageUrl}
          onImageUploaded={handleImageUploaded}
          fallbackText={fullName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isFormDisabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell others about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isFormDisabled}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Textarea
          id="availability"
          placeholder="When are you typically available? (e.g., evenings on weekdays, weekends)"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          disabled={isFormDisabled}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isFormDisabled} className="w-full">
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {isSuccess && (
        <p className="text-sm text-green-600">Profile updated successfully!</p>
      )}
    </form>
  );
}
