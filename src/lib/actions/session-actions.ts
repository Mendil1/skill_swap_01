"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Types
interface CreateSessionResult {
  success?: boolean;
  sessionId?: string;
  errors?: {
    [key: string]: string[];
  };
}

// Validation schemas
const CreateOneOnOneSessionSchema = z.object({
  participantId: z.string().uuid("Invalid participant ID"),
  scheduledAt: z.string().min(1, "Please select a date and time"),
  durationMinutes: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
});

const CreateGroupSessionSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200, "Topic must be less than 200 characters"),
  scheduledAt: z.string().min(1, "Please select a date and time"),
  durationMinutes: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
});

export async function createOneOnOneSessionAction(formData: FormData): Promise<CreateSessionResult> {
  console.log("🚀 createOneOnOneSessionAction called");
  
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  console.log("🚀 User:", user?.id || 'no user');
  
  if (authError || !user) {
    console.log("❌ Auth error, redirecting to login");
    redirect("/login");
  }

  // Validate form data
  const validatedFields = CreateOneOnOneSessionSchema.safeParse({
    participantId: formData.get("participantId"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!validatedFields.success) {
    console.log("❌ Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { participantId, scheduledAt, durationMinutes } = validatedFields.data;
  
  console.log("🚀 Creating session:", { participantId, scheduledAt, durationMinutes });

  try {
    // Check if participant exists and has a connection with current user
    const { data: connection, error: connectionError } = await supabase
      .from("connection_requests")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`
      )
      .eq("status", "accepted")
      .single();

    if (connectionError || !connection) {
      console.log("❌ No connection found between users");
      return {
        errors: { general: ["You can only schedule sessions with accepted connections"] },
      };
    }

    // Get user profile for notification
    const { data: userProfile } = await supabase
      .from("users")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        organizer_id: user.id,
        participant_id: participantId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: "upcoming",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("❌ Session creation error:", sessionError);
      return {
        errors: { general: ["Failed to create session. Please try again."] },
      };
    }

    console.log("✅ Session created successfully:", session.id);

    revalidatePath("/sessions");
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("❌ Error creating one-on-one session:", error);
    return {
      errors: { general: ["An unexpected error occurred. Please try again."] },
    };
  }
}

export async function createGroupSessionAction(formData: FormData): Promise<CreateSessionResult> {
  console.log("🚀 createGroupSessionAction called");
  
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
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
        status: "upcoming",
      })
      .select()
      .single();

    if (groupError) {
      console.error("Group session creation error:", groupError);
      return {
        errors: { general: ["Failed to create group session. Please try again."] },
      };
    }

    // Add creator as participant
    const { error: participantError } = await supabase.from("group_session_participants").insert({
      group_session_id: groupSession.id,
      user_id: user.id,
      joined_at: new Date().toISOString(),
    });

    if (participantError) {
      console.error("Participant addition error:", participantError);
      return {
        errors: { general: ["Failed to join the session you created. Please try again."] },
      };
    }

    revalidatePath("/sessions");
    return { success: true, sessionId: groupSession.id };
  } catch (error) {
    console.error("Error creating group session:", error);
    return {
      errors: { general: ["An unexpected error occurred. Please try again."] },
    };
  }
}
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Types
interface CreateSessionResult {
  success?: boolean;
  sessionId?: string;
  errors?: {
    [key: string]: string[];
    general?: string[];
  };
}

// Validation schemas
const CreateOneOnOneSessionSchema = z.object({
  participantId: z.string().uuid("Invalid participant ID"),
  scheduledAt: z.string().min(1, "Please select a date and time"),
  durationMinutes: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
});

const CreateGroupSessionSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200, "Topic must be less than 200 characters"),
  scheduledAt: z.string().min(1, "Please select a date and time"),
  durationMinutes: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
});

export async function createOneOnOneSessionAction(formData: FormData): Promise<CreateSessionResult> {
  console.log("🚀 createOneOnOneSessionAction called");
  
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  console.log("🚀 User:", user?.id || 'no user');
  
  if (authError || !user) {
    console.log("❌ Auth error, redirecting to login");
    redirect("/login");
  }

  // Validate form data
  const validatedFields = CreateOneOnOneSessionSchema.safeParse({
    participantId: formData.get("participantId"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!validatedFields.success) {
    console.log("❌ Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { participantId, scheduledAt, durationMinutes } = validatedFields.data;
  
  console.log("🚀 Creating session:", { participantId, scheduledAt, durationMinutes });

  try {
    // Check if participant exists and has a connection with current user
    const { data: connection, error: connectionError } = await supabase
      .from("connection_requests")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`
      )
      .eq("status", "accepted")
      .single();

    if (connectionError || !connection) {
      console.log("❌ No connection found between users");
      return {
        errors: { general: ["You can only schedule sessions with accepted connections"] },
      };
    }

    // Get user profile for notification
    const { data: userProfile } = await supabase
      .from("users")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        organizer_id: user.id,
        participant_id: participantId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: "upcoming",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("❌ Session creation error:", sessionError);
      return {
        errors: { general: ["Failed to create session. Please try again."] },
      };
    }

    console.log("✅ Session created successfully:", session.id);

    revalidatePath("/sessions");
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("❌ Error creating one-on-one session:", error);
    return {
      errors: { general: ["An unexpected error occurred. Please try again."] },
    };
  }
}

export async function createGroupSessionAction(formData: FormData): Promise<CreateSessionResult> {
  console.log("🚀 createGroupSessionAction called");
  
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
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
        status: "upcoming",
      })
      .select()
      .single();

    if (groupError) {
      console.error("Group session creation error:", groupError);
      return {
        errors: { general: ["Failed to create group session. Please try again."] },
      };
    }

    // Add creator as participant
    const { error: participantError } = await supabase.from("group_session_participants").insert({
      group_session_id: groupSession.id,
      user_id: user.id,
      joined_at: new Date().toISOString(),
    });

    if (participantError) {
      console.error("Participant addition error:", participantError);
      return {
        errors: { general: ["Failed to join the session you created. Please try again."] },
      };
    }

    revalidatePath("/sessions");
    return { success: true, sessionId: groupSession.id };
  } catch (error) {
    console.error("Error creating group session:", error);
    return {
      errors: { general: ["An unexpected error occurred. Please try again."] },
    };
  }
}
