import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Search, UserRound } from "lucide-react";

// Define types for our data
interface Skill {
  skill_id: string;
  name: string;
  description: string | null;
}

interface UserWithSkills {
  user_id: string;
  full_name: string;
  email: string;
  bio: string | null;
  availability: string | null;
  offered_skills: {
    skill_id: string;
    name: string;
  }[];
  requested_skills: {
    skill_id: string;
    name: string;
  }[];
}

export default async function SkillsPage({ 
  searchParams 
}: { 
  searchParams: { q?: string; type?: string; } 
}) {
  const supabase = await createClient();
  
  // Get search parameters from URL
  const searchQuery = searchParams.q || '';
  const searchType = searchParams.type || 'all';

  // Fetch all skills for the skills tab and dropdown
  const { data: allSkills, error: skillsError } = await supabase
    .from("skills")
    .select("skill_id, name, description")
    .order('name');

  // Fetch users with their skills
  let usersQuery = supabase
    .from("users")
    .select(`
      user_id, 
      full_name, 
      email,
      bio,
      availability
    `);

  // Add search filter if query provided
  if (searchQuery) {
    usersQuery = usersQuery.ilike('full_name', `%${searchQuery}%`);
  }

  const { data: users, error: usersError } = await usersQuery;

  // Get all user skills
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select(`
      user_id,
      type,
      skills (
        skill_id,
        name
      )
    `);

  // If we have a search query for specific skill, filter by it
  let filteredSkills = allSkills || [];
  if (searchQuery) {
    filteredSkills = filteredSkills.filter(skill => 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  // Process users with their skills
  const usersWithSkills: UserWithSkills[] = (users || []).map(user => {
    const userOfferedSkills = userSkills
      ?.filter(us => us.user_id === user.user_id && (us.type === 'offer' || us.type === 'both'))
      .map(us => ({ 
        skill_id: us.skills.skill_id, 
        name: us.skills.name 
      })) || [];
      
    const userRequestedSkills = userSkills
      ?.filter(us => us.user_id === user.user_id && (us.type === 'request' || us.type === 'both'))
      .map(us => ({ 
        skill_id: us.skills.skill_id, 
        name: us.skills.name 
      })) || [];

    return {
      ...user,
      offered_skills: userOfferedSkills,
      requested_skills: userRequestedSkills
    };
  });

  // Filter users based on search type and skills
  let filteredUsers = usersWithSkills;
  
  if (searchQuery && searchType !== 'all') {
    const matchingSkills = filteredSkills.map(s => s.skill_id);
    
    if (searchType === 'teachers') {
      filteredUsers = filteredUsers.filter(user => 
        user.offered_skills.some(skill => 
          matchingSkills.includes(skill.skill_id) || 
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else if (searchType === 'learners') {
      filteredUsers = filteredUsers.filter(user => 
        user.requested_skills.some(skill => 
          matchingSkills.includes(skill.skill_id) || 
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }

  if (skillsError || usersError) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Skills Finder</h1>
        <p className="text-red-500">
          Error loading data: {skillsError?.message || usersError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Skills Finder</h1>
          <p className="text-slate-600 mt-1">
            Search for skills or find people to learn from and teach
          </p>
        </div>
        
        {/* Search form */}
        <div className="w-full md:w-auto">
          <form className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="search"
                name="q"
                placeholder="Search for skills or people..."
                defaultValue={searchQuery}
                className="pl-9 h-10 w-full md:w-[300px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
              />
            </div>
            <select 
              name="type" 
              defaultValue={searchType}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
            >
              <option value="all">All</option>
              <option value="teachers">Find Teachers</option>
              <option value="learners">Find Learners</option>
            </select>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <Tabs defaultValue="people" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>People</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Skills</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="space-y-8">
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.user_id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                        <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{user.full_name}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {user.bio || "No bio provided yet"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    {user.offered_skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <h3 className="text-sm font-medium">Teaches</h3>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user.offered_skills.map((skill) => (
                            <Badge key={skill.skill_id} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {user.requested_skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <h3 className="text-sm font-medium">Wants to Learn</h3>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user.requested_skills.map((skill) => (
                            <Badge key={skill.skill_id} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <div className="px-6 py-4 bg-slate-50 border-t">
                    <Link 
                      href={`/users/${user.user_id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium border shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                      View Profile
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-lg">
              <UserRound className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold">No users found</h3>
              <p className="mt-2 text-slate-500 max-w-md mx-auto">
                {searchQuery 
                  ? `No users matching "${searchQuery}" were found. Try a different search term or filter.` 
                  : "Start by searching for a specific skill or person above."}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="skills" className="space-y-8">
          {filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSkills.map((skill) => (
                <Link 
                  key={skill.skill_id}
                  href={`/skills?q=${encodeURIComponent(skill.name)}&type=all`}
                  className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <h2 className="text-lg font-semibold mb-2">{skill.name}</h2>
                  {skill.description && (
                    <p className="text-slate-600 text-sm line-clamp-2">{skill.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-lg">
              <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold">No skills found</h3>
              <p className="mt-2 text-slate-500">
                {searchQuery 
                  ? `No skills matching "${searchQuery}" were found.` 
                  : "No skills are currently available in the system."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
