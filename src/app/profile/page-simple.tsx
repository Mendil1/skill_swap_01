"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, User } from "lucide-react";

// Mock data for production mode
const MOCK_PROFILE_DATA = {
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
    {
      user_skill_id: "mock-offer-3",
      type: "offer" as const,
      skills: {
        skill_id: "skill-design",
        name: "UI/UX Design",
        description: "User interface and user experience design principles",
        category: "Design",
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
    {
      user_skill_id: "mock-request-2",
      type: "request" as const,
      skills: {
        skill_id: "skill-devops",
        name: "DevOps & Cloud",
        description: "AWS, Docker, Kubernetes, and CI/CD pipelines",
        category: "Infrastructure",
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
      category: "Web Development",
    },
    { skill_id: "3", name: "Python", description: "Programming language", category: "Programming" },
    { skill_id: "4", name: "UI/UX Design", description: "Design principles", category: "Design" },
    {
      skill_id: "5",
      name: "DevOps",
      description: "Infrastructure management",
      category: "Infrastructure",
    },
    { skill_id: "6", name: "Node.js", description: "Backend JavaScript", category: "Programming" },
  ],
};

// Simple skill display component for production mode
function SkillCard({ skill, type }: { skill: any; type: "offer" | "request" }) {
  const bgColor = type === "offer" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200";
  const iconColor = type === "offer" ? "text-blue-600" : "text-green-600";
  const Icon = type === "offer" ? GraduationCap : BookOpen;

  return (
    <Card className={`${bgColor} border`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${iconColor} mt-1`} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{skill.skills.name}</h4>
            {skill.skills.description && (
              <p className="mt-1 text-sm text-gray-600">{skill.skills.description}</p>
            )}
            {skill.skills.category && (
              <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {skill.skills.category}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductionProfilePage() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  const { userProfile, offeredSkills, requestedSkills } = MOCK_PROFILE_DATA;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Production Mode Banner */}
      {isProduction && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <p className="text-sm font-medium text-yellow-800">
              Production Demo Mode - Showing sample profile data
            </p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.full_name}`}
                  alt={userProfile.full_name}
                />
                <AvatarFallback>{userProfile.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{userProfile.full_name}</CardTitle>
                <CardDescription>{userProfile.email}</CardDescription>
                {userProfile.location && (
                  <p className="mt-1 text-sm text-gray-500">{userProfile.location}</p>
                )}
              </div>
            </div>
            {userProfile.bio && (
              <div className="mt-4 border-t pt-4">
                <p className="text-gray-700">{userProfile.bio}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Skills Sections */}
        <div className="space-y-6">
          {/* Skills I Can Teach */}
          <Card>
            <CardHeader className="border-b border-blue-100 bg-blue-50">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Skills I Can Teach</CardTitle>
                  <CardDescription>Expertise I can share with others</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {offeredSkills.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {offeredSkills.map((skill) => (
                    <SkillCard key={skill.user_skill_id} skill={skill} type="offer" />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <GraduationCap className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                  <p>No skills to teach added yet.</p>
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
                  <CardDescription>Areas where I'm seeking to grow</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {requestedSkills.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {requestedSkills.map((skill) => (
                    <SkillCard key={skill.user_skill_id} skill={skill} type="request" />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <BookOpen className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                  <p>No learning goals added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/messages">
                <Button variant="default">View Messages</Button>
              </Link>
              <Link href="/sessions">
                <Button variant="outline">Browse Sessions</Button>
              </Link>
              <Link href="/credits">
                <Button variant="outline">Manage Credits</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Development Note */}
        {!isProduction && (
          <Card className="border-dashed border-gray-300">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <User className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">
                  <strong>Development Mode:</strong> In production, this page would show real user
                  profile data and integrate with the full authentication system.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
