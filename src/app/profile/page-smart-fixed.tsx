"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillForm from "./skill-form";
import SkillItem from "./skill-item";
import ProfileEditForm from "./profile-edit-form";
import { GraduationCap, BookOpen, User } from "lucide-react";

// Define types for the user skills data structure
interface Skill {
  skill_id: string;
  name: string;
  description: string | null;
  category: string | null;
}

interface UserProfile {
  user_id: string;
  full_name: string | null;
  bio: string | null;
  email: string;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  profile_image_url: string | null;
}

interface UserSkillRaw {
  user_skill_id: string;
  type: "offer" | "request" | "both";
  skill_id: string;
  skills: Skill[] | Skill | null;
}

interface UserSkill {
  user_skill_id: string;
  type: "offer" | "request" | "both";
  skills: Skill | null;
}

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface ProfileData {
  userProfile: UserProfile;
  offeredSkills: UserSkill[];
  requestedSkills: UserSkill[];
  isRealUser: boolean;
}

// Mock data for fallback when authentication fails
const MOCK_PROFILE_DATA: ProfileData = {
  userProfile: {
    user_id: "demo-user-123",
    full_name: "Demo User",
    bio: "This is a demo profile for testing the SkillSwap application. In production mode, real user data would be displayed here.",
    email: "demo@skillswap.com",
    avatar_url: null,
    location: "Demo City",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_image_url: null,
  },
  offeredSkills: [
    {
      user_skill_id: "mock-offer-1",
      type: "offer" as const,
      skills: {
        skill_id: "skill-js",
        name: "JavaScript Programming",
        description: "Frontend and backend development with JavaScript, Node.js, and React",
        category: "Programming",
      },
    },
    {
      user_skill_id: "mock-offer-2",
      type: "offer" as const,
      skills: {
        skill_id: "skill-react",
        name: "React Development",
        description: "Building modern web applications with React and its ecosystem",
        category: "Web Development",
      },
    },
  ],
  requestedSkills: [
    {
      user_skill_id: "mock-request-1",
      type: "request" as const,
      skills: {
        skill_id: "skill-python",
        name: "Python Programming",
        description: "Data science, machine learning, and backend development with Python",
        category: "Programming",
      },
    },
  ],
  isRealUser: false,
};

