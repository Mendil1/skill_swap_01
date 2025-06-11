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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Sessions</h1>
          <p className="text-slate-600 mt-2">
            Manage your skill exchange sessions and schedule new ones
          </p>
        </div>
        <CreateSessionDialog>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </CreateSessionDialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => new Date(s.scheduled_at) > new Date()).length +
               groupSessions.filter(s => new Date(s.scheduled_at) > new Date()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">One-on-One Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <SessionsList
              sessions={sessions}
              groupSessions={groupSessions}
              errors={errors}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Suspense fallback={
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          }>
            <SessionsCalendar
              sessions={sessions}
              groupSessions={groupSessions}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
