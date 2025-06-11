"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/utils/notifications";
import { validateNotificationType } from "@/types/notifications";
import eventBus from "@/utils/event-bus";
import { processPendingNotifications } from "@/utils/notification-retry";
import { useNotificationCache } from "@/utils/notification-cache";
import OptimizedLink from "@/components/optimized-link";
import { Notification as NotificationType, NotificationType as NotificationTypeEnum } from "@/types/notifications";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Create a component with persistent notification state
export default function NotificationBell() {
  // Extend the NotificationType to include recipient_id which is used in local notifications
  interface ExtendedNotification extends NotificationType {
    recipient_id?: string;
  }

  interface NotificationEvent {
    user_id?: string;
    recipient_id?: string;
    [key: string]: string | number | boolean | undefined;
  }

  interface MessageEvent {
    recipientId?: string;
    [key: string]: string | number | boolean | undefined;
  }

  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [lastFetched, setLastFetched] = useState(0); // Track last fetch time
  
  // Use our notification cache hook
  const { 
    setNotificationCache, 
    isValidCache, 
    getCachedNotifications, 
    getCachedUserId 
  } = useNotificationCache();

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Simplified function to get current user ID from Supabase
  const getCurrentUser = async () => {
    try {
      // Check localStorage first for better performance
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("currentUserId")
      ) {
        return localStorage.getItem("currentUserId");
      }

      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data?.user?.id) {
        // Cache for future use
        if (typeof window !== "undefined") {
          localStorage.setItem("currentUserId", data.user.id);
        }
        return data.user.id;
      }

      return null;
    } catch (e) {
      console.error("Error getting current user:", e);
      return null;
    }
  };  // Function to fetch notifications from server API with throttling
  const fetchNotifications = useCallback(async (force = false) => {
    // Try to use cache first if not forcing refresh
    if (!force && isValidCache()) {
      const cachedData = getCachedNotifications();
      const cachedUserId = getCachedUserId();
      
      if (cachedData.length > 0 && cachedUserId) {
        console.log("Using cached notifications data");
        // Transform cached data to ensure proper types
        const transformedCachedData = cachedData.map(notification => ({
          ...notification,
          type: validateNotificationType(notification.type)
        }));
        setNotifications(transformedCachedData);
        setUserId(cachedUserId);
        return;
      }
    }
    
    // Don't fetch if we've fetched within the last 120 seconds (increased from 60), unless forced
    const now = Date.now();
    if (!force && lastFetched > 0 && now - lastFetched < 120000) {
      console.log("Skipping notification fetch - throttled");
      return;
    }
    
    // Don't show loading state for background refreshes, only when forced or first load
    if (force || lastFetched === 0) {
      setLoading(true);
    }
    
    try {
      // Make sure we have a userId
      const currentUserId = userId || (await getCurrentUser());

      if (!currentUserId) {
        console.log("No user ID available to fetch notifications");
        setLoading(false);
        return;
      }

      // Set last fetched time
      setLastFetched(now);

      // 1. Try fetching from the API endpoint
      try {
        console.log("Fetching notifications for user:", currentUserId);
        const response = await fetch(
          `/api/notifications?userId=${currentUserId}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success && Array.isArray(result.data)) {
            // Format the notifications to have consistent property names
            const serverNotifications = result.data.map((n: {
              id?: string;
              notification_id?: string;
              user_id: string;
              type: string;
              message: string;
              is_read: boolean;
              reference_id?: string;
              created_at: string;
            }) => ({
              id: n.id || n.notification_id || '',
              user_id: n.user_id,
              type: n.type,
              message: n.message,
              is_read: n.is_read,
              reference_id: n.reference_id,
              created_at: n.created_at,
            }));

            // Combine with any local notifications
            const combinedNotifications = combineWithLocalNotifications(
              serverNotifications,
              currentUserId
            );

            // Update state and cache the result
            setNotifications(combinedNotifications);
            setUserId(currentUserId);
            setNotificationCache(combinedNotifications, currentUserId);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.error("API error fetching notifications:", apiError);
      }

      // 2. Fallback to direct Supabase query
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Format the notifications consistently
          const serverNotifications = data.map((n: {
            notification_id: string;
            user_id: string;
            type: string;
            message: string;
            is_read: boolean;
            reference_id?: string;
            created_at: string;
          }) => ({
            id: n.notification_id,
            user_id: n.user_id,
            type: validateNotificationType(n.type),
            message: n.message,
            is_read: n.is_read,
            reference_id: n.reference_id,
            created_at: n.created_at,
          }));

          // Combine with any local notifications
          const combinedNotifications = combineWithLocalNotifications(
            serverNotifications,
            currentUserId
          );

          // Update state and cache the result
          setNotifications(combinedNotifications);
          setUserId(currentUserId);
          setNotificationCache(combinedNotifications, currentUserId);
        }
      } catch (dbError) {
        console.error("Database error fetching notifications:", dbError);

        // 3. Last resort: just use local storage
        if (typeof window !== "undefined") {
          const localOnly = getLocalNotifications(currentUserId);
          setNotifications(localOnly);
          // Cache local notifications too
          setNotificationCache(localOnly, currentUserId);
        }
      }
    } catch (e) {
      console.error("Error in fetchNotifications:", e);
    } finally {
      setLoading(false);
    }
  }, [userId, lastFetched]); // Simplified dependencies to avoid forward references

  // Helper to get local notifications
  const getLocalNotifications = (userIdToMatch: string): ExtendedNotification[] => {
    if (typeof window === "undefined") return [];

    try {
      const storedNotifications = JSON.parse(
        localStorage.getItem("local_notifications") || "[]"
      );

      return storedNotifications
        .filter(
          (n: { user_id: string; recipient_id?: string }) => 
            n.user_id === userIdToMatch || n.recipient_id === userIdToMatch
        )
        .sort(
          (a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } catch (e) {
      console.error("Error getting local notifications:", e);
      return [];
    }
  };

  // Helper to combine server and local notifications
  const combineWithLocalNotifications = (
    serverNotifications: ExtendedNotification[],
    userIdToMatch: string
  ): ExtendedNotification[] => {
    if (typeof window === "undefined") return serverNotifications;

    try {
      // Get local notifications for this user
      const localNotifications = getLocalNotifications(userIdToMatch);

      // Create a Set of server notification IDs for fast lookup
      const serverIds = new Set(serverNotifications.map((n) => n.id));

      // Filter local notifications to only include those not already in server notifications
      const localOnly = localNotifications.filter((n) => !serverIds.has(n.id));

      // Combine and sort
      return [...serverNotifications, ...localOnly].sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
      );
    } catch (e) {
      console.error("Error combining notifications:", e);
      return serverNotifications;
    }
  };

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    // Try to mark as read in db/localStorage
    await markNotificationAsRead(notificationId);

    // Update local state immediately for better UX
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    if (userId) {
      await markAllNotificationsAsRead(userId);

      // Update local state immediately
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  // Get link for notification based on type
  const getNotificationLink = (notification: ExtendedNotification) => {
    switch (notification.type as NotificationTypeEnum) {
      case "connection_request":
        return `/profile?tab=connections`;
      case "connection_accepted":
        return notification.reference_id
          ? `/users/${notification.reference_id}`
          : `/profile?tab=connections`;
      case "message":
        return notification.reference_id
          ? `/messages/${notification.reference_id}`
          : `/messages`;
      default:
        return `/notifications`;
    }
  };  // Initialize user and setup - run once
  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      const currentUserId = await getCurrentUser();
      if (currentUserId && mounted) {
        setUserId(currentUserId);
      }
    };

    initializeUser();

    return () => {
      mounted = false;
    };
  }, []); // Run only once on mount

  // Main effect for notifications and real-time updates
  useEffect(() => {
    if (!userId) return; // Don't run until we have a userId

    let mounted = true;
    let checkInterval = 300000; // Increase to 5 minutes (from 3 minutes)
    let supabaseChannel: RealtimeChannel | null = null;
    let notificationUpdateTimeout: NodeJS.Timeout | null = null;

    const initialize = async () => {
      if (mounted) {
        // Fetch initial notifications
        fetchNotifications();

        // Process any pending notifications
        processPendingNotifications();

        // Set up Supabase realtime subscription
        try {
          const supabase = createClient();

          // Subscribe to notifications table changes for this user
          supabaseChannel = supabase
            .channel('notification-updates')
            .on(
              'postgres_changes' as any,
              {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
              },
              (payload: any) => {
                console.log('Supabase realtime notification update:', payload);

                // Debounce to prevent multiple fetches for batch updates
                if (notificationUpdateTimeout) {
                  clearTimeout(notificationUpdateTimeout);
                }

                notificationUpdateTimeout = setTimeout(() => {
                  if (mounted) {
                    fetchNotifications();
                  }
                }, 1000); // Increase debounce time to 1000ms (from 500ms)
              }
            )
            .subscribe((status, err) => {
              console.log('Supabase notification subscription status:', status);
              if (err) {
                console.error('Supabase subscription error:', err);
              }
            });
        } catch (error) {
          console.error('Error setting up realtime subscription:', error);
        }
      }
    };

    initialize();

    // Check if we're in the messages area to set a more frequent refresh
    const isInMessagesArea = typeof window !== 'undefined' &&
      window.location.pathname.includes('/messages');

    // Set more frequent checks when in messages section
    if (isInMessagesArea) {
      checkInterval = 20000; // Check every 20 seconds in messages area
    }

    // Set up interval with longer polling
    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchNotifications();
      }
    }, checkInterval);

    // Subscribe to event bus events
    const newNotificationUnsubscribe = eventBus.on("new-notification", (data: NotificationEvent) => {
      if (userId && (data.user_id === userId || data.recipient_id === userId)) {
        console.log("EventBus: Received new notification event", data);
        fetchNotifications();
      }
    });

    const newMessageUnsubscribe = eventBus.on("new-message", (data: MessageEvent) => {
      if (userId && data.recipientId === userId) {
        console.log("EventBus: Received new message event", data);
        // Force immediate refresh for messages
        fetchNotifications();
      }
    });

    // Listen for local storage updates (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "local_notifications" || e.key === "notification_timestamp") {
        if (userId) {
          fetchNotifications();
        }
      }
    };

    // Listen for custom events for new notifications
    const handleLocalNotification = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationEvent>;
      if (
        customEvent.detail &&
        userId &&
        (customEvent.detail.user_id === userId || customEvent.detail.recipient_id === userId)
      ) {
        fetchNotifications();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("local-notification", handleLocalNotification as EventListener);
      // Also listen for the "new-notification" event from message-input.tsx
      window.addEventListener("new-notification", handleLocalNotification as EventListener);
    }

    // Clean up
    return () => {
      mounted = false;
      clearInterval(pollInterval);

      // Clean up Supabase realtime subscription
      if (supabaseChannel) {
        const supabase = createClient();
        supabase.removeChannel(supabaseChannel);
      }

      // Clean up event bus subscriptions
      newNotificationUnsubscribe();
      newMessageUnsubscribe();

      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "local-notification",
          handleLocalNotification as EventListener
        );
        window.removeEventListener(
          "new-notification",
          handleLocalNotification as EventListener
        );
      }

      if (notificationUpdateTimeout) {
        clearTimeout(notificationUpdateTimeout);
      }
    };
  }, [fetchNotifications]); // Only depend on fetchNotifications, userId is handled in separate effect

  // Handle popover open/close and refresh notifications when opened
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Refresh notifications when opening the dropdown
      fetchNotifications(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="relative p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-slate-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 h-5 min-w-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-slate-500">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id || `temp-${Math.random()}`}
                  className={`p-3 hover:bg-slate-50 transition-colors ${
                    !notification.is_read ? "bg-indigo-50" : ""
                  }`}
                >
                  <OptimizedLink
                    href={getNotificationLink(notification)}
                    onClick={() => {
                      if (notification.id) {
                        handleMarkAsRead(notification.id);
                      }
                      setOpen(false);
                    }}
                    className="block"
                  >
                    <p className="text-sm text-slate-800">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {notification.created_at 
                        ? new Date(notification.created_at).toLocaleString() 
                        : new Date().toLocaleString()}
                    </p>
                  </OptimizedLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-2 border-t text-center">
          <OptimizedLink
            href="/notifications"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </OptimizedLink>
        </div>
      </PopoverContent>
    </Popover>
  );
}
