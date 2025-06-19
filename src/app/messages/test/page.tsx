"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addSampleMessagingData } from "@/utils/add-sample-messaging-data";
import { Database, MessageCircle, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function MessagingTestPage() {
  const { user, loading } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSampleData = async () => {
    setIsAdding(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await addSampleMessagingData();
      if (result) {
        setSuccess(true);
      } else {
        setError("Failed to add sample data. Check console for details.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Log In</h1>
          <p className="mb-4 text-gray-600">You need to be logged in to add test data.</p>
          <a
            href="/login"
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messaging Test</h1>
              <p className="text-gray-600">Add sample data to test the messaging system</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add Sample Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Sample Messaging Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Click the button below to add sample users, connections, and messages to test the
                messaging system. This will create:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>3 sample users (Alice Johnson, Bob Smith, Carol Chen)</li>
                <li>3 connections with your account (2 accepted, 1 pending)</li>
                <li>5 sample messages in different conversations</li>
              </ul>

              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>
                    Sample data added successfully! Visit the messages page to see it in action.
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAddSampleData}
                  disabled={isAdding}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isAdding ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Adding Data...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Add Sample Data
                    </>
                  )}
                </Button>{" "}
                <Button variant="outline" asChild>
                  <Link href="/messages">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    View Messages
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {" "}
              <ol className="list-inside list-decimal space-y-2 text-gray-600">
                <li>Click &ldquo;Add Sample Data&rdquo; to populate the database</li>
                <li>Navigate to the Messages page to see the conversation list</li>
                <li>Click on a conversation to view the message thread</li>
                <li>Test sending new messages in the conversation</li>
                <li>Check real-time updates by opening multiple browser tabs</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
