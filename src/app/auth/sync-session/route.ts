import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    console.log("[SessionSync] Server-side session sync request received");

    const supabase = await createClient();

    // Get the current session from server-side cookies
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.log("[SessionSync] Server session error:", error.message);
      return NextResponse.json({ error: 'Session error', details: error.message }, { status: 401 });
    }

    if (!session) {
      console.log("[SessionSync] No server session found");
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    console.log("[SessionSync] Found server session for:", session.user.email);

    // Validate session is not expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      console.log("[SessionSync] Session is expired");
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Return session data that client can use
    return NextResponse.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
    });

  } catch (error) {
    console.error("[SessionSync] Error:", error);
    return NextResponse.json({ error: 'Sync failed', details: String(error) }, { status: 500 });
  }
}
