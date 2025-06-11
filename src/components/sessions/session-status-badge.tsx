"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, PlayCircle } from "lucide-react";

type SessionStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

type SessionStatusBadgeProps = {
  status: SessionStatus;
  className?: string;
};

export default function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const statusConfig = {
    upcoming: {
      icon: Clock,
      label: "Upcoming",
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800 border-blue-200"
    },
    ongoing: {
      icon: PlayCircle,
      label: "Ongoing",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200"
    },
    completed: {
      icon: CheckCircle,
      label: "Completed",
      variant: "secondary" as const,
      className: "bg-slate-100 text-slate-700 border-slate-200"
    },
    cancelled: {
      icon: XCircle,
      label: "Cancelled",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-200"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
