import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserRound, GraduationCap, BookOpen } from "lucide-react";
import SearchForm from "./search-form";

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
  searchParams: { q?: string; type?: string; page?: string; } 
}) {
  const supabase = await createClient();
  
  // Get search parameters from URL
  const searchQuery = searchParams.q || '';
  const searchType = searchParams.type || 'all';
  const currentPage = parseInt(searchParams.page || '1', 10);
  const pageSize = 12; // Number of items per page
  
  // Calculate pagination values
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  // First get all skill IDs that have users offering them
  const { data: skillsWithUsers } = await supabase
    .from('user_skills')
    .select('skill_id')
    .or('type.eq.offer,type.eq.both');
  
  // Extract the unique skill IDs that have users offering them
  const skillIdsWithUsers = Array.from(new Set(skillsWithUsers?.map(item => item.skill_id) || []));
  
  // Fetch only skills that have users offering them
  let skillsQuery = supabase
    .from("skills")
    .select("skill_id, name, description", { count: "exact" });
  
  // Only include skills that have users offering them
  if (skillIdsWithUsers.length > 0) {
    skillsQuery = skillsQuery.in('skill_id', skillIdsWithUsers);
  } else {
    // If no skills have users, return an empty result set
    skillsQuery = skillsQuery.eq('skill_id', 'no-match-placeholder');
  }
  
  if (searchQuery) {
    skillsQuery = skillsQuery.ilike('name', `%${searchQuery}%`);
  }
  
  const { data: allSkills, error: skillsError, count: skillsCount } = await skillsQuery
    .order('name')
    .range(from, to);

  // Get matching skill IDs for user filtering (if searching by skill name)
  const matchingSkillIds = searchQuery 
    ? (allSkills || []).map(skill => skill.skill_id)
    : [];

  // Fetch users with basic information
  // Use a more efficient query that does initial filtering on the server side
  let usersQuery = supabase.from("users").select(`
    user_id, 
    full_name, 
    email,
    bio,
    availability
  `, { count: "exact" });

  // If searching by user name, filter on server side
  if (searchQuery && matchingSkillIds.length === 0) {
    usersQuery = usersQuery.ilike('full_name', `%${searchQuery}%`);
  }

  const { data: users, error: usersError, count: usersCount } = await usersQuery
    .range(from, to);

  // Get all user skills but optimize based on search type
  let userSkillsQuery = supabase.from("user_skills").select(`
    user_id,
    type,
    skills (
      skill_id,
      name
    )
  `);
  
  // If searching by skill, optimize by getting only relevant user_skills
  if (searchQuery && matchingSkillIds.length > 0) {
    userSkillsQuery = userSkillsQuery.in('skill_id', matchingSkillIds);
  }

  const { data: userSkills } = await userSkillsQuery;
  
  // Get user IDs that match the skill filter criteria (if searching by skill)
  const matchingUserIds = new Set<string>();
  
  if (searchQuery && matchingSkillIds.length > 0) {
    userSkills?.forEach(skill => {
      if (searchType === 'all' || 
         (searchType === 'teachers' && (skill.type === 'offer' || skill.type === 'both')) ||
         (searchType === 'learners' && (skill.type === 'request' || skill.type === 'both'))) {
        matchingUserIds.add(skill.user_id);
      }
    });
  }

  // Process users with their skills - only for users that match our filter criteria
  const usersWithSkills: UserWithSkills[] = (users || [])
    // Filter users if we're searching by skill
    .filter(user => {
      if (searchQuery && matchingSkillIds.length > 0) {
        return matchingUserIds.has(user.user_id);
      }
      return true;
    })
    .map(user => {
      const userOfferedSkills = userSkills
        ?.filter(us => us.user_id === user.user_id && (us.type === 'offer' || us.type === 'both'))
        .map(us => ({ 
          skill_id: us.skills?.skill_id || '', 
          name: us.skills?.name || '' 
        })) || [];
        
      const userRequestedSkills = userSkills
        ?.filter(us => us.user_id === user.user_id && (us.type === 'request' || us.type === 'both'))
        .map(us => ({ 
          skill_id: us.skills?.skill_id || '', 
          name: us.skills?.name || '' 
        })) || [];

      return {
        ...user,
        offered_skills: userOfferedSkills,
        requested_skills: userRequestedSkills
      };
    });

  // Calculate total pages for pagination
  const totalUsersPages = usersCount ? Math.ceil(usersCount / pageSize) : 1;
  const totalSkillsPages = skillsCount ? Math.ceil(skillsCount / pageSize) : 1;

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
        
        {/* Use the client-side search form component */}
        <div className="w-full md:w-auto">
          <SearchForm />
        </div>
      </div>

      <Tabs defaultValue="people" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>People ({usersWithSkills.length})</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Skills ({allSkills?.length || 0})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="space-y-8">
          {usersWithSkills.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersWithSkills.map((user) => (
                  <Card key={user.user_id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                            {user.offered_skills.slice(0, 3).map((skill) => (
                              <Badge key={skill.skill_id} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                {skill.name}
                              </Badge>
                            ))}
                            {user.offered_skills.length > 3 && (
                              <Badge variant="outline" className="bg-white">
                                +{user.offered_skills.length - 3} more
                              </Badge>
                            )}
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
                            {user.requested_skills.slice(0, 3).map((skill) => (
                              <Badge key={skill.skill_id} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                                {skill.name}
                              </Badge>
                            ))}
                            {user.requested_skills.length > 3 && (
                              <Badge variant="outline" className="bg-white">
                                +{user.requested_skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <div className="px-6 py-4 bg-slate-50 border-t">
                      <Link 
                        href={`/users/${user.user_id}`}
                        className="inline-flex h-9 w-full justify-center items-center rounded-md bg-white px-4 py-2 text-sm font-medium border shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                      >
                        View Profile
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Pagination for users */}
              {totalUsersPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    {/* First page */}
                    <PaginationLink 
                      page={1} 
                      current={currentPage} 
                      searchParams={{ q: searchQuery, type: searchType }}
                    />
                    
                    {/* Previous ellipsis if needed */}
                    {currentPage > 3 && <span className="px-3 py-2">...</span>}
                    
                    {/* Page before current if it exists */}
                    {currentPage > 1 && (
                      <PaginationLink 
                        page={currentPage - 1} 
                        current={currentPage} 
                        searchParams={{ q: searchQuery, type: searchType }}
                      />
                    )}
                    
                    {/* Current page */}
                    <span className="px-3 py-2 bg-slate-900 text-white rounded-md">
                      {currentPage}
                    </span>
                    
                    {/* Page after current if it exists */}
                    {currentPage < totalUsersPages && (
                      <PaginationLink 
                        page={currentPage + 1} 
                        current={currentPage} 
                        searchParams={{ q: searchQuery, type: searchType }}
                      />
                    )}
                    
                    {/* Next ellipsis if needed */}
                    {currentPage < totalUsersPages - 2 && <span className="px-3 py-2">...</span>}
                    
                    {/* Last page if not current */}
                    {currentPage !== totalUsersPages && (
                      <PaginationLink 
                        page={totalUsersPages} 
                        current={currentPage}
                        searchParams={{ q: searchQuery, type: searchType }}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
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
          {allSkills && allSkills.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allSkills.map((skill) => (
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
              
              {/* Pagination for skills */}
              {totalSkillsPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    {/* First page */}
                    <PaginationLink 
                      page={1} 
                      current={currentPage} 
                      searchParams={{ q: searchQuery, type: searchType }}
                    />
                    
                    {/* Previous ellipsis if needed */}
                    {currentPage > 3 && <span className="px-3 py-2">...</span>}
                    
                    {/* Page before current if it exists */}
                    {currentPage > 1 && (
                      <PaginationLink 
                        page={currentPage - 1} 
                        current={currentPage} 
                        searchParams={{ q: searchQuery, type: searchType }}
                      />
                    )}
                    
                    {/* Current page */}
                    <span className="px-3 py-2 bg-slate-900 text-white rounded-md">
                      {currentPage}
                    </span>
                    
                    {/* Page after current if it exists */}
                    {currentPage < totalSkillsPages && (
                      <PaginationLink 
                        page={currentPage + 1} 
                        current={currentPage} 
                        searchParams={{ q: searchQuery, type: searchType }}
                      />
                    )}
                    
                    {/* Next ellipsis if needed */}
                    {currentPage < totalSkillsPages - 2 && <span className="px-3 py-2">...</span>}
                    
                    {/* Last page if not current */}
                    {currentPage !== totalSkillsPages && (
                      <PaginationLink 
                        page={totalSkillsPages} 
                        current={currentPage}
                        searchParams={{ q: searchQuery, type: searchType }}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
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

// Helper component for pagination links
function PaginationLink({ 
  page, 
  current, 
  searchParams 
}: { 
  page: number;
  current: number;
  searchParams: { q?: string; type?: string; }
}) {
  // Build URL with existing search params plus new page
  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.type) params.set("type", searchParams.type);
  params.set("page", page.toString());
  
  return (
    <Link
      href={`/skills?${params.toString()}`}
      className={`px-3 py-2 border rounded-md hover:bg-slate-100 ${
        page === current ? 'border-slate-900' : 'border-slate-200'
      }`}
    >
      {page}
    </Link>
  );
}
