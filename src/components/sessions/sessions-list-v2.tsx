"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Video,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isAfter, isBefore, addHours } from "date-fns";
import { cancelSession, joinGroupSession } from "@/lib/actions/sessions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Session, GroupSession, SessionErrors, SessionStatus } from "@/types/sessions";

type SessionsListProps = {
  sessions: Session[];
  groupSessions: GroupSession[];
  errors: SessionErrors;
};

type RescheduleSessionState = {
  id: string;
  type: "one-on-one" | "group";
  currentTime: string;
} | null;

export default function SessionsList({ sessions, groupSessions, errors }: SessionsListProps) {
  const [isPending, startTransition] = useTransition();
  const [rescheduleSessionState, setRescheduleSession] = useState<RescheduleSessionState>(null);
  const router = useRouter();

  const getSessionStatus = (scheduledAt: string): SessionStatus => {
    const now = new Date();
    const sessionTime = new Date(scheduledAt);
    const sessionEndTime = addHours(sessionTime, 2); // Assume 2 hour max duration

    if (isBefore(sessionEndTime, now)) {
      return "completed";
    } else if (isBefore(sessionTime, now) && isAfter(sessionEndTime, now)) {
      return "ongoing";
    } else {
      return "upcoming";
    }
  };

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "ongoing":
        return <Badge variant="default" className="bg-green-100 text-green-800">Ongoing</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleCancelSession = (sessionId: string, sessionType: "one-on-one" | "group") => {
    startTransition(async () => {
      const result = await cancelSession(sessionId, sessionType);
      if (result.success) {
        toast.success("Session cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.errors?.general?.[0] || "Failed to cancel session");
      }
    });
  };

  const handleJoinGroupSession = (sessionId: string) => {
    startTransition(async () => {
      const result = await joinGroupSession(sessionId);
      if (result.success) {
        toast.success("Joined session successfully");
        router.refresh();
      } else {
        toast.error(result.errors?.general?.[0] || "Failed to join session");
      }
    });
  };

  const allSessions = [
    ...sessions.map(s => ({ ...s, type: "one-on-one" as const })),
    ...groupSessions.map(s => ({ ...s, type: "group" as const }))
  ].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  if (allSessions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No sessions scheduled</h3>
          <p className="text-slate-600 mb-4">
            Start by scheduling your first skill exchange session
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Schedule Your First Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {errors.sessions && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error loading sessions: {errors.sessions}</p>
          </CardContent>
        </Card>
      )}

      {allSessions.map((session) => {
        const status = getSessionStatus(session.scheduled_at);
        const isGroupSession = session.type === "group";

        return (
          <Card key={session.session_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(status)}
                    <Badge variant="outline" className="text-xs">
                      {isGroupSession ? "Group Session" : "One-on-One"}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg">
                    {isGroupSession ? (session as GroupSession).topic : "Skill Exchange Session"}
                  </CardTitle>

                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(session.scheduled_at), "PPP")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(session.scheduled_at), "p")}
                      ({session.duration_minutes} min)
                    </span>
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {status === "upcoming" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => setRescheduleSession({
                            id: session.session_id,
                            type: session.type,
                            currentTime: session.scheduled_at
                          })}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancelSession(session.session_id, session.type)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </>
                    )}
                    {status === "ongoing" && (
                      <DropdownMenuItem>
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isGroupSession ? (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        Organized by {session.organizer.full_name}
                      </span>
                      {(session as GroupSession).group_session_participants && (
                        <span className="text-xs text-slate-500">
                          ({(session as GroupSession).group_session_participants!.length} participants)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(session as Session).participant?.profile_image_url || undefined} />
                        <AvatarFallback>
                          {(session as Session).participant?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{(session as Session).participant?.full_name}</p>
                        <p className="text-slate-500">{(session as Session).participant?.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {isGroupSession && status === "upcoming" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleJoinGroupSession(session.session_id)}
                    disabled={isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Note: RescheduleDialog will be created separately */}
      {rescheduleSessionState && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reschedule Session</h3>
            <p className="text-sm text-slate-600 mb-4">
              Reschedule functionality will be available soon.
            </p>
            <Button
              onClick={() => setRescheduleSession(null)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
