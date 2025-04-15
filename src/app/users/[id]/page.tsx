import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";

interface UserProfileProps {
  params: { id: string };
}

export default async function UserProfilePage({ params }: UserProfileProps) {
  const supabase = await createClient();
  const userId = params.id;

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Fetch user skills with their skill details
  const { data: userSkills, error: skillsError } = await supabase
    .from("user_skills")
    .select(
      `
      user_skill_id,
      type,
      skills (
        skill_id,
        name,
        description
      )
    `
    )
    .eq("user_id", userId);

  // Get current authenticated user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === userId;

  // If user not found, show 404
  if (userError || !userData) {
    return notFound();
  }

  // Split skills into offered and requested
  const offeredSkills = (userSkills || []).filter(
    (item) => item.type === "offer" || item.type === "both"
  );

  const requestedSkills = (userSkills || []).filter(
    (item) => item.type === "request" || item.type === "both"
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link
          href="/skills"
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back to Skills Finder
        </Link>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage
                    src={
                      userData.profile_image_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${userData.full_name}`
                    }
                    alt={userData.full_name || "User"}
                  />
                  <AvatarFallback>
                    {userData.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">
                      {userData.full_name}
                    </CardTitle>
                    {isOwnProfile && (
                      <Badge variant="outline" className="ml-2">
                        This is you
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{userData.email}</span>
                  </CardDescription>
                </div>
              </div>

              {isOwnProfile ? (
                <Link href="/profile">
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Edit Your Profile</span>
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-wrap gap-2 relative group">
                  <Button className="flex items-center gap-2" disabled>
                    <MessageSquare className="h-4 w-4" />
                    <span>Connect</span>
                  </Button>
                  <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-xs text-white p-2 rounded pointer-events-none whitespace-nowrap">
                    Coming soon! Connection requests will be available in the
                    next update.
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {userData.bio ? (
              <div>
                <h3 className="font-medium mb-2">About</h3>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {userData.bio}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">About</h3>
                <p className="text-slate-500 italic">No bio provided yet.</p>
              </div>
            )}

            {userData.availability ? (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Availability</span>
                </h3>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {userData.availability}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Availability</span>
                </h3>
                <p className="text-slate-500 italic">
                  No availability information provided yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teaches" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="teaches" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span>
              Skills {isOwnProfile ? "You" : userData.full_name.split(" ")[0]}{" "}
              Teach{isOwnProfile ? "" : "es"}
            </span>
          </TabsTrigger>
          <TabsTrigger value="learns" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span>
              Skills {isOwnProfile ? "You" : userData.full_name.split(" ")[0]}{" "}
              Want{isOwnProfile ? "" : "s"} to Learn
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teaches">
          <Card>
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>
                    Skills{" "}
                    {isOwnProfile ? "You" : userData.full_name.split(" ")[0]}{" "}
                    Can Teach
                  </CardTitle>
                  <CardDescription>
                    These are the skills{" "}
                    {isOwnProfile ? "you" : userData.full_name.split(" ")[0]}{" "}
                    can share with others
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {offeredSkills.length > 0 ? (
                <div className="space-y-4">
                  {offeredSkills.map((skill) => (
                    <div
                      key={skill.user_skill_id}
                      className="border-b pb-4 last:border-0"
                    >
                      <h3 className="font-medium text-lg mb-1">
                        {skill.skills.name}
                      </h3>
                      {skill.skills.description && (
                        <p className="text-slate-600">
                          {skill.skills.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-md">
                  <GraduationCap className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  <p>
                    {isOwnProfile
                      ? "You haven't"
                      : `${userData.full_name.split(" ")[0]} hasn't`}{" "}
                    added any skills {isOwnProfile ? "you" : "they"} can teach
                    yet.
                  </p>
                  {isOwnProfile && (
                    <p className="mt-2">
                      <Link
                        href="/profile"
                        className="text-blue-600 hover:underline"
                      >
                        Go to your profile
                      </Link>{" "}
                      to add skills you can teach.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learns">
          <Card>
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>
                    Skills{" "}
                    {isOwnProfile ? "You" : userData.full_name.split(" ")[0]}{" "}
                    Want{isOwnProfile ? "" : "s"} to Learn
                  </CardTitle>
                  <CardDescription>
                    These are the skills{" "}
                    {isOwnProfile
                      ? "you're"
                      : `${userData.full_name.split(" ")[0]} is`}{" "}
                    looking to learn
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {requestedSkills.length > 0 ? (
                <div className="space-y-4">
                  {requestedSkills.map((skill) => (
                    <div
                      key={skill.user_skill_id}
                      className="border-b pb-4 last:border-0"
                    >
                      <h3 className="font-medium text-lg mb-1">
                        {skill.skills.name}
                      </h3>
                      {skill.skills.description && (
                        <p className="text-slate-600">
                          {skill.skills.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-md">
                  <BookOpen className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  <p>
                    {isOwnProfile
                      ? "You haven't"
                      : `${userData.full_name.split(" ")[0]} hasn't`}{" "}
                    added any skills {isOwnProfile ? "you" : "they"} want to
                    learn yet.
                  </p>
                  {isOwnProfile && (
                    <p className="mt-2">
                      <Link
                        href="/profile"
                        className="text-blue-600 hover:underline"
                      >
                        Go to your profile
                      </Link>{" "}
                      to add skills you want to learn.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!isOwnProfile && (
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">
            Think you could help each other? Send a connection request to start
            exchanging skills!
          </p>
          <div className="relative inline-block group">
            <Button className="flex items-center gap-2" disabled>
              <MessageSquare className="h-4 w-4" />
              <span>Connect with {userData.full_name.split(" ")[0]}</span>
            </Button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-xs text-white p-2 rounded pointer-events-none whitespace-nowrap">
              Coming soon in the next update!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
