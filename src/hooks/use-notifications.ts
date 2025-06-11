"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types/notifications';

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
}

// Mock functions until we properly implement the real ones
const getNotifications = async (): Promise<NotificationsResponse> => {
  // Simulate API call
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
};

const markNotificationAsRead = async (id: string): Promise<{success: boolean}> => {
  // Simulate API call
  const response = await fetch('/api/notifications/markAsRead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  return response.json();
};

const markAllNotificationsAsRead = async (): Promise<{success: boolean}> => {
  // Simulate API call
  const response = await fetch('/api/notifications/markAllAsRead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
  return response.json();
};

// Define query keys to avoid string duplication and typos
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: string) => [...notificationKeys.lists(), { filters }] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
};

/**
 * Custom hook for fetching notifications with caching and automatic refetching
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  // Fetch notifications with proper caching
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: getNotifications,
    refetchInterval: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    staleTime: 120000, // 2 minutes
  });

  // Mutation for marking a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: (_result: {success: boolean}, id: string) => {
      // Update the cache immediately
      queryClient.setQueryData<NotificationsResponse | undefined>(
        notificationKeys.lists(),
        (oldData: NotificationsResponse | undefined) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((notification: Notification) => {
              if (notification.id === id) {
                return { ...notification, is_read: true };
              }
              return notification;
            }),
          };
        }
      );

      // Invalidate to refetch in the background
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Update the cache immediately
      queryClient.setQueryData<NotificationsResponse | undefined>(
        notificationKeys.lists(),
        (oldData: NotificationsResponse | undefined) => {
          if (!oldData || !oldData.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((notification: Notification) => {
              return { ...notification, is_read: true };
            }),
          };
        }
      );
      
      // Invalidate to refetch in the background
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
    },
  });

  // Calculate unread count
  const unreadCount = data?.data?.filter((notification: Notification) => !notification.is_read).length || 0;

  return {
    notifications: data?.data || [],
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    isMarking: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
  };
}
