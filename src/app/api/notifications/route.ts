import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { userId, type, message, referenceId } = requestBody;

    console.log("POST /api/notifications - Request body:", requestBody);

    if (!userId || !type || !message) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use service role key to bypass RLS and ensure notifications can be created
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Service key available:", !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new NextResponse(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );    }

    // Create Supabase client with service role key - NO COOKIES NEEDED for admin operations
    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
      // Add required cookie options (even though we don't use them with service role)
      cookies: {
        get: (): string => '',
        set: (): void => {},
        remove: (): void => {},
      },
    });

    const notificationData = {
      user_id: userId,
      type,
      message,
      is_read: false,
      ...(referenceId && { reference_id: referenceId }),
    };

    console.log("Server creating notification:", notificationData);

    // Insert notification
    const { data: insertData, error: insertError } = await supabase
      .from("notifications")
      .insert(notificationData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);

      // If the service role insert failed, this is likely a configuration error
      return new NextResponse(
        JSON.stringify({
          error: "Failed to create notification",
          details: insertError.message,
          hint: "Check that your SUPABASE_SERVICE_ROLE_KEY is correct and that the appropriate policies are in place",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: insertData,
    });
  } catch (error: unknown) {
    console.error("Server exception creating notification:", error);
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

// Add GET endpoint for fetching notifications
export async function GET(request: Request) {
  try {
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
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key - NO COOKIES NEEDED for admin operations
    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
      // Add required cookie options (even though we don't use them with service role)
      cookies: {
        get: (): string => '',
        set: (): void => {},
        remove: (): void => {},
      },
    });

    // Fetch notifications for this user
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50); // Limit to most recent 50 notifications for better performance

    if (error) {
      console.error("Error fetching notifications:", error);

      // Try to get more diagnostic information
      const { error: tableError } = await supabase
        .from("_utilities")
        .select("*")
        .limit(1);

      console.log("Table access check:", tableError ? "Failed" : "Success");

      // Try to make a simpler query to check basic access
      const { error: countError } = await supabase
        .from("notifications")
        .select("count(*)")
        .limit(1);

      console.log("Count query check:", countError ? "Failed" : "Success");
      return new NextResponse(
        JSON.stringify({
          error: error.message,
          hint: "Make sure the service role key has proper permissions and the notifications table exists",
          details: {
            code: error.code,
            tableAccess: !tableError,
            countAccess: !countError
          }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=30", // Cache for 30 seconds
        },
      }
    );
  } catch (error: unknown) {
    console.error("Server exception fetching notifications:", error);
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
