"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  notifySessionScheduled,
  notifySessionCancelled,
  notifySessionRescheduled,
  notifyGroupSessionJoined
} from "@/lib/notifications/session-notifications";
import { Connection, SessionActionResult, CreateSessionResult } from "@/types/sessions";

// Schema for session creation
const CreateOneOnOneSessionSchema = z.object({
  participantId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().min(15).max(480), // 15 minutes to 8 hours
});

const CreateGroupSessionSchema = z.object({
  topic: z.string().min(1, "Topic is required for group sessions"),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().min(15).max(480),
});

export async function createOneOnOneSession(formData: FormData): Promise<CreateSessionResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Validate form data
  const validatedFields = CreateOneOnOneSessionSchema.safeParse({
    participantId: formData.get("participantId"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { participantId, scheduledAt, durationMinutes } = validatedFields.data;

  try {
    // Check if participant exists and has a connection with current user
    const { data: connection, error: connectionError } = await supabase
      .from("connections")
      .select("*")
      .or(`and(user_id.eq.${user.id},connected_user_id.eq.${participantId}),and(user_id.eq.${participantId},connected_user_id.eq.${user.id})`)
      .eq("status", "accepted")
      .single();

    if (connectionError || !connection) {
      return {
        errors: { general: ["You can only schedule sessions with accepted connections"] }
      };
    }

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        requester_id: user.id,
        participant_id: participantId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: "scheduled",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return {
        errors: { general: ["Failed to create session. Please try again."] }
      };
    }

    // Send notification to participant
    await notifySessionScheduled(participantId, session.id, user.id);

    revalidatePath("/sessions");
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("Error creating one-on-one session:", error);
    return {
      errors: { general: ["An unexpected error occurred. Please try again."] }
    };
  }
}

export async function createGroupSession(formData: FormData): Promise<CreateSessionResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Validate form data
  const validatedFields = CreateGroupSessionSchema.safeParse({
    topic: formData.get("topic"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { topic, scheduledAt, durationMinutes } = validatedFields.data;

  try {
    // Create group session
    const { data: groupSession, error: groupError } = await supabase
      .from("group_sessions")
      .insert({
        creator_id: user.id,
        topic,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: "scheduled",
      })
      .select()
      .single();

    if (groupError) {
      console.error("Group session creation error:", groupError);
      return {
        errors: { general: ["Failed to create group session. Please try again."] }
      };
    }

    // Add creator as participant
    const { error: participantError } = await supabase
      .from("group_session_participants")
      .insert({
        group_session_id: groupSession.id,
        user_id: user.id,
        joined_at: new Date().toISOString(),
      });

    if (participantError) {
      console.error("Participant addition error:", participantError);
      return {
        errors: { general: ["Failed to join the session you created. Please try again."] }
      };
    }

    revalidatePath("/sessions");
    return { success: true, sessionId: groupSession.id };
  } catch (error) {
    console.error("Error creating group session:", error);
    return {
      errors: { general: ["An unexpected error occurred. Please try again."] }
    };
  }
}

export async function joinGroupSession(groupSessionId: string): Promise<SessionActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  try {
    // Check if user is already a participant
    const { data: existingParticipant } = await supabase
      .from("group_session_participants")
      .select("*")
      .eq("group_session_id", groupSessionId)
      .eq("user_id", user.id)
      .single();

    if (existingParticipant) {
      return {
        success: false,
        error: "You are already a participant in this session"
      };
    }

    // Check if session is still available (not full, not started, etc.)
    const { data: groupSession, error: sessionError } = await supabase
      .from("group_sessions")
      .select("*, group_session_participants(*)")
      .eq("id", groupSessionId)
      .single();

    if (sessionError || !groupSession) {
      return {
        success: false,
        error: "Session not found"
      };
    }

    if (groupSession.status !== "scheduled") {
      return {
        success: false,
        error: "Cannot join a session that has already started or ended"
      };
    }

    // Join the session
    const { error } = await supabase
      .from("group_session_participants")
      .insert({
        group_session_id: groupSessionId,
        user_id: user.id,
        joined_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error joining group session:", error);
      return {
        success: false,
        error: "Failed to join group session"
      };
    }

    // Notify the creator that someone joined
    await notifyGroupSessionJoined(groupSession.creator_id, groupSessionId, user.id);

    revalidatePath("/sessions");
    return { success: true };
  } catch (error) {
    console.error("Error joining group session:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}

export async function cancelSession(sessionId: string): Promise<SessionActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  try {
    // Get session details before canceling
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return {
        success: false,
        error: "Session not found"
      };
    }

    // Check if user has permission to cancel (must be requester or participant)
    if (session.requester_id !== user.id && session.participant_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to cancel this session"
      };
    }

    // Cancel the session
    const { error } = await supabase
      .from("sessions")
      .update({ status: "cancelled" })
      .eq("id", sessionId);

    if (error) {
      console.error("Error cancelling session:", error);
      return {
        success: false,
        error: "Failed to cancel session"
      };
    }

    // Notify the other participant
    const otherUserId = session.requester_id === user.id ? session.participant_id : session.requester_id;
    await notifySessionCancelled(otherUserId, sessionId, user.id);

    revalidatePath("/sessions");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling session:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}

export async function rescheduleSession(sessionId: string, newScheduledAt: string): Promise<SessionActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  try {
    // Get session details before rescheduling
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return {
        success: false,
        error: "Session not found"
      };
    }

    // Check if user has permission to reschedule
    if (session.requester_id !== user.id && session.participant_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to reschedule this session"
      };
    }

    // Update the session
    const { error } = await supabase
      .from("sessions")
      .update({
        scheduled_at: newScheduledAt,
        status: "scheduled" // Reset to scheduled if it was cancelled
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error rescheduling session:", error);
      return {
        success: false,
        error: "Failed to reschedule session"
      };
    }

    // Notify the other participant
    const otherUserId = session.requester_id === user.id ? session.participant_id : session.requester_id;
    await notifySessionRescheduled(otherUserId, sessionId, user.id, newScheduledAt);

    revalidatePath("/sessions");
    return { success: true };
  } catch (error) {
    console.error("Error rescheduling session:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}

export async function cancelGroupSession(groupSessionId: string): Promise<SessionActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  try {
    // Get group session details
    const { data: groupSession, error: fetchError } = await supabase
      .from("group_sessions")
      .select("*")
      .eq("id", groupSessionId)
      .single();

    if (fetchError || !groupSession) {
      return {
        success: false,
        error: "Group session not found"
      };
    }

    // Check if user is the creator
    if (groupSession.creator_id !== user.id) {
      return {
        success: false,
        error: "Only the session creator can cancel a group session"
      };
    }

    // Cancel the group session
    const { error } = await supabase
      .from("group_sessions")
      .update({ status: "cancelled" })
      .eq("id", groupSessionId);

    if (error) {
      console.error("Error cancelling group session:", error);
      return {
        success: false,
        error: "Failed to cancel group session"
      };
    }

    // Get all participants to notify them
    const { data: participants } = await supabase
      .from("group_session_participants")
      .select("user_id")
      .eq("group_session_id", groupSessionId)
      .neq("user_id", user.id); // Exclude the creator

    // Notify all participants (implementation would depend on your notification system)
    if (participants) {
      for (const participant of participants) {
        await notifySessionCancelled(participant.user_id, groupSessionId, user.id);
      }
    }

    revalidatePath("/sessions");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling group session:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}

// Helper function to get user's connections for session creation
export async function getUserConnections(): Promise<Connection[]> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return [];
  }

  try {
    const { data: connections, error } = await supabase
      .from("connections")
      .select(`
        *,
        connected_user:profiles!connections_connected_user_id_fkey(
          id,
          full_name,
          username,
          profile_image_url
        ),
        user:profiles!connections_user_id_fkey(
          id,
          full_name,
          username,
          profile_image_url
        )
      `)
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
      .eq("status", "accepted");

    if (error) {
      console.error("Error fetching connections:", error);
      return [];
    }

    // Transform the data to normalize the connection format
    return connections?.map(conn => {
      const isUserInitiator = conn.user_id === user.id;
      const otherUser = isUserInitiator ? conn.connected_user : conn.user;

      return {
        id: conn.id,
        user_id: conn.user_id,
        connected_user_id: conn.connected_user_id,
        status: conn.status,
        created_at: conn.created_at,
        full_name: otherUser.full_name,
        username: otherUser.username,
        profile_image_url: otherUser.profile_image_url,
        other_user_id: otherUser.id
      };
    }) || [];
  } catch (error) {
    console.error("Error in getUserConnections:", error);
    return [];
  }
}
