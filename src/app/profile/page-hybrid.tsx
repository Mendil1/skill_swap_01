"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    avatar_url?: string;
  };
}

interface ProfileData {
  userProfile: UserProfile;
  offeredSkills: UserSkill[];
  requestedSkills: UserSkill[];
  isRealUser: boolean;
}

function ProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    
    async function loadProfileData() {
      console.log("[Profile] Auth context - user:", user?.email, "authLoading:", authLoading);

      // Wait for auth provider to finish loading before making decisions
      if (authLoading) {
        console.log("[Profile] Auth provider still loading, waiting...");
        setLoading(true);
        return;
      }      // If no user after auth loading is complete, redirect to login
      if (!user) {
        console.log("[Profile] No user found after auth loading complete, redirecting to login");
        if (mounted) {
          router.push("/login?returnUrl=" + encodeURIComponent(window.location.pathname));
        }
        return;
      }

      // Load real user data only if component is still mounted
      if (mounted) {
        await loadRealUserData(user);
      }
    }    async function loadRealUserData(authUser: AuthUser) {
      if (!mounted) return;
      
      try {
        console.log("[Profile] Loading real data for user:", authUser.email, authUser.id);
        setLoading(true);
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
            console.log("[Profile] No profile found by email either, creating basic profile");
            // Create basic profile from auth data
            finalUserProfile = {
              user_id: userId,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "User",
              bio: "Welcome to SkillSwap! Update your profile to get started.",
              email: authUser.email || "",
              avatar_url: null,
              location: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile_image_url: authUser.user_metadata?.avatar_url || null,
            };
          } else {
            finalUserProfile = profileByEmail;
          }
        }

        console.log("[Profile] Found user profile:", finalUserProfile.full_name || finalUserProfile.email);

        // Get user skills
        const { data: userSkills, error: skillsError } = await supabase
          .from("user_skills")
          .select(`
            user_skill_id,
            type,
            skills (
              skill_id,
              name,
              description,
              category
            )
          `)
          .eq("user_id", userId);

        if (skillsError) {
          console.error("[Profile] Error loading user skills:", skillsError);
        }

        // Transform user skills data to match our interface
        const transformedSkills: UserSkill[] = (userSkills || []).map((rawSkill: {
          user_skill_id: string;
          type: "offer" | "request" | "both";
          skills: Skill | Skill[] | null;
        }) => ({
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
        };        console.log("[Profile] Successfully loaded real user data");
        if (mounted) {
          setProfileData(realProfileData);
          setLoading(false);
        }
      } catch (err) {
        console.error("[Profile] Error loading real user data:", err);
        // Even on error, create basic profile from auth data
        const basicProfile: ProfileData = {
          userProfile: {
            user_id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "User",
            bio: "Welcome to SkillSwap! Update your profile to get started.",
            email: authUser.email || "",
            avatar_url: null,
            location: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile_image_url: authUser.user_metadata?.avatar_url || null,
          },
          offeredSkills: [],
          requestedSkills: [],
          isRealUser: true,
        };
        if (mounted) {
          setProfileData(basicProfile);
          setLoading(false);
        }
      }
    }

    loadProfileData();
    
    return () => {
      mounted = false;
    };
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load profile data.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const { userProfile, offeredSkills, requestedSkills, isRealUser } = profileData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* User Status Indicator */}
      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Authenticated as: {userProfile.email}
          </span>
          {isRealUser && (
            <span className="text-xs text-green-600 ml-2">
              ✓ Real user data loaded (Client-side)
            </span>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage
                src={userProfile.profile_image_url || userProfile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.full_name || userProfile.email}`}
                alt={userProfile.full_name || userProfile.email}
              />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {userProfile.full_name || userProfile.email.split('@')[0]}
              </CardTitle>
              <CardDescription className="text-lg">
                {userProfile.email}
              </CardDescription>
              {userProfile.location && (
                <p className="text-sm text-muted-foreground mt-1">
                  📍 {userProfile.location}
                </p>
              )}
            </div>
            <div className="text-right">
              <Button asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          </CardHeader>
          {userProfile.bio && (
            <CardContent>
              <p className="text-muted-foreground">{userProfile.bio}</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Skills Tabs */}
      <Tabs defaultValue="offered" className="space-y-6">
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
            <User className="h-4 w-4" />
            Manage Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Can Teach</CardTitle>
              <CardDescription>
                These are the skills you&apos;re willing to share with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offeredSkills.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {offeredSkills.map((userSkill) => {
                    const skill = userSkill.skills;
                    if (!skill) return null;
                    
                    return (
                      <Card key={userSkill.user_skill_id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{skill.name}</h3>
                          {skill.category && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {skill.category}
                            </span>
                          )}
                        </div>
                        {skill.description && (
                          <p className="text-sm text-muted-foreground">
                            {skill.description}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No skills offered yet</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="#add">Add Your First Skill</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requested" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Want to Learn</CardTitle>
              <CardDescription>
                These are the skills you&apos;re looking to acquire
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestedSkills.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {requestedSkills.map((userSkill) => {
                    const skill = userSkill.skills;
                    if (!skill) return null;
                    
                    return (
                      <Card key={userSkill.user_skill_id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{skill.name}</h3>
                          {skill.category && (
                            <span className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded">
                              {skill.category}
                            </span>
                          )}
                        </div>
                        {skill.description && (
                          <p className="text-sm text-muted-foreground">
                            {skill.description}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No learning requests yet</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="#add">Add Learning Goals</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Skills</CardTitle>
              <CardDescription>
                Add new skills you can offer or want to learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/skills/add">Add New Skill</Link>
                </Button>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4 text-center">
                    <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-2">Offer Skills</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your expertise and earn credits
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/skills/offer">Add Skills to Offer</Link>
                    </Button>
                  </Card>
                  
                  <Card className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <h3 className="font-semibold mb-2">Request Skills</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Find skills you want to learn
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/skills/request">Add Learning Goals</Link>
                    </Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" asChild>
                <Link href="/sessions">View Sessions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/messages">Messages</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/credits">View Credits</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
