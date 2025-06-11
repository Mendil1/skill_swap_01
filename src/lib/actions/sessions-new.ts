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

  // Create session
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      organizer_id: user.id,
      participant_id: participantId,
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes,
    })
    .select()
    .single();

  if (error) {
    return {
      errors: { general: ["Failed to create session"] },
    };
  }

  // Get organizer name for notification
  const { data: organizer } = await supabase
    .from("users")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  // Send notification to participant
  if (organizer) {
    await notifySessionScheduled(
      participantId,
      organizer.full_name,
      data.session_id,
      scheduledAt,
      false
    );
  }

  revalidatePath("/sessions");
  return { success: true, sessionId: data.session_id };
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

  // Create group session
  const { data, error } = await supabase
    .from("group_sessions")
    .insert({
      organizer_id: user.id,
      topic,
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes,
    })
    .select()
    .single();

  if (error) {
    return {
      errors: { general: ["Failed to create group session"] },
    };
  }

  revalidatePath("/sessions");
  return { success: true, sessionId: data.session_id };
}

export async function getUserSessions() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Get one-on-one sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select(`
      *,
      organizer:users!organizer_id(full_name, email, profile_image_url),
      participant:users!participant_id(full_name, email, profile_image_url)
    `)
    .or(`organizer_id.eq.${user.id},participant_id.eq.${user.id}`)
    .order("scheduled_at", { ascending: true });

  // Get group sessions
  const { data: groupSessions, error: groupSessionsError } = await supabase
    .from("group_sessions")
    .select(`
      *,
      organizer:users!organizer_id(full_name, email, profile_image_url),
      group_session_participants(
        user_id,
        joined_at,
        participant:users(full_name, email, profile_image_url)
      )
    `)
    .eq("organizer_id", user.id)
    .order("scheduled_at", { ascending: true });

  const errors = {
    sessions: sessionsError?.message,
    groupSessions: groupSessionsError?.message,
  };

  return {
    sessions: sessions || [],
    groupSessions: groupSessions || [],
    errors,
  };
}

export async function cancelSession(
  sessionId: string,
  sessionType: "one-on-one" | "group"
): Promise<SessionActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const tableName = sessionType === "one-on-one" ? "sessions" : "group_sessions";

  // Get session details before deletion for notifications
  const { data: sessionDetails } = await supabase
    .from(tableName)
    .select(`
      organizer_id,
      scheduled_at,
      ${sessionType === "one-on-one" ? "participant_id" : "topic"}
    `)
    .eq("session_id", sessionId)
    .single();

  // Only allow organizer to cancel
  if (!sessionDetails || sessionDetails.organizer_id !== user.id) {
    return { errors: { general: ["You can only cancel sessions you organized"] } };
  }

  // Get organizer name
  const { data: organizer } = await supabase
    .from("users")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  // Delete the session
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    return { errors: { general: ["Failed to cancel session"] } };
  }

  // Send cancellation notifications
  if (organizer && sessionDetails) {
    if (sessionType === "one-on-one") {
      // Notify the participant
      const participantId = (sessionDetails as { participant_id: string }).participant_id;
      await notifySessionCancelled(
        participantId,
        sessionId,
        organizer.full_name,
        sessionDetails.scheduled_at
      );
    } else {
      // For group sessions, notify all participants
      const { data: participants } = await supabase
        .from("group_session_participants")
        .select("user_id")
        .eq("session_id", sessionId);

      if (participants) {
        await Promise.all(
          participants.map(p =>
            notifySessionCancelled(
              p.user_id,
              sessionId,
              organizer.full_name,
              sessionDetails.scheduled_at
            )
          )
        );
      }
    }
  }

  revalidatePath("/sessions");
  return { success: true };
}

