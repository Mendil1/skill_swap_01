import { Database } from "@/types/supabase";

export type Session = Database["public"]["Tables"]["sessions"]["Row"] & {
  organizer: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  };
  participant: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  };
};

export type GroupSession = Database["public"]["Tables"]["group_sessions"]["Row"] & {
  organizer: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  };
  group_session_participants?: Array<{
    user_id: string;
    joined_at: string;
    participant: {
      full_name: string;
      email: string;
      profile_image_url: string | null;
    };
  }>;
};

export type SessionWithType =
  | (Session & { type: "one-on-one" })
  | (GroupSession & { type: "group" });

export type SessionStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type Connection = {
  user_id: string;
  full_name: string;
  email: string;
  profile_image_url: string | null;
};

export type SessionErrors = {
  sessions?: string;
  groupSessions?: string;
};

export type CreateSessionResult =
  | { success: true; sessionId: string }
  | {
      errors: {
        general?: string[];
        scheduledAt?: string[];
        durationMinutes?: string[];
        topic?: string[];
        participantId?: string[];
      };
    };

export type SessionActionResult = { success: true } | { errors: { general?: string[] } };
