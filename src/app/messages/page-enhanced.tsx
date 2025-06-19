"use client";

import { useAuth } from "@/components/auth-provider";
import { useState } from "react";
import ConversationList from "./components/conversation-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Search, Plus } from "lucide-react";
import Link from "next/link";

export default function EnhancedMessagesPage() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Show loading state briefly
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  // If no user, show login prompt
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Log In</h1>
          <p className="mb-4 text-gray-600">You need to be logged in to view messages.</p>
          <Link
            href="/login"
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">
                  Connect and communicate with your skill-swap partners
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/users">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Find Users
                </Button>
              </Link>
              <Link href="/sessions">
                <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4" />
                  New Session
                </Button>
              </Link>
            </div>
          </div>

          {/* User Status */}
          <div className="mb-6 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-green-400"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Connected as: {user.email}</p>
                <p className="text-xs text-green-600">Real-time messaging enabled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Conversations Sidebar - Takes 1/4 space on desktop */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-280px)] border-0 bg-white shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-indigo-600" />
                  Conversations
                </CardTitle>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)] overflow-hidden p-0">
                <ConversationList userId={user.id} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Takes 3/4 space on desktop */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-280px)] border-0 bg-white shadow-lg">
              <CardContent className="flex h-full items-center justify-center p-0">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-lg">
                    <MessageCircle className="h-12 w-12 text-indigo-600" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">Select a conversation</h3>
                  <p className="mb-8 max-w-md text-lg text-gray-600">
                    Choose a conversation from the sidebar to start messaging, or connect with new
                    users to begin exchanging skills.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link href="/users">
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Users className="mr-2 h-4 w-4" />
                        Browse Users
                      </Button>
                    </Link>
                    <Link href="/sessions">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Session
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Conversations</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Connections</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Skills Shared</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Plus className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
