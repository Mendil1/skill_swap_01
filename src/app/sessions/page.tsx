import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Users } from "lucide-react";
import SessionsList from "@/components/sessions/sessions-list";
import CreateSessionDialog from "@/components/sessions/create-session-dialog";
import SessionsCalendar from "@/components/sessions/sessions-calendar";
import { getSessionsServerAction } from "@/lib/actions/get-sessions";

export default async function SessionsPage() {
  // Load sessions data using the server action
  const { sessions, groupSessions, errors } = await getSessionsServerAction();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Sessions</h1>
          <p className="mt-2 text-slate-600">
            Manage your skill exchange sessions and schedule new ones
          </p>
        </div>
        <CreateSessionDialog>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
        </CreateSessionDialog>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter((s) => new Date(s.scheduled_at) > new Date()).length +
                groupSessions.filter((s) => new Date(s.scheduled_at) > new Date()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">One-on-One Sessions</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Sessions</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Sessions List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 w-1/4 rounded bg-slate-200"></div>
                      <div className="h-3 w-1/2 rounded bg-slate-200"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 w-3/4 rounded bg-slate-200"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <SessionsList sessions={sessions} groupSessions={groupSessions} errors={errors} />
          </Suspense>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Suspense
            fallback={
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-1/3 rounded bg-slate-200"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-96 rounded bg-slate-200"></div>
                </CardContent>
              </Card>
            }
          >
            <SessionsCalendar sessions={sessions} groupSessions={groupSessions} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
