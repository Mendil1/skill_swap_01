/**
 * Optimized API route for fetching notifications
 * Implements caching, error handling, and performance optimizations
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Cache TTL in seconds
const CACHE_TTL = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Extract parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const skipCache = url.searchParams.get("skipCache") === "true";

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Fetch notifications with limit and pagination
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Handle database errors
    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    // Count unread notifications separately (more efficient query)
    const { count, error: countError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    // Handle count error
    if (countError) {
      console.error("Error counting unread notifications:", countError);
      // Continue with the data we have, just don't include unread count
    }

    // Return response with appropriate cache headers
    return NextResponse.json(
      {
        success: true,
        data,
        unreadCount: count || 0,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Set cache control headers
          "Cache-Control": skipCache
            ? "no-store"
            : `private, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
          // Add etag for efficient caching
          "ETag": `"${Buffer.from(JSON.stringify(data || [])).toString('base64')}"`,
        },
      }
    );
  } catch (err) {
    console.error("Unexpected error in notifications API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optimized handler for marking notifications as read
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { notificationId, userId, markAll = false } = body;

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    let result;

    // Handle marking all as read
    if (markAll) {
      result = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);
    }
    // Handle marking single notification as read
    else if (notificationId) {
      result = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);
    } else {
      return NextResponse.json(
        { error: "notificationId is required when not marking all" },
        { status: 400 }
      );
    }

    // Handle database errors
    if (result.error) {
      console.error("Error updating notifications:", result.error);
      return NextResponse.json(
        { error: "Failed to update notifications" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        updated: result.count || 0,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          "Content-Type": "application/json",
          // No caching for mutation responses
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Unexpected error in notifications API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
