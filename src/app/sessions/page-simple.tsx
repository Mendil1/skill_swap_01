"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Users, Star, BookOpen, User } from "lucide-react";

// Mock session data for production mode
const MOCK_SESSIONS = [
  {
    id: "session-1",
    title: "React Hooks Deep Dive",
    description: "Learn advanced React hooks patterns and custom hook development",
    instructor: {
      id: "instructor-1",
      name: "Sarah Johnson",
      avatar: null,
      rating: 4.9,
      totalSessions: 45,
    },
    skill: "React",
    category: "Web Development",
    date: "2025-06-15",
    time: "14:00",
    duration: 60,
    cost: 3,
    location: "Online",
    maxParticipants: 8,
    currentParticipants: 5,
    difficulty: "Intermediate",
    status: "upcoming",
  },
  {
    id: "session-2",
    title: "Python Data Analysis Fundamentals",
    description: "Introduction to pandas, numpy, and matplotlib for data analysis",
    instructor: {
      id: "instructor-2",
      name: "Michael Chen",
      avatar: null,
      rating: 4.8,
      totalSessions: 32,
    },
    skill: "Python",
    category: "Programming",
    date: "2025-06-16",
    time: "10:00",
    duration: 90,
    cost: 4,
    location: "Online",
    maxParticipants: 6,
    currentParticipants: 3,
    difficulty: "Beginner",
    status: "upcoming",
  },
  {
    id: "session-3",
    title: "UI/UX Design Principles Workshop",
    description: "Learn fundamental design principles and best practices for user interfaces",
    instructor: {
      id: "instructor-3",
      name: "Emily Rodriguez",
      avatar: null,
      rating: 4.95,
      totalSessions: 28,
    },
    skill: "UI/UX Design",
    category: "Design",
    date: "2025-06-17",
    time: "16:30",
    duration: 120,
    cost: 5,
    location: "Online",
    maxParticipants: 10,
    currentParticipants: 7,
    difficulty: "All Levels",
    status: "upcoming",
  },
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-700";
    case "intermediate":
      return "bg-yellow-100 text-yellow-700";
    case "advanced":
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SessionCard({ session }: { session: (typeof MOCK_SESSIONS)[0] }) {
  const availableSpots = session.maxParticipants - session.currentParticipants;
  const isAlmostFull = availableSpots <= 2;

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2 text-lg">{session.title}</CardTitle>
            <CardDescription className="mb-3 text-sm">{session.description}</CardDescription>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{session.skill}</Badge>
              <Badge className={getDifficultyColor(session.difficulty)}>{session.difficulty}</Badge>
              <Badge variant="outline">{session.category}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{session.cost}</div>
            <div className="text-xs text-gray-500">credits</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Instructor Info */}
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                session.instructor.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${session.instructor.name}`
              }
              alt={session.instructor.name}
            />
            <AvatarFallback>
              {session.instructor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium">{session.instructor.name}</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{session.instructor.rating}</span>
              </div>
              <span>•</span>
              <span>{session.instructor.totalSessions} sessions</span>
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(session.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {session.time} ({session.duration} min)
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{session.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {session.currentParticipants}/{session.maxParticipants} participants
              {isAlmostFull && <span className="font-medium text-orange-600"> (Almost full!)</span>}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full" disabled={availableSpots === 0}>
          {availableSpots === 0 ? "Session Full" : `Join Session (${session.cost} credits)`}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ProductionSessionsPage() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Production Mode Banner */}
      {isProduction && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <p className="text-sm font-medium text-yellow-800">
              Production Demo Mode - Showing sample session data
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                <div>
                  <CardTitle>Learning Sessions</CardTitle>
                  <CardDescription>
                    Discover and join skill-sharing sessions with expert instructors
                  </CardDescription>
                </div>
              </div>
              <Button>Create Session</Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filter/Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-64 flex-1">
                <input
                  type="text"
                  placeholder="Search sessions by skill, topic, or instructor..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Categories</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="web-development">Web Development</option>
                <option value="data-science">Data Science</option>
              </select>
              <select className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_SESSIONS.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>

        {/* My Sessions Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Sessions</CardTitle>
            <CardDescription>Sessions you're teaching or attending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-gray-500">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No sessions yet</h3>
              <p className="mb-4 text-gray-500">
                Join a session to start learning or create one to start teaching
              </p>
              <div className="flex justify-center gap-4">
                <Button>Browse Sessions</Button>
                <Button variant="outline">Create Session</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/profile">
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline">View Messages</Button>
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
                <BookOpen className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">
                  <strong>Development Mode:</strong> In production, this page would show real
                  learning sessions from the database and allow actual booking functionality.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
