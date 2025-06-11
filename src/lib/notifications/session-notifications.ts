"use server";

import { createClient } from "@/utils/supabase/server";

export type SessionNotificationType =
  | "session_scheduled"
  | "session_reminder"
  | "session_cancelled"
  | "session_rescheduled"
  | "group_session_joined";

export async function createSessionNotification(
  userId: string,
  type: SessionNotificationType,
  sessionId: string,
  message: string,
  additionalData?: Record<string, any>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      message,
      reference_id: sessionId,
      data: additionalData || {},
    });

  if (error) {
    console.error("Failed to create session notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Helper functions for specific session notifications
export async function notifySessionScheduled(
  participantId: string,
  organizerName: string,
  sessionId: string,
  scheduledAt: string,
  isGroupSession = false
) {
  const sessionType = isGroupSession ? "group session" : "one-on-one session";
  const message = `${organizerName} scheduled a ${sessionType} with you for ${new Date(scheduledAt).toLocaleString()}`;

  return createSessionNotification(
    participantId,
    "session_scheduled",
    sessionId,
    message,
    { organized_by: organizerName, scheduled_at: scheduledAt, is_group: isGroupSession }
  );
}

export async function notifySessionReminder(
  userId: string,
  sessionId: string,
  scheduledAt: string,
  participantName?: string,
  topic?: string
) {
  const sessionTitle = topic || (participantName ? `session with ${participantName}` : "session");
  const message = `Reminder: Your ${sessionTitle} starts in 30 minutes`;

  return createSessionNotification(
    userId,
    "session_reminder",
    sessionId,
    message,
    { scheduled_at: scheduledAt, participant_name: participantName, topic }
  );
}

export async function notifySessionCancelled(
  userId: string,
  sessionId: string,
  organizerName: string,
  scheduledAt: string
) {
  const message = `${organizerName} cancelled the session scheduled for ${new Date(scheduledAt).toLocaleString()}`;

  return createSessionNotification(
    userId,
    "session_cancelled",
    sessionId,
    message,
    { cancelled_by: organizerName, original_time: scheduledAt }
  );
}

export async function notifySessionRescheduled(
  userId: string,
  sessionId: string,
  organizerName: string,
  oldTime: string,
  newTime: string
) {
  const message = `${organizerName} rescheduled your session from ${new Date(oldTime).toLocaleString()} to ${new Date(newTime).toLocaleString()}`;

  return createSessionNotification(
    userId,
    "session_rescheduled",
    sessionId,
    message,
    { rescheduled_by: organizerName, old_time: oldTime, new_time: newTime }
  );
}

export async function notifyGroupSessionJoined(
  organizerId: string,
  sessionId: string,
  participantName: string,
  topic: string
) {
  const message = `${participantName} joined your group session: ${topic}`;

  return createSessionNotification(
    organizerId,
    "group_session_joined",
    sessionId,
    message,
    { participant_name: participantName, topic }
  );
}
