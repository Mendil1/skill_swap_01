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
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isAfter, isBefore, addHours } from "date-fns";
import {
  cancelSession,
  joinGroupSession,
  deleteSession,
  leaveGroupSession,
} from "@/lib/actions/sessions-test";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RescheduleDialog from "./reschedule-dialog";
import EditSessionDialog from "./edit-session-dialog";

type SessionsListProps = {
  sessions: Array<{
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    notes?: string;
    location?: string;
    requester: { full_name: string; profile_image_url?: string | null; email?: string };
    participant: { full_name: string; profile_image_url?: string | null; email?: string };
  }>;
  groupSessions: Array<{
    id: string;
    topic: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    notes?: string;
    location?: string;
    creator: { full_name: string; profile_image_url?: string | null; email?: string };
    group_session_participants?: Array<{
      participant: { full_name: string; profile_image_url?: string | null; email?: string };
    }>;
  }>;
  errors: Record<string, string | undefined>;
};

export default function SessionsList({ sessions, groupSessions, errors }: SessionsListProps) {
  const [isPending, startTransition] = useTransition();
  const [rescheduleSession, setRescheduleSession] = useState<{
    id: string;
    type: "one-on-one" | "group";
    currentTime: string;
  } | null>(null);
  const [editSession, setEditSession] = useState<{
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    notes?: string;
    location?: string;
  } | null>(null);
  const router = useRouter();

  const getSessionStatus = (scheduledAt: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Upcoming
          </Badge>
        );
      case "ongoing":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Ongoing
          </Badge>
        );
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleCancelSession = (sessionId: string) => {
    startTransition(async () => {
      const result = await cancelSession(sessionId);
      if (result.success) {
        toast.success("Session cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel session");
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
        toast.error(result.message || "Failed to join session");
      }
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this session? This action cannot be undone."
      )
    ) {
      startTransition(async () => {
        const result = await deleteSession(sessionId);
        if (result.success) {
          toast.success("Session deleted successfully");
          router.refresh();
        } else {
          toast.error(result.message || "Failed to delete session");
        }
      });
    }
  };

  const handleLeaveGroupSession = (sessionId: string) => {
    if (confirm("Are you sure you want to leave this group session?")) {
      startTransition(async () => {
        const result = await leaveGroupSession(sessionId);
        if (result.success) {
          toast.success("Left session successfully");
          router.refresh();
        } else {
          toast.error(result.message || "Failed to leave session");
        }
      });
    }
  };

  const allSessions = [
    ...sessions.map((s) => ({ ...s, type: "one-on-one" as const })),
    ...groupSessions.map((s) => ({ ...s, type: "group" as const })),
  ].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  if (allSessions.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">No sessions scheduled</h3>
          <p className="mb-4 text-slate-600">
            Start by scheduling your first skill exchange session
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Schedule Your First Session</Button>
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
          <Card key={session.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {getStatusBadge(status)}
                    <Badge variant="outline" className="text-xs">
                      {isGroupSession ? "Group Session" : "One-on-One"}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg">
                    {isGroupSession ? session.topic : "Skill Exchange Session"}
                  </CardTitle>

                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(session.scheduled_at), "PPP")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(session.scheduled_at), "p")}({session.duration_minutes} min)
                    </span>
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>{" "}
                  <DropdownMenuContent align="end">
                    {status === "upcoming" && (
                      <>
                        {" "}
                        <DropdownMenuItem
                          onClick={() =>
                            setEditSession({
                              id: session.id,
                              scheduled_at: session.scheduled_at,
                              duration_minutes: session.duration_minutes,
                              notes: "notes" in session ? (session.notes as string) : undefined,
                              location:
                                "location" in session ? (session.location as string) : undefined,
                            })
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Session
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setRescheduleSession({
                              id: session.id,
                              type: isGroupSession ? "group" : "one-on-one",
                              currentTime: session.scheduled_at,
                            })
                          }
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Reschedule Only
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancelSession(session.id)}
                          className="text-orange-600"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        {isGroupSession && (
                          <DropdownMenuItem
                            onClick={() => handleLeaveGroupSession(session.id)}
                            className="text-red-600"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Leave Session
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    {status === "ongoing" && (
                      <DropdownMenuItem>
                        <Video className="mr-2 h-4 w-4" />
                        Join Call
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <MessageSquare className="mr-2 h-4 w-4" />
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
                        Organized by {session.creator.full_name}
                      </span>
                      {session.group_session_participants && (
                        <span className="text-xs text-slate-500">
                          ({session.group_session_participants.length} participants)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.participant?.profile_image_url || undefined} />
                        <AvatarFallback>{session.participant?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{session.participant?.full_name}</p>
                        <p className="text-slate-500">{session.participant?.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {isGroupSession && status === "upcoming" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleJoinGroupSession(session.id)}
                    disabled={isPending}
                  >
                    <UserPlus className="mr-1 h-4 w-4" />
                    Join
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}{" "}
      {rescheduleSession && (
        <RescheduleDialog
          sessionId={rescheduleSession.id}
          currentScheduledAt={rescheduleSession.currentTime}
          onClose={() => setRescheduleSession(null)}
        />
      )}
      {editSession && (
        <EditSessionDialog session={editSession} onClose={() => setEditSession(null)} />
      )}
    </div>
  );
}
