"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string | null;
}

export default function NotificationToolsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || null,
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);  const tools = [
    {
      title: "Notification Diagnostics",
      description: "Comprehensive tool to diagnose and fix notification system issues in one place.",
      path: "/notification-diagnostics",
      icon: "🔍",
    },
    {
      title: "Fix Notification Permissions",
      description: "Apply the correct Row Level Security (RLS) policies to your Supabase database to ensure notifications work properly.",
      path: "/fix-notifications",
      icon: "🔧",
    },
    {
      title: "Performance Optimization Tools",
      description: "Apply database indexes and other optimizations to make the application faster.",
      path: "/performance-tools",
      icon: "⚡",
    },
    {
      title: "Notification System Status",
      description: "Check the status of the notification system components and verify that everything is configured correctly.",
      path: "/notification-system-status",
      icon: "📊",
    },
    {
      title: "Test Notifications",
      description: "Test the notification system by creating and retrieving notifications through different methods.",
      path: "/test-notifications",
      icon: "🧪",
    },
    {
      title: "View Notifications",
      description: "View your actual notifications in the user interface.",
      path: "/notifications",
      icon: "🔔",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notification System Tools</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : !user ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please log in to access notification tools
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{tool.icon}</span>
                    <h2 className="text-xl font-semibold">{tool.title}</h2>
                  </div>
                  <p className="mb-6 text-gray-600">{tool.description}</p>
                  <Link href={tool.path} passHref>
                    <Button className="w-full">Go to {tool.title}</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded">
            <h2 className="text-lg font-semibold mb-2">About the Notification System</h2>
            <p className="mb-2">
              The SkillSwap notification system uses Supabase as a backend database and includes several layers
              of reliability to ensure notifications reach users even under challenging network conditions:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-2">
              <li>Server-side API endpoints with admin privileges for reliable notification creation</li>
              <li>Direct database connections as a fallback method</li>
              <li>Local storage for offline and network-interrupted scenarios</li>
              <li>Retry mechanisms with exponential backoff for failed delivery attempts</li>
              <li>Proper Row Level Security (RLS) policies to ensure data access security</li>
            </ul>
            <p>
              If you're experiencing issues with notifications, use the tools above to diagnose and fix problems.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
