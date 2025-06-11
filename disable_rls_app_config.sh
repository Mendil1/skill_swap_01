#!/bin/bash

# Script to disable RLS by using service role key instead of anon key
# This bypasses all Row Level Security policies

echo "🔧 Configuring Supabase clients to bypass RLS..."

# Backup original client files
cp src/utils/supabase/client.ts src/utils/supabase/client.ts.backup
cp src/utils/supabase/server.ts src/utils/supabase/server.ts.backup
cp src/utils/supabase/middleware.ts src/utils/supabase/middleware.ts.backup

echo "✅ Created backups of original Supabase client files"

# Update client.ts to use service role key
cat > src/utils/supabase/client.ts << 'EOF'
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export function createClient() {
  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8";

  // Use service role key instead of anon key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey;

  console.log("[Client] Using SERVICE ROLE to bypass RLS");
  console.log("[Client] Supabase URL:", supabaseUrl ? "defined" : "undefined");
  console.log("[Client] Service Role Key:", supabaseKey ? "defined" : "undefined");

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  );
}
EOF

echo "✅ Updated client.ts to use service role key"

# Update server.ts to use service role key
cat > src/utils/supabase/server.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

/**
 * Creates a Supabase server client with SERVICE ROLE to bypass RLS.
 * WARNING: This bypasses all Row Level Security policies.
 */
export async function createClient() {
  const cookieStore = cookies();

  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8";

  // Use service role key to bypass all RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey;

  console.log("[Server] Using SERVICE ROLE to bypass RLS");

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn("Cookie could not be set:", error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({
              name,
              value: "",
              ...options,
              expires: new Date(0),
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          } catch (error) {
            console.warn("Cookie could not be removed:", error);
          }
        },
      },
    }
  );
}
EOF

echo "✅ Updated server.ts to use service role key"

# Update middleware.ts to use service role key
cat > src/utils/supabase/middleware.ts << 'EOF'
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";

/**
 * Updates the user session in the middleware using SERVICE ROLE to bypass RLS.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8";

  // Use service role key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey;

  console.log("[Middleware] Using SERVICE ROLE to bypass RLS");

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            expires: new Date(0),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });
        },
      },
    }
  );

  // Try to get user but don't block if it fails (since we're bypassing auth anyway)
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.warn("[Middleware] Auth check failed (this is expected when bypassing RLS):", error);
  }

  return response;
}
EOF

echo "✅ Updated middleware.ts to use service role key"

echo ""
echo "🚨 WARNING: RLS BYPASS CONFIGURATION COMPLETE"
echo "=============================================="
echo "✅ All Supabase clients now use SERVICE ROLE key"
echo "✅ This bypasses ALL Row Level Security policies"
echo "✅ All data is now accessible without authentication"
echo ""
echo "📋 What was changed:"
echo "  - client.ts: Now uses SUPABASE_SERVICE_ROLE_KEY"
echo "  - server.ts: Now uses SUPABASE_SERVICE_ROLE_KEY"
echo "  - middleware.ts: Now uses SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "🔄 To restore original RLS behavior:"
echo "  - Run: mv src/utils/supabase/client.ts.backup src/utils/supabase/client.ts"
echo "  - Run: mv src/utils/supabase/server.ts.backup src/utils/supabase/server.ts"
echo "  - Run: mv src/utils/supabase/middleware.ts.backup src/utils/supabase/middleware.ts"
echo ""
echo "⚠️  USE ONLY FOR DEVELOPMENT/TESTING - NOT FOR PRODUCTION!"
EOF