function ProfileContent() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProduction, setIsProduction] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  useEffect(() => {
    async function loadProfileData() {
      console.log("[Profile] Auth context user:", user?.email, user?.id);

      // If no user in auth context, try to get session directly
      if (!user) {
        console.log("[Profile] No user in auth context, checking direct session...");
        try {
          const supabase = createClient();
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !sessionData.session?.user) {
            console.log("[Profile] No valid session found, using mock data");
            setProfileData(MOCK_PROFILE_DATA);
            setLoading(false);
            return;
          } else {
            console.log("[Profile] Found direct session for user:", sessionData.session.user.email);
            // Use the session user instead
            await loadRealUserData(sessionData.session.user);
            return;
          }
        } catch (error) {
          console.error("[Profile] Error checking direct session:", error);
          setProfileData(MOCK_PROFILE_DATA);
          setLoading(false);
          return;
        }
      }

      // Load real user data
      await loadRealUserData(user);
    }

    async function loadRealUserData(authUser: AuthUser) {
      try {
        console.log("[Profile] Loading real data for user:", authUser.email, authUser.id);
        const supabase = createClient();
        const userId = authUser.id;

        // Get user profile info from users table
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", userId)
          .single();

        let finalUserProfile = userProfile;

        if (profileError || !userProfile) {
          console.log("[Profile] No profile found by user_id, trying by email:", authUser.email);
          // Try by email as fallback
          const { data: profileByEmail, error: emailError } = await supabase
            .from("users")
            .select("*")
            .eq("email", authUser.email)
            .single();

          if (emailError || !profileByEmail) {
            console.log(
              "[Profile] No profile found by email either, using mock data with real user info"
            );
            // Use mock data but with real user information
            const hybridData = {
              ...MOCK_PROFILE_DATA,
              userProfile: {
                ...MOCK_PROFILE_DATA.userProfile,
                user_id: userId,
                email: authUser.email || "",
                full_name:
                  authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
              },
              isRealUser: true,
            };
            setProfileData(hybridData);
            setLoading(false);
            return;
          }

          finalUserProfile = profileByEmail;
        }

        console.log(
          "[Profile] Found user profile:",
          finalUserProfile.full_name || finalUserProfile.email
        );

        // Get user skills
        const { data: userSkills, error: skillsError } = await supabase
          .from("user_skills")
          .select(
            `
            user_skill_id,
            type,
            skills (
              skill_id,
              name,
              description,
              category
            )
          `
          )
          .eq("user_id", userId);

        if (skillsError) {
          console.error("[Profile] Error loading user skills:", skillsError);
        }

        // Transform user skills data to match our interface
        const transformedSkills: UserSkill[] = (userSkills || []).map((rawSkill: any) => ({
          user_skill_id: rawSkill.user_skill_id,
          type: rawSkill.type,
          skills: Array.isArray(rawSkill.skills) ? rawSkill.skills[0] : rawSkill.skills,
        }));

        const offeredSkills = transformedSkills.filter(
          (skill) => skill.type === "offer" || skill.type === "both"
        );
        const requestedSkills = transformedSkills.filter(
          (skill) => skill.type === "request" || skill.type === "both"
        );

        const realProfileData: ProfileData = {
          userProfile: finalUserProfile,
          offeredSkills,
          requestedSkills,
          isRealUser: true,
        };

        console.log("[Profile] Successfully loaded real user data");
        setProfileData(realProfileData);
        setLoading(false);
      } catch (err) {
        console.error("[Profile] Error loading real user data:", err);
        // Fallback to mock data with real user info if available
        const fallbackData = {
          ...MOCK_PROFILE_DATA,
          userProfile: {
            ...MOCK_PROFILE_DATA.userProfile,
            user_id: authUser.id,
            email: authUser.email || "",
            full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          },
          isRealUser: true,
        };
        setProfileData(fallbackData);
        setLoading(false);
      }
    }

    loadProfileData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No profile data available</p>
          <Link href="/auth/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { userProfile, offeredSkills, requestedSkills, isRealUser } = profileData;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* User Status Indicator */}
      {isRealUser ? (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-green-800">
              Authenticated as: {userProfile.email}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <p className="text-sm font-medium text-yellow-800">
              Demo Mode - Please log in to see your real profile data
            </p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={userProfile.avatar_url || userProfile.profile_image_url || ""}
                alt={userProfile.full_name || ""}
              />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{userProfile.full_name || "No name set"}</h1>
              <p className="text-muted-foreground mb-2">{userProfile.email}</p>
              {userProfile.location && (
                <p className="text-muted-foreground mb-2 text-sm">📍 {userProfile.location}</p>
              )}
              {userProfile.bio && <p className="text-sm">{userProfile.bio}</p>}
            </div>
            <div className="flex space-x-2">
              <Link href="/profile/edit">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Tabs defaultValue="offered" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offered" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Skills I Offer ({offeredSkills.length})
          </TabsTrigger>
          <TabsTrigger value="requested" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Skills I Want ({requestedSkills.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            Add Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Can Teach</CardTitle>
              <CardDescription>
                These are the skills you're willing to share with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offeredSkills.length > 0 ? (
                <div className="space-y-4">
                  {offeredSkills.map((skill) => (
                    <SkillItem
                      key={skill.user_skill_id}
                      userSkillId={skill.user_skill_id}
                      name={skill.skills?.name || "Unknown Skill"}
                      description={skill.skills?.description || "No description"}
                      type={skill.type}
                      category={skill.skills?.category || "Uncategorized"}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  You haven't added any skills to offer yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requested" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Want to Learn</CardTitle>
              <CardDescription>
                These are the skills you're looking to learn from others
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestedSkills.length > 0 ? (
                <div className="space-y-4">
                  {requestedSkills.map((skill) => (
                    <SkillItem
                      key={skill.user_skill_id}
                      userSkillId={skill.user_skill_id}
                      name={skill.skills?.name || "Unknown Skill"}
                      description={skill.skills?.description || "No description"}
                      type={skill.type}
                      category={skill.skills?.category || "Uncategorized"}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  You haven't added any skills you want to learn yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Skills</CardTitle>
              <CardDescription>Add skills you can teach or want to learn</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillForm userId={userProfile.user_id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
