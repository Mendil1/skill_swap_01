"use client";

import React, { useCallback, memo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

// Memoized notification item component
const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const handleMarkAsRead = useCallback(() => {
    if (notification.id || notification.notification_id) {
      onMarkAsRead(notification.id || notification.notification_id!);
    }
  }, [notification.id, notification.notification_id, onMarkAsRead]);

  return (
    <div
      className={`p-3 border-b last:border-0 ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex justify-between">
        <h4 className="font-medium text-sm">
          {notification.type === 'connection_request' && 'Connection Request'}
          {notification.type === 'connection_accepted' && 'Connection Accepted'}
          {notification.type === 'message' && 'New Message'}
          {notification.type === 'skill_match' && 'Skill Match'}
          {notification.type === 'system' && 'System Notification'}
        </h4>
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={handleMarkAsRead}
          >
            Mark as read
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
      <p className="text-xs text-gray-400 mt-1">
        {notification.created_at 
          ? new Date(notification.created_at).toLocaleString() 
          : 'Just now'
        }
      </p>
    </div>
  );
});

// Enhanced notification bell component with React Query
function EnhancedNotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarking,
  } = useNotifications();

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
    },
    [markAsRead]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 h-5 min-w-5 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-96 overflow-auto" align="end">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarking}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications yet
          </div>
        ) : (
          <div>
            {notifications.map((notification: Notification) => (
              <NotificationItem
                key={notification.id || notification.notification_id || `temp-${Date.now()}`}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Export a memoized version to prevent unnecessary re-renders
export default memo(EnhancedNotificationBell);
