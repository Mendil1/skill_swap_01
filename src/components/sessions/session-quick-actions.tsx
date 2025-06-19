"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Video,
  MessageSquare,
  UserPlus,
  UserMinus
} from "lucide-react";
import { format } from "date-fns";

type SessionQuickActionsProps = {
  session: {
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    type: "one-on-one" | "group";
    notes?: string;
    location?: string;
  };
  onEdit: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  disabled?: boolean;
};

export default function SessionQuickActions({
  session,
  onEdit,
  onReschedule,
  onCancel,
  onDelete,
  onJoin,
  onLeave,
  disabled = false,
}: SessionQuickActionsProps) {
  const isUpcoming = session.status === "upcoming";
  const isOngoing = session.status === "ongoing";
  const isGroupSession = session.type === "group";

  return (
    <div className="flex flex-col sm:flex-row gap-2 p-3 bg-slate-50 border-t">
      {/* Session Info */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4" />
          {format(new Date(session.scheduled_at), "EEE, MMM d 'at' h:mm a")}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {session.duration_minutes} min
          </span>
          {session.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {session.location}
            </span>
          )}
          <Badge variant={isGroupSession ? "secondary" : "outline"} className="text-xs">
            {isGroupSession ? (
              <>
                <Users className="h-3 w-3 mr-1" />
                Group
              </>
            ) : (
              "1-on-1"
            )}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1">
        {isUpcoming && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              disabled={disabled}
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReschedule}
              disabled={disabled}
              className="text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={disabled}
              className="text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50"
            >
              <UserMinus className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              disabled={disabled}
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </>
        )}

        {isOngoing && (
          <Button
            size="sm"
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <Video className="h-3 w-3 mr-1" />
            Join Call
          </Button>
        )}

        {isGroupSession && isUpcoming && onJoin && (
          <Button
            size="sm"
            variant="outline"
            onClick={onJoin}
            disabled={disabled}
            className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Join
          </Button>
        )}

        {isGroupSession && isUpcoming && onLeave && (
          <Button
            size="sm"
            variant="outline"
            onClick={onLeave}
            disabled={disabled}
            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
          >
            <UserMinus className="h-3 w-3 mr-1" />
            Leave
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="text-slate-600 hover:text-slate-700"
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Message
        </Button>
      </div>
    </div>
  );
}
