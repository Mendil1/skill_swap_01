"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ProfileEditForm from "../profile-edit-form";
import Link from "next/link";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  bio: string | null;
  email: string;
  profile_image_url: string | null;
  availability: string | null;
}

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      if (!user?.id) {
        setError("Please log in to edit your profile");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("user_id, full_name, bio, email, profile_image_url, availability")
          .eq("user_id", user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error("Profile not found");
        }

        setUserProfile(data);      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadUserProfile();
    }
  }, [user, authLoading]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="mb-4 text-gray-600">
                  {error || "You need to be logged in to edit your profile."}
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/login">
                    <Button>Go to Login</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline">Back to Profile</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show profile not found
  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">Profile Not Found</h1>
                <p className="mb-4 text-gray-600">
                  We couldn&apos;t find your profile. Please try again or contact support.
                </p>
                <Link href="/profile">
                  <Button>Back to Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
              <p className="text-slate-600">Update your personal information</p>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileEditForm
              userId={userProfile.user_id}
              currentFullName={userProfile.full_name || ""}
              currentBio={userProfile.bio}
              currentAvailability={userProfile.availability}
              currentProfileImageUrl={userProfile.profile_image_url}
            />
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link href="/profile">
            <Button variant="outline">
              Cancel and Return to Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
