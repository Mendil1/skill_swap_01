import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users } from "lucide-react";
import SessionsList from "@/components/sessions/sessions-list";
import CreateSessionDialog from "@/components/sessions/create-session-dialog";
import SessionsCalendar from "@/components/sessions/sessions-calendar";
import { withServerAuth } from "@/lib/auth/server-auth";
import { getSessionsServerAction } from "@/lib/actions/get-sessions";

async function SessionsPageContent() {
  // Use server-side authentication to get sessions data
  const { sessions, groupSessions, errors } = await withServerAuth(async (user) => {
    console.log("[SessionsPage] Loading sessions for user:", user.email);
    return await getSessionsServerAction();
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">My Sessions</h1>
        <p className="text-muted-foreground">Manage your learning sessions and skill exchanges.</p>
      </div>

      {/* Display any errors */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-destructive mb-6">
          <CardHeader>
            <CardTitle className="text-destructive">Issues Loading Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(errors).map(([key, error]) => (
              <p key={key} className="text-destructive text-sm">
                {key}: {error}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sessions.filter((s: any) => s.status === "scheduled").length +
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                groupSessions.filter((s: any) => s.status === "scheduled").length}
            </div>
            <p className="text-muted-foreground text-xs">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                (sessions.reduce((acc: number, s: any) => acc + (s.duration_minutes || 60), 0) +
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  groupSessions.reduce(
                    (acc: number, s: any) => acc + (s.duration_minutes || 60),
                    0
                  )) /
                  60
              )}
            </div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Sessions</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupSessions.length}</div>
            <p className="text-muted-foreground text-xs">Active groups</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>{" "}
          <CreateSessionDialog>Create Session</CreateSessionDialog>
        </div>

        <TabsContent value="list" className="space-y-4">
          <SessionsList sessions={sessions} groupSessions={groupSessions} errors={errors} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <SessionsCalendar sessions={sessions} groupSessions={groupSessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SessionsPageLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">My Sessions</h1>
        <p className="text-muted-foreground">Loading your sessions...</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="bg-muted h-4 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 animate-pulse rounded" />
              <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted h-96 animate-pulse rounded" />
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<SessionsPageLoading />}>
      <SessionsPageContent />
    </Suspense>
  );
}
