"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Upload } from "lucide-react";

interface ImageUploadProps {
  userId: string;
  currentImageUrl: string | null;
  onImageUploaded: (url: string) => void;
  fallbackText: string;
}

export default function ImageUpload({
  userId,
  currentImageUrl,
  onImageUploaded,
  fallbackText,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create a unique file path for the user
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload the file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        if (uploadError.message.includes("security policy")) {
          throw new Error(
            "Permission denied. Storage bucket security rules are preventing uploads."
          );
        }
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      // Update state with the new URL
      setImageUrl(publicUrl);
      onImageUploaded(publicUrl);
    } catch (error: any) {
      console.error("Error uploading image:", error.message);
      setError(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 cursor-pointer border-2 border-slate-200 hover:border-slate-300">
        <AvatarImage
          src={
            imageUrl ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackText}`
          }
          alt="Profile picture"
          className="object-cover"
        />
        <AvatarFallback>{fallbackText?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="text-xs flex gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3" /> Change Photo
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        <p className="text-xs text-slate-500 mt-2">Maximum size: 2MB</p>
      </div>
    </div>
  );
}
