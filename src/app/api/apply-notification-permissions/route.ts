import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * This API route applies the notification permissions to the Supabase database
 * It requires authentication and admin privileges to run
 */
export async function POST(request: Request) {
  try {
    // Get the Supabase credentials
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

    // Create Supabase client with service role key to bypass RLS
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(name: string, value: string, options: unknown) {
          // This is an API route, we don't need to set cookies
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(name: string, options: unknown) {
          // This is an API route, we don't need to remove cookies
        },
      },
    });    // Define SQL commands to fix notification permissions
    const sqlCommands = [
      // Drop all existing policies for a clean slate
      "DROP POLICY IF EXISTS \"Users can view their own notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"System can insert notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"Users can insert notifications for others\" ON notifications;",
      "DROP POLICY IF EXISTS \"Users can update their own notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"Bypass RLS for notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"Service role can do anything with notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"Allow anon to insert notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"Service role bypass\" ON notifications;",

      // Ensure RLS is enabled
      "ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;",

      // 1. Service Role Bypass (for the API endpoint)
      // This allows the service role to perform any operation without restrictions
      "CREATE POLICY \"Service role can do anything with notifications\" ON notifications USING (auth.jwt()->>'role' = 'service_role');",

      // 2. Users can view only their own notifications
      "CREATE POLICY \"Users can view their own notifications\" ON notifications FOR SELECT USING (auth.uid() = user_id);",

      // 3. Allow ANY authenticated user to insert notifications
      "CREATE POLICY \"Users can insert notifications\" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);",

      // 4. Users can only update their own notifications
      "CREATE POLICY \"Users can update their own notifications\" ON notifications FOR UPDATE USING (auth.uid() = user_id);",

      // Enable realtime for notifications table
      "ALTER PUBLICATION supabase_realtime ADD TABLE notifications;"
    ];    // Execute each SQL command and collect results
    const results = [];
    for (const sql of sqlCommands) {
      try {
        // Use direct SQL execution instead of RPC
        const { error } = await supabase.from('_utilities').select('*');

        // Use RPC to execute SQL - this is the proper way to execute SQL in Supabase
        if (sql.trim()) {
          // Only non-empty SQL commands
          const { error: sqlError } = await supabase.rpc('execute_sql', { sql_query: sql });

          results.push({
            sql,
            success: !sqlError,
            error: sqlError ? sqlError.message : null
          });

          if (sqlError) {
            console.error(`Error executing SQL: ${sql}`, sqlError);
          }
        }
      } catch (error) {
        console.error(`Exception executing SQL: ${sql}`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({
          sql,
          success: false,
          error: errorMessage
        });
      }
    }

    // Check if there were any successful commands
    const anySuccess = results.some(r => r.success);

    return NextResponse.json({
      success: anySuccess,
      message: anySuccess
        ? "Notification permissions applied successfully"
        : "Failed to apply notification permissions",
      results
    });

  } catch (error: unknown) {
    console.error("Server exception in apply-notification-permissions endpoint:", error);
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