export async function rescheduleSession(
  sessionId: string,
  sessionType: "one-on-one" | "group",
  newScheduledAt: string
): Promise<SessionActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const tableName = sessionType === "one-on-one" ? "sessions" : "group_sessions";

  // Get session details and verify organizer
  const { data: sessionDetails } = await supabase
    .from(tableName)
    .select(`
      organizer_id,
      scheduled_at,
      ${sessionType === "one-on-one" ? "participant_id" : "topic"}
    `)
    .eq("session_id", sessionId)
    .single();

  if (!sessionDetails || sessionDetails.organizer_id !== user.id) {
    return { errors: { general: ["You can only reschedule sessions you organized"] } };
  }

  const oldScheduledAt = sessionDetails.scheduled_at;

  // Update the session
  const { error } = await supabase
    .from(tableName)
    .update({ scheduled_at: newScheduledAt })
    .eq("session_id", sessionId);

  if (error) {
    return { errors: { general: ["Failed to reschedule session"] } };
  }

  // Get organizer name and send notifications
  const { data: organizer } = await supabase
    .from("users")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  if (organizer) {
    if (sessionType === "one-on-one") {
      // Notify the participant
      const participantId = (sessionDetails as { participant_id: string }).participant_id;
      await notifySessionRescheduled(
        participantId,
        sessionId,
        organizer.full_name,
        oldScheduledAt,
        newScheduledAt
      );
    } else {
      // For group sessions, notify all participants
      const { data: participants } = await supabase
        .from("group_session_participants")
        .select("user_id")
        .eq("session_id", sessionId);

      if (participants) {
        await Promise.all(
          participants.map(p =>
            notifySessionRescheduled(
              p.user_id,
              sessionId,
              organizer.full_name,
              oldScheduledAt,
              newScheduledAt
            )
          )
        );
      }
    }
  }

  revalidatePath("/sessions");
  return { success: true };
}

export async function joinGroupSession(sessionId: string): Promise<SessionActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Check if user is already a participant
  const { data: existingParticipant } = await supabase
    .from("group_session_participants")
    .select("user_id")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (existingParticipant) {
    return { errors: { general: ["You are already a participant in this session"] } };
  }

  // Add user as participant
  const { error } = await supabase
    .from("group_session_participants")
    .insert({
      session_id: sessionId,
      user_id: user.id,
    });

  if (error) {
    return { errors: { general: ["Failed to join session"] } };
  }

  // Get session details and user name for notification
  const [sessionResult, userResult] = await Promise.all([
    supabase
      .from("group_sessions")
      .select("organizer_id, topic")
      .eq("session_id", sessionId)
      .single(),
    supabase
      .from("users")
      .select("full_name")
      .eq("user_id", user.id)
      .single()
  ]);

  // Notify the organizer
  if (sessionResult.data && userResult.data) {
    await notifyGroupSessionJoined(
      sessionResult.data.organizer_id,
      sessionId,
      userResult.data.full_name,
      sessionResult.data.topic
    );
  }

  revalidatePath("/sessions");
  return { success: true };
}

export async function getConnections(): Promise<{ connections: Connection[]; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { connections: [] };
  }

  // Get user's connections (people they've messaged or who have messaged them)
  const { data: connections, error } = await supabase
    .from("messages")
    .select(`
      sender_id,
      receiver_id,
      sender:users!sender_id(user_id, full_name, email, profile_image_url),
      receiver:users!receiver_id(user_id, full_name, email, profile_image_url)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("sent_at", { ascending: false });

  if (error) {
    return { connections: [], error: error.message };
  }

  // Extract unique connections
  const uniqueConnections = new Map<string, Connection>();

  connections?.forEach((message) => {
    const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
    // otherUser is an array, so we need to get the first element
    const connection = Array.isArray(otherUser) ? otherUser[0] : otherUser;
    if (connection && !uniqueConnections.has(connection.user_id)) {
      uniqueConnections.set(connection.user_id, {
        user_id: connection.user_id,
        full_name: connection.full_name,
        email: connection.email,
        profile_image_url: connection.profile_image_url,
      });
    }
  });

  return { connections: Array.from(uniqueConnections.values()) };
}
