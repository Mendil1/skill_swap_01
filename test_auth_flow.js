const { createClient } = require('@supabase/supabase-js');

// Environment variables from .env.local
const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthenticationFlow() {
  console.log('🔐 TESTING AUTHENTICATION FLOW');
  console.log('='.repeat(40));

  try {
    console.log('\n1. Testing anonymous access to messages...');

    const connectionId = '69e781e4-e57d-4629-a44f-507b7c52f558';

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("connection_id", connectionId)
      .order("sent_at", { ascending: true });

    if (messagesError) {
      console.log('❌ Anonymous access to messages failed:', messagesError.message);
      console.log('Error details:', JSON.stringify(messagesError, null, 2));
    } else {
      console.log(`✅ Anonymous access to messages successful: ${messages?.length || 0} messages found`);
    }

    console.log('\n2. Testing anonymous access to connections...');

    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select(`
        sender_id,
        receiver_id,
        sender:users!connection_requests_sender_id_fkey(user_id, full_name, email),
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email)
      `)
      .eq("connection_id", connectionId)
      .single();

    if (connectionsError) {
      console.log('❌ Anonymous access to connections failed:', connectionsError.message);
      console.log('Error details:', JSON.stringify(connectionsError, null, 2));
    } else {
      console.log('✅ Anonymous access to connections successful');
      console.log('Connection data:', connections);
    }

    console.log('\n3. Testing auth user status...');

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (!user) {
      console.log('⚠️  No authenticated user (anonymous session)');
      console.log('This is expected for server-side testing, but browser should have authenticated user');
    } else {
      console.log('✅ Authenticated user found:', user.id);
    }

    console.log('\n🎯 DIAGNOSIS:');
    console.log('='.repeat(20));

    if (messagesError || connectionsError) {
      console.log('❌ DATABASE ACCESS ISSUES:');
      console.log('  - Some database queries are failing');
      console.log('  - This could be due to RLS or permission issues');
      console.log('  - Check if RLS is properly disabled');
    } else {
      console.log('✅ DATABASE ACCESS: Working');
    }

    if (!user && typeof window !== 'undefined') {
      console.log('❌ AUTHENTICATION ISSUES:');
      console.log('  - User is not authenticated in the browser');
      console.log('  - User needs to log in to access messages');
    } else {
      console.log('✅ AUTHENTICATION: Configured (test environment)');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuthenticationFlow().catch(console.error);
