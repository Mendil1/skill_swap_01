import { createClient } from "@/utils/supabase/client";

type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "message"
  | "skill_match"
  | "system";

interface LocalNotification {
  id: string;
  user_id?: string;
  recipient_id?: string;
  sender_name?: string;
  message: string;
  type: string;
  reference_id?: string | undefined;
  is_read: boolean;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Store notification in local storage as fallback
 */
function storeLocalNotification(notification: LocalNotification) {
  try {
    // Get existing notifications from localStorage
    const existingNotifications = JSON.parse(
      localStorage.getItem("local_notifications") || "[]"
    );

    // Add new notification with a consistent ID format
    const localNotification = {
      ...notification,
      id: `local-${Date.now()}`, // Use consistent id property (not local_id)
      created_at: new Date().toISOString(),
    };

    // Add to existing notifications
    existingNotifications.push(localNotification);

    // Store back to localStorage
    localStorage.setItem(
      "local_notifications",
      JSON.stringify(existingNotifications)
    );
    console.log("Notification stored locally as fallback");

    // Dispatch event for real-time updates in the UI
    try {
      window.dispatchEvent(
        new CustomEvent("local-notification", {
          detail: localNotification,
        })
      );
    } catch (e) {
      console.error("Failed to dispatch local notification event", e);
    }

    return localNotification;
  } catch (e) {
    console.error("Failed to store notification locally", e);
    return null;
  }
}

/**
 * Create a notification using server API endpoint
 */
export async function createNotification({
  userId,
  type,
  message,
  referenceId,
  isRead = false,
}: {
  userId: string;
  type: NotificationType;
  message: string;
  referenceId?: string;
  isRead?: boolean;
}) {
  if (!userId) {
    console.error("Missing userId for notification");
    return null;
  }

  try {
    console.log("Creating notification via API:", {
      userId,
      type,
      message,
      referenceId,
    });

    // Call the server API endpoint to create the notification
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        type,
        message,
        referenceId,
        isRead,
      }),
      // Important: Disable caching for notification requests
      cache: "no-store",
    });

    // Get the response data
    const responseText = await response.text();
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);
    console.log("Response text:", responseText);
    
    let errorData;

    try {
      // Try to parse as JSON
      errorData = JSON.parse(responseText);
    } catch (e) {
      // If not valid JSON, use the text directly
      errorData = { error: responseText || "Unknown error" };
    }

    if (!response.ok) {
      console.error("API error creating notification:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        responseText
      });
      throw new Error(errorData.error || `API request failed with status ${response.status}: ${response.statusText}`);
    }

    const result = typeof errorData === 'object' ? errorData : { success: true };
    console.log("Notification created successfully via API:", result);

    // Return the created notification data
    return result.data;
  } catch (apiError) {
    console.error("API call failed for notification:", apiError);

    // If API fails, fall back to direct database insert
    try {
      console.log("Attempting direct database insert as fallback");
      const supabase = createClient();

      const notificationData = {
        user_id: userId,
        type,
        message,
        is_read: isRead,
        ...(referenceId && { reference_id: referenceId }),
      };

      const { data, error } = await supabase
        .from("notifications")
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error("Direct database insert also failed:", error);
        throw error;
      }

      console.log("Notification created successfully via direct insert:", data);
      return data;
    } catch (dbError) {
      console.error("All remote notification methods failed:", dbError);

      // As last resort, store locally
      if (typeof window !== "undefined") {
        const localNotification: LocalNotification = {
          id: `local-${Date.now()}`,
          user_id: userId,
          type,
          message,
          is_read: isRead,
          reference_id: referenceId,
          created_at: new Date().toISOString(),
        };

        return storeLocalNotification(localNotification);
      }

      return null;
    }
  }
}

/**
 * Create a connection request notification
 */
export async function createConnectionRequestNotification(
  receiverId: string,
  senderName: string,
  connectionId: string
) {
  return createNotification({
    userId: receiverId,
    type: "connection_request",
    message: `${senderName} sent you a connection request`,
    referenceId: connectionId,
  });
}

/**
 * Create a connection accepted notification
 */
export async function createConnectionAcceptedNotification(
  receiverId: string,
  acceptorName: string,
  connectionId: string
) {
  return createNotification({
    userId: receiverId,
    type: "connection_accepted",
    message: `${acceptorName} accepted your connection request`,
    referenceId: connectionId,
  });
}

/**
 * Create a new message notification
 */
export async function createMessageNotification(
  receiverId: string,
  senderName: string,
  connectionId: string
) {
  console.log("Creating message notification for:", {
    receiverId,
    senderName,
    connectionId,
  });

  try {
    // First try the server API method
    const serverResult = await createNotification({
      userId: receiverId,
      type: "message",
      message: `${senderName} sent you a message`,
      referenceId: connectionId,
    });

    // Also create a local fallback notification to ensure it's visible in the UI
    if (typeof window !== "undefined") {
      // Create a local notification object
      const localNotification = {
        id: `local-${Date.now()}`,
        recipient_id: receiverId,
        user_id: receiverId,
        sender_name: senderName,
        message: `${senderName} sent you a message`,
        type: "message",
        reference_id: connectionId,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Get existing notifications
      let existingNotifications = [];
      try {
        existingNotifications = JSON.parse(
          localStorage.getItem("local_notifications") || "[]"
        );
      } catch (parseError) {
        console.error("Error parsing localStorage, resetting:", parseError);
        existingNotifications = [];
      }

      // Add to existing notifications
      existingNotifications.push(localNotification);

      // Save back to localStorage
      localStorage.setItem(
        "local_notifications",
        JSON.stringify(existingNotifications)
      );

      // Trigger both events for maximum compatibility
      try {
        window.dispatchEvent(
          new CustomEvent("new-notification", {
            detail: localNotification,
          })
        );
        window.dispatchEvent(
          new CustomEvent("local-notification", {
            detail: localNotification,
          })
        );
      } catch (eventError) {
        console.error("Error dispatching notification events:", eventError);
      }
    }

    return serverResult;
  } catch (error) {
    console.error("Error creating message notification:", error);
    return null;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    // Check if this is a local notification
    const isLocalNotification = notificationId.startsWith("local-");

    if (isLocalNotification) {
      // Update in localStorage
      if (typeof window !== "undefined") {
        const storedNotifications = JSON.parse(
          localStorage.getItem("local_notifications") || "[]"
        );

        const updated = storedNotifications.map((n: {id: string; is_read: boolean; [key: string]: unknown}) => {
          if (n.id === notificationId) {
            return { ...n, is_read: true };
          }
          return n;
        });

        localStorage.setItem("local_notifications", JSON.stringify(updated));
      }
      return true;
    }

    // It's a server notification - update in the database
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("notification_id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  if (!userId) {
    console.error("Missing userId for marking all notifications as read");
    return false;
  }

  try {
    // Update server notifications
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all server notifications as read:", error);
    }

    // Update local notifications too if we're in a browser
    if (typeof window !== "undefined") {
      const storedNotifications = JSON.parse(
        localStorage.getItem("local_notifications") || "[]"
      );

      const updated = storedNotifications.map((n: LocalNotification) => {
        if (n.recipient_id === userId || n.user_id === userId) {
          return { ...n, is_read: true };
        }
        return n;
      });

      localStorage.setItem("local_notifications", JSON.stringify(updated));
    }

    return true;
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
    return false;
  }
}
