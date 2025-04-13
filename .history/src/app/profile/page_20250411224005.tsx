import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Define types for the user skills data structure
interface Skill {
  skill_id: string;
  name: string;
  description: string | null;
}

interface UserSkill {
  user_skill_id: string;
  type: 'offer' | 'request' | 'both';
  skills: Skill;  // This is a single skill object, not an array
}

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // This is the recommended way to verify user authentication in Server Components
  const { data, error } = await supabase.auth.getUser()
  
  // Redirect to login if no authenticated user
  if (error || !data?.user) {
    redirect('/login')
  }
  
  // Get user profile info from users table
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('email', data.user.email)
    .single()
    
  // Get user skills from user_skills table with skill names
  const { data: userSkills } = await supabase
    .from('user_skills')
    .select(`
      user_skill_id,
      type,
      skills (
        skill_id,
        name,
        description
      )
    `)
    .eq('user_id', userProfile?.user_id || '')
    
  // Filter skills by type with proper typing
  const offeredSkills = (userSkills as unknown as UserSkill[] || []).filter(
    skill => skill.type === 'offer' || skill.type === 'both'
  )
  const requestedSkills = (userSkills as unknown as UserSkill[] || []).filter(
    skill => skill.type === 'request' || skill.type === 'both'
  )
  
  // Handle sign out
  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
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
              <p className="font-medium">{userProfile?.full_name || data.user.email}</p>
              <p className="text-sm text-slate-500">{data.user.email}</p>
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.full_name || data.user.email}`} />
              <AvatarFallback>{(userProfile?.full_name || data.user.email)?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="mt-4">Sign Out</Button>
          </form>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="offered">
        <TabsList className="grid w-full md:w-96 grid-cols-2">
          <TabsTrigger value="offered">Skills I Offer</TabsTrigger>
          <TabsTrigger value="requested">Skills I Need</TabsTrigger>
        </TabsList>
        <TabsContent value="offered">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Can Teach</CardTitle>
              <CardDescription>These are the skills you can share with others.</CardDescription>
            </CardHeader>
            <CardContent>
              {offeredSkills.length > 0 ? (
                <ul className="space-y-2">
                  {offeredSkills.map(item => (
                    <li key={item.user_skill_id} className="p-3 bg-slate-50 rounded-md">
                      <h3 className="font-medium">{item.skills.name}</h3>
                      {item.skills.description && <p className="text-sm text-slate-500">{item.skills.description}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">You haven't added any skills you offer yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requested">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Want to Learn</CardTitle>
              <CardDescription>These are the skills you're looking to learn.</CardDescription>
            </CardHeader>
            <CardContent>
              {requestedSkills.length > 0 ? (
                <ul className="space-y-2">
                  {requestedSkills.map(item => (
                    <li key={item.user_skill_id} className="p-3 bg-slate-50 rounded-md">
                      <h3 className="font-medium">{item.skills.name}</h3>
                      {item.skills.description && <p className="text-sm text-slate-500">{item.skills.description}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">You haven't added any skills you want to learn yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}