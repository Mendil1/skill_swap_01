"use server";

import { createClient } from "@/utils/supabase/server";
import { getAuthenticatedUser } from "@/utils/auth-helpers";

export async function getSessionsServerAction() {
  const supabase = await createClient();

  try {
    // Use improved authentication with better error handling
    const user = await getAuthenticatedUser();

    // If no user returned (temporary auth issue), return empty data instead of crashing
    if (!user) {
      console.log("[GetSessions] No user returned from getAuthenticatedUser, returning empty data");
      return {
        sessions: [],
        groupSessions: [],
        errors: {
          auth: "Authentication temporarily unavailable. Please refresh the page.",
        },
      };
    }

    // Fetch one-on-one sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select(
        `
        id,
        scheduled_at,
        duration_minutes,
        status,
        organizer_id,
        participant_id
      `
      )
      .or(`organizer_id.eq.${user.id},participant_id.eq.${user.id}`)
      .order("scheduled_at", { ascending: true });

    // Fetch group sessions
    const { data: groupSessions, error: groupSessionsError } = await supabase
      .from("group_sessions")
      .select(
        `
        id,
        topic,
        scheduled_at,
        duration_minutes,
        status,
        creator_id
      `
      )
      .or(`creator_id.eq.${user.id}`)
      .order("scheduled_at", { ascending: true });

    // Fetch group session participants
    const {
      data: groupParticipants,
    }: {
      data: Array<{
        group_session_id: string;
        user_id: string;
      }> | null;
    } =
      groupSessions && groupSessions.length > 0
        ? await supabase
            .from("group_session_participants")
            .select(
              `
          group_session_id,
          user_id
        `
            )
            .in(
              "group_session_id",
              groupSessions.map((gs) => gs.id)
            )
        : { data: [] };

    // Get user profiles for the sessions
    const userIds = new Set<string>();
    sessions?.forEach((session) => {
      userIds.add(session.organizer_id);
      userIds.add(session.participant_id);
    });
    groupSessions?.forEach((session) => {
      userIds.add(session.creator_id);
    });
    // Add group session participants to user IDs
    groupParticipants?.forEach((gp) => {
      userIds.add(gp.user_id);
    });

    const { data: profiles } =
      userIds.size > 0
        ? await supabase
            .from("users")
            .select("user_id, full_name, profile_image_url, email")
            .in("user_id", Array.from(userIds))
        : { data: [] };

    const profileMap = new Map<
      string,
      {
        full_name: string;
        email?: string;
        profile_image_url?: string | null;
      }
    >();
    profiles?.forEach((profile) => {
      profileMap.set(profile.user_id, {
        full_name: profile.full_name,
        email: profile.email,
        profile_image_url: profile.profile_image_url,
      });
    });

    // Create a map of group session participants
    const participantsMap = new Map<
      string,
      Array<{
        participant: {
          full_name: string;
          email?: string;
          profile_image_url?: string | null;
        };
      }>
    >();
    groupParticipants?.forEach((gp) => {
      if (!participantsMap.has(gp.group_session_id)) {
        participantsMap.set(gp.group_session_id, []);
      }
      const participantProfile = profileMap.get(gp.user_id) || {
        full_name: "Unknown User",
        email: "",
      };
      participantsMap.get(gp.group_session_id)?.push({
        participant: participantProfile,
      });
    });

    // Transform sessions data
    const transformedSessions =
      sessions?.map((session) => ({
        id: session.id,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status || "upcoming",
        requester: profileMap.get(session.organizer_id) || { full_name: "Unknown User", email: "" },
        participant: profileMap.get(session.participant_id) || {
          full_name: "Unknown User",
          email: "",
        },
      })) || [];

    const transformedGroupSessions =
      groupSessions?.map((session) => ({
        id: session.id,
        topic: session.topic,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status || "upcoming",
        creator: profileMap.get(session.creator_id) || { full_name: "Unknown User", email: "" },
        group_session_participants: participantsMap.get(session.id) || [],
      })) || [];

    const errors: Record<string, string> = {};
    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      errors.sessions = "Failed to load sessions";
    }
    if (groupSessionsError) {
      console.error("Error fetching group sessions:", groupSessionsError);
      errors.groupSessions = "Failed to load group sessions";
    }

    return {
      sessions: transformedSessions,
      groupSessions: transformedGroupSessions,
      errors,
    };
  } catch (error) {
    console.error("Error in getSessionsServerAction:", error);
    return {
      sessions: [],
      groupSessions: [],
      errors: { general: "An unexpected error occurred" },
    };
  }
}
