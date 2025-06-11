"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface Notification {
  notification_id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  reference_id?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const supabase = createClient();
  
  const fetchNotifications = useCallback(async function fetchNotifications() {
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user?.id) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    // Apply filter based on active tab
    if (activeTab === "unread") {
      query = query.eq("is_read", false);
    } else if (activeTab === "read") {
      query = query.eq("is_read", true);
    }

    const { data, error } = await query;

    if (data && !error) {
      setNotifications(data);
    }

    setLoading(false);
  }, [activeTab, page, perPage, supabase]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel("notifications_page_updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "notifications",
        },
        () => {
          // Refresh notifications when changes occur
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("notification_id", notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.notification_id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("notification_id", unreadIds);

    if (!error) {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );
    }
  }

  function getNotificationLink(notification: Notification) {
    switch (notification.type) {
      case "connection_request":
        return `/profile?tab=connections`;
      case "message":
        return `/messages/${notification.reference_id}`;
      case "connection_accepted":
        return `/users/${notification.reference_id}`;
      default:
        return "#";
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="container py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          {hasUnread && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setPage(1);
            }}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <Badge className="ml-2 bg-indigo-600">
                    {notifications.filter((n) => !n.is_read).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderNotificationsList()}</TabsContent>
            <TabsContent value="unread">
              {renderNotificationsList()}
            </TabsContent>
            <TabsContent value="read">{renderNotificationsList()}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function renderNotificationsList() {
    if (loading) {
      return (
        <div className="py-8 text-center text-slate-500">
          Loading notifications...
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="py-8 text-center text-slate-500">
          <p>No notifications to display</p>
        </div>
      );
    }

    return (
      <>
        <ul className="divide-y">
          {notifications.map((notification) => (
            <li
              key={notification.notification_id}
              className={`py-4 transition-colors hover:bg-slate-50 ${
                !notification.is_read ? "bg-indigo-50/50" : ""
              }`}
            >
              <Link
                href={getNotificationLink(notification)}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.notification_id);
                  }
                }}
                className="block"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-800 font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Badge className="bg-indigo-600">New</Badge>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">Page {page}</span>
          <Button
            variant="outline"
            disabled={notifications.length < perPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </>
    );
  }
}
