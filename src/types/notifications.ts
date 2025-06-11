/**
 * TypeScript type definitions for the notification system
 */

export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "message"
  | "skill_match"
  | "system";

export interface Notification {
  id?: string;  // Database ID or local ID
  notification_id?: string; // Database ID (Supabase)
  user_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  reference_id?: string;
  created_at?: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  message: string;
  referenceId?: string;
  isRead?: boolean;
}

export interface RetryNotificationParams extends CreateNotificationParams {
  maxRetries?: number;
  initialDelay?: number;
}

export interface NotificationContext {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  refetchNotifications: () => Promise<void>;
}

// Utility function to safely cast string to NotificationType
export function validateNotificationType(type: string): NotificationType {
  const validTypes: NotificationType[] = [
    "connection_request",
    "connection_accepted", 
    "message",
    "skill_match",
    "system"
  ];
  
  return validTypes.includes(type as NotificationType) 
    ? (type as NotificationType) 
    : "system"; // fallback to system type
}

// Extended notification interface for components
export interface ExtendedNotification extends Notification {
  recipient_id?: string;
}
