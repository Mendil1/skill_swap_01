// filepath: c:\Users\Mendi\DEV_PFE\skill-swap-01\src\app\api\test-notifications\route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Endpoint to test the notification system
 * This will create a test notification and then attempt to retrieve it
 */
export async function GET(request: Request) {
  try {
    // Get the current user ID from the URL query parameter
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing userId parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new NextResponse(
        JSON.stringify({
          error: "Server configuration error",
          url: !!supabaseUrl,
          key: !!supabaseServiceKey
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          // This is an API route, we don't need to set cookies
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          // This is an API route, we don't need to remove cookies
        },
      },
    });

    // 1. Create a test notification
    const testNotificationData = {
      user_id: userId,
      type: "system",
      message: "Test notification created at " + new Date().toISOString(),
      is_read: false,
    };

    console.log("Creating test notification:", testNotificationData);

    const { data: insertData, error: insertError } = await supabase
      .from("notifications")
      .insert(testNotificationData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating test notification:", insertError);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to create test notification",
          details: insertError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Retrieve the notification we just created
    const { data: retrievedData, error: retrieveError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (retrieveError) {
      console.error("Error retrieving notifications:", retrieveError);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to retrieve test notification",
          details: retrieveError.message,
          createdNotification: insertData // Still return the created notification
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return both the created notification and the retrieved notifications
    return NextResponse.json({
      success: true,
      created: insertData,
      retrieved: retrievedData,
      message: "Test notification created and retrieved successfully"
    });

  } catch (error: unknown) {
    console.error("Server exception in test-notifications endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
