import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, GraduationCap, Mail, MessageSquare } from "lucide-react";

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
    .select(`
      user_skill_id,
      type,
      skills (
        skill_id,
        name,
        description
      )
    `)
    .eq("user_id", userId);

  // Get current authenticated user
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === userId;
  
  // If user not found, show 404
  if (userError || !userData) {
    return notFound();
  }

  // Split skills into offered and requested
  const offeredSkills = (userSkills || [])
    .filter(item => item.type === "offer" || item.type === "both");
  
  const requestedSkills = (userSkills || [])
    .filter(item => item.type === "request" || item.type === "both");

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/skills" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Skills Finder
        </Link>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.full_name}`}
                  />
                  <AvatarFallback>{userData.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{userData.full_name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{userData.email}</span>
                  </CardDescription>
                </div>
              </div>

              {!isOwnProfile && (
                <div className="flex flex-wrap gap-2">
                  <Button className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Connect</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {userData.bio && (
              <div>
                <h3 className="font-medium mb-2">About</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{userData.bio}</p>
              </div>
            )}

            {userData.availability && (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Availability</span>
                </h3>
                <p className="text-slate-600 whitespace-pre-wrap">{userData.availability}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teaches" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="teaches" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span>Skills {userData.full_name.split(' ')[0]} Teaches</span>
          </TabsTrigger>
          <TabsTrigger value="learns" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span>Skills {userData.full_name.split(' ')[0]} Wants to Learn</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="teaches">
          <Card>
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Skills {userData.full_name.split(' ')[0]} Can Teach</CardTitle>
                  <CardDescription>
                    These are the skills {userData.full_name.split(' ')[0]} can share with others
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {offeredSkills.length > 0 ? (
                <div className="space-y-4">
                  {offeredSkills.map((skill) => (
                    <div key={skill.user_skill_id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-lg mb-1">{skill.skills.name}</h3>
                      {skill.skills.description && (
                        <p className="text-slate-600">{skill.skills.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-md">
                  <GraduationCap className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  <p>{userData.full_name.split(' ')[0]} hasn't added any skills they can teach yet.</p>
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
                  <CardTitle>Skills {userData.full_name.split(' ')[0]} Wants to Learn</CardTitle>
                  <CardDescription>
                    These are the skills {userData.full_name.split(' ')[0]} is looking to learn
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {requestedSkills.length > 0 ? (
                <div className="space-y-4">
                  {requestedSkills.map((skill) => (
                    <div key={skill.user_skill_id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-lg mb-1">{skill.skills.name}</h3>
                      {skill.skills.description && (
                        <p className="text-slate-600">{skill.skills.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-md">
                  <BookOpen className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  <p>{userData.full_name.split(' ')[0]} hasn't added any skills they want to learn yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!isOwnProfile && (
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">
            Think you could help each other? Send a connection request to start exchanging skills!
          </p>
          <Button className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Connect with {userData.full_name.split(' ')[0]}</span>
          </Button>
        </div>
      )}
    </div>
  );
}