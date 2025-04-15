import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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

interface UserSkill {
  user_skill_id: string;
  type: "offer" | "request" | "both";
  skills: Skill; // This is a single skill object, not an array
}

export default async function ProfilePage() {
  const supabase = await createClient();

  // This is the recommended way to verify user authentication in Server Components
  const { data, error } = await supabase.auth.getUser();

  // Redirect to login if no authenticated user
  if (error || !data?.user) {
    redirect("/login");
  }

  const userId = data.user.id; // Use auth user ID directly

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
      .eq("email", data.user.email)
      .single();

    userProfile = profileByEmail;
  }

  // Final fallback if we still can't find a profile
  if (!userProfile) {
    console.error("User profile not found in database");
    // Redirect to error page or homepage
    redirect("/error?message=Profile not found");
  }

  // Get user skills from user_skills table with skill names
  const { data: userSkills } = await supabase
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
    .eq("user_id", userProfile.user_id);

  // Filter skills by type with proper typing
  const offeredSkills = ((userSkills as unknown as UserSkill[]) || []).filter(
    (skill) => skill.type === "offer" || skill.type === "both"
  );

  const requestedSkills = ((userSkills as unknown as UserSkill[]) || []).filter(
    (skill) => skill.type === "request" || skill.type === "both"
  );

  // Handle sign out
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-2xl">My Profile</CardTitle>
            <CardDescription>
              Manage your personal information and skills
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">
                {userProfile?.full_name || data.user.email}
              </p>
              <p className="text-sm text-slate-500">{data.user.email}</p>
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={
                  userProfile?.profile_image_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${
                    userProfile?.full_name || data.user.email
                  }`
                }
                alt={userProfile?.full_name || "User"}
              />
              <AvatarFallback>
                {(userProfile?.full_name || data.user.email)?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <form action={signOut}>
              <Button type="submit" variant="outline" className="mt-4">
                Sign Out
              </Button>
            </form>

            {/* Force Logout Button */}
            <Link href="/auth/logout">
              <Button variant="destructive" className="mt-4">
                Force Logout
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full md:w-96 grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-600" />
            <span>My Profile</span>
          </TabsTrigger>
          <TabsTrigger value="offered" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span>Skills I Offer</span>
          </TabsTrigger>
          <TabsTrigger value="requested" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span>Skills I Want</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 border-b border-purple-100">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-purple-600" />
                    <div>
                      <CardTitle>My Profile Information</CardTitle>
                      <CardDescription>
                        Edit your personal information and preferences
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Full Name</h3>
                      <p>{userProfile?.full_name || "Not set"}</p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-1">Bio</h3>
                      <p className="whitespace-pre-wrap">
                        {userProfile?.bio || "No bio provided yet."}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-1">Availability</h3>
                      <p className="whitespace-pre-wrap">
                        {userProfile?.availability ||
                          "No availability information provided yet."}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p>{data.user.email}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Email cannot be changed here
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-1">User ID</h3>
                      <p className="text-xs text-slate-500">
                        {userProfile?.user_id}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4 border-purple-200">
                <CardHeader className="bg-purple-50 border-b border-purple-100">
                  <CardTitle className="text-lg">Edit Your Profile</CardTitle>
                  <CardDescription>Update your information</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ProfileEditForm
                    userId={userProfile.user_id} // Now guaranteed to exist
                    currentFullName={userProfile?.full_name || ""}
                    currentBio={userProfile?.bio || ""}
                    currentAvailability={userProfile?.availability || ""}
                    currentProfileImageUrl={
                      userProfile?.profile_image_url || null
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="offered">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
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
                    <ul className="space-y-3">
                      {offeredSkills.map((item) => (
                        <SkillItem
                          key={item.user_skill_id}
                          userSkillId={item.user_skill_id}
                          name={item.skills.name}
                          description={item.skills.description}
                          category={item.skills.category}
                          type={item.type}
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-md">
                      <GraduationCap className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                      <p>You haven't added any skills you can teach yet.</p>
                      <p className="text-sm">
                        Add skills using the form to the right.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4 border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="text-lg">
                    Add a Skill to Offer
                  </CardTitle>
                  <CardDescription>Share what you're good at</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SkillForm userId={userProfile.user_id} defaultType="offer" />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requested">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50 border-b border-green-100">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-green-600" />
                    <div>
                      <CardTitle>Skills I Want to Learn</CardTitle>
                      <CardDescription>
                        These are the skills you're looking to learn
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {requestedSkills.length > 0 ? (
                    <ul className="space-y-3">
                      {requestedSkills.map((item) => (
                        <SkillItem
                          key={item.user_skill_id}
                          userSkillId={item.user_skill_id}
                          name={item.skills.name}
                          description={item.skills.description}
                          category={item.skills.category}
                          type={item.type}
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-md">
                      <BookOpen className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                      <p>You haven't added any skills you want to learn yet.</p>
                      <p className="text-sm">
                        Add skills using the form to the right.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4 border-green-200">
                <CardHeader className="bg-green-50 border-b border-green-100">
                  <CardTitle className="text-lg">
                    Add a Skill to Learn
                  </CardTitle>
                  <CardDescription>
                    What would you like to learn?
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SkillForm
                    userId={userProfile.user_id}
                    defaultType="request"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
