"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductionAuthGuard } from "@/components/production-auth-guard";
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

interface UserSkillRaw {
  user_skill_id: string;
  type: "offer" | "request" | "both";
  skill_id: string;
  skills: Skill[] | Skill | null; // Supabase can return array or single object
}

interface UserSkill {
  user_skill_id: string;
  type: "offer" | "request" | "both";
  skills: Skill | null; // Normalized to single object
}

interface ProfileData {
  userProfile: any;
  offeredSkills: UserSkill[];
  requestedSkills: UserSkill[];
  allSkills: any[];
}

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
      // In production mode, if no user is available, create mock data
      if (isProduction && !user) {
        console.log("[Profile] Production mode: No authenticated user, using mock data");
        const mockProfileData: ProfileData = {
          userProfile: {
            user_id: "production-user",
            full_name: "Demo User",
            bio: "This is a demo profile for production testing.",
            email: "demo@skillswap.com",
            avatar_url: null,
            location: "Demo City",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          offeredSkills: [
            {
              user_skill_id: "mock-1",
              type: "offer" as const,
              skills: {
                skill_id: "mock-skill-1",
                name: "JavaScript",
                description: "Frontend and backend development",
                category: "Programming",
              },
            },
            {
              user_skill_id: "mock-2",
              type: "offer" as const,
              skills: {
                skill_id: "mock-skill-2",
                name: "React",
                description: "Modern web development",
                category: "Framework",
              },
            },
          ],
          requestedSkills: [
            {
              user_skill_id: "mock-3",
              type: "request" as const,
              skills: {
                skill_id: "mock-skill-3",
                name: "Python",
                description: "Data science and ML",
                category: "Programming",
              },
            },
          ],
          allSkills: [
            {
              skill_id: "1",
              name: "JavaScript",
              description: "Programming language",
              category: "Programming",
            },
            {
              skill_id: "2",
              name: "React",
              description: "Frontend framework",
              category: "Framework",
            },
            {
              skill_id: "3",
              name: "Python",
              description: "Programming language",
              category: "Programming",
            },
            { skill_id: "4", name: "Design", description: "UI/UX Design", category: "Creative" },
          ],
        };

        setProfileData(mockProfileData);
        setLoading(false);
        return;
      }

      // Normal flow for development or when user is authenticated
      if (!user) {
        if (!isProduction) {
          router.push("/login");
        }
        return;
      }

      try {
        const supabase = createClient();
        const userId = user.id;

        // Get user profile info from users table - try by ID first, then fall back to email
        let { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", userId)
          .single();

        // If user not found by ID, try by email (fallback for older accounts)
        if (!userProfile) {
          const { data: profileByEmail } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          userProfile = profileByEmail;
        }

        // Final fallback if we still can't find a profile
        if (!userProfile) {
          console.error("User profile not found in database");
          setError("Profile not found. Please try logging out and logging back in.");
          setLoading(false);
          return;
        }

        // Get user skills from user_skills table with skill names
        const { data: userSkills } = await supabase
          .from("user_skills")
          .select(
            `
            user_skill_id,
            type,
            skill_id,
            skills!inner (
              skill_id,
              name,
              description,
              category
            )
          `
          )
          .eq("user_id", userId);

        // Get all available skills for the dropdown
        const { data: allSkills } = await supabase.from("skills").select("*").order("name");

        // Normalize the user skills data
        const normalizedSkills: UserSkill[] = (userSkills || []).map((skill: UserSkillRaw) => ({
          ...skill,
          skills: Array.isArray(skill.skills) ? skill.skills[0] : skill.skills,
        }));

        // Separate offered and requested skills
        const offeredSkills = normalizedSkills.filter(
          (skill) => skill.type === "offer" || skill.type === "both"
        );
        const requestedSkills = normalizedSkills.filter(
          (skill) => skill.type === "request" || skill.type === "both"
        );

        setProfileData({
          userProfile,
          offeredSkills,
          requestedSkills,
          allSkills: allSkills || [],
        });
      } catch (err) {
        console.error("Error loading profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Possible solutions:</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-500">
              <li>Try logging out and logging back in</li>
              <li>Clear your browser cookies</li>
              <li>If using an email link, request a new one</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
          <div className="mt-6 space-x-4">
            <Link href="/auth/logout">
              <Button variant="outline">Sign Out</Button>
            </Link>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  const { userProfile, offeredSkills, requestedSkills, allSkills } = profileData;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={
                    userProfile.profile_image_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.full_name}`
                  }
                  alt={userProfile.full_name || "User"}
                />
                <AvatarFallback>
                  {userProfile.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{userProfile.full_name || "User"}</CardTitle>
                <CardDescription>{userProfile.email || user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Skills Management */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="skills">Manage Skills</TabsTrigger>
            <TabsTrigger value="profile">Edit Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            {/* Add New Skill */}
            <Card>
              <CardHeader>
                <CardTitle>Add a New Skill</CardTitle>
                <CardDescription>
                  Share what you can teach or what you&apos;d like to learn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillForm userId={userProfile.user_id || user?.id || "production-user"} />
              </CardContent>
            </Card>

            {/* Skills I Can Teach */}
            <Card>
              <CardHeader className="border-b border-blue-100 bg-blue-50">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Skills I Can Teach</CardTitle>
                    <CardDescription>
                      These are the skills you can share with others
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {offeredSkills.length > 0 ? (
                  <div className="space-y-4">
                    {offeredSkills.map((skill) => (
                      <SkillItem
                        key={skill.user_skill_id}
                        userSkillId={skill.user_skill_id}
                        name={skill.skills?.name || "Unknown Skill"}
                        description={skill.skills?.description}
                        type={skill.type}
                        category={skill.skills?.category}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md bg-slate-50 py-8 text-center text-slate-500">
                    <GraduationCap className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                    <p>You haven&apos;t added any skills you can teach yet.</p>
                    <p className="mt-1 text-sm">
                      Add skills above to start sharing your knowledge!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills I Want to Learn */}
            <Card>
              <CardHeader className="border-b border-green-100 bg-green-50">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle>Skills I Want to Learn</CardTitle>
                    <CardDescription>
                      These are the skills you&apos;re looking to learn
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {requestedSkills.length > 0 ? (
                  <div className="space-y-4">
                    {requestedSkills.map((skill) => (
                      <SkillItem
                        key={skill.user_skill_id}
                        userSkillId={skill.user_skill_id}
                        name={skill.skills?.name || "Unknown Skill"}
                        description={skill.skills?.description}
                        type={skill.type}
                        category={skill.skills?.category}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md bg-slate-50 py-8 text-center text-slate-500">
                    <BookOpen className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                    <p>You haven&apos;t added any skills you want to learn yet.</p>
                    <p className="mt-1 text-sm">Add skills above to start learning from others!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle>Edit Your Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ProfileEditForm
                  userId={userProfile.user_id || user?.id || "production-user"}
                  currentFullName={userProfile.full_name || ""}
                  currentBio={userProfile.bio}
                  currentAvailability={userProfile.availability || null}
                  currentProfileImageUrl={userProfile.profile_image_url}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProductionAuthGuard>
      <ProfileContent />
    </ProductionAuthGuard>
  );
}
