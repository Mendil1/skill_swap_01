import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function createTestConnections() {
  console.log('🔧 Creating test connections...\n');

  // First, let's see what users exist
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('user_id, full_name, email')
    .limit(5);

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message);
    return;
  }

  console.log(`Found ${users?.length || 0} users:`);
  users?.forEach((user, i) => {
    console.log(`  ${i+1}. ${user.full_name} (${user.user_id})`);
  });

  if (!users || users.length < 2) {
    console.log('❌ Need at least 2 users to create connections');
    return;
  }

  // Check existing connections
  const { data: existingConnections, error: connError } = await supabase
    .from('connection_requests')
    .select('*');

  if (connError) {
    console.error('❌ Error checking connections:', connError.message);
    return;
  }

  console.log(`\nExisting connections: ${existingConnections?.length || 0}`);

  // If no connections exist, create some test ones
  if (!existingConnections || existingConnections.length === 0) {
    console.log('\n🔧 Creating test connections...');

    const testConnections = [
      {
        sender_id: users[0].user_id,
        receiver_id: users[1].user_id,
        status: 'accepted',
        created_at: new Date().toISOString()
      }
    ];

    if (users.length > 2) {
      testConnections.push({
        sender_id: users[0].user_id,
        receiver_id: users[2].user_id,
        status: 'accepted',
        created_at: new Date().toISOString()
      });
    }

    const { data: newConnections, error: insertError } = await supabase
      .from('connection_requests')
      .insert(testConnections)
      .select();

    if (insertError) {
      console.error('❌ Error creating connections:', insertError.message);
      return;
    }

    console.log(`✅ Created ${newConnections?.length || 0} test connections`);
    newConnections?.forEach((conn, i) => {
      console.log(`  ${i+1}. ${conn.sender_id} ↔ ${conn.receiver_id} (${conn.status})`);
    });
  } else {
    console.log('✅ Connections already exist, no need to create test data');
    existingConnections.forEach((conn, i) => {
      console.log(`  ${i+1}. ${conn.sender_id} ↔ ${conn.receiver_id} (${conn.status})`);
    });
  }

  // Now test the exact query our function uses
  console.log('\n🧪 Testing getUserConnections query for first user...');
  const testUserId = users[0].user_id;

  const { data: userConnections, error: queryError } = await supabase
    .from("connection_requests")
    .select(
      `
      *,
      receiver:users!connection_requests_receiver_id_fkey(
        user_id,
        full_name,
        email,
        profile_image_url
      ),
      sender:users!connection_requests_sender_id_fkey(
        user_id,
        full_name,
        email,
        profile_image_url
      )
    `
    )
    .or(`sender_id.eq.${testUserId},receiver_id.eq.${testUserId}`)
    .eq("status", "accepted");

  if (queryError) {
    console.error('❌ Query error:', queryError.message);
    return;
  }

  console.log(`Found ${userConnections?.length || 0} connections for user ${testUserId}`);
  if (userConnections && userConnections.length > 0) {
    userConnections.forEach((conn, i) => {
      const isUserSender = conn.sender_id === testUserId;
      const otherUser = isUserSender ? conn.receiver : conn.sender;
      console.log(`  ${i+1}. Connected to: ${otherUser?.full_name} (${isUserSender ? conn.receiver_id : conn.sender_id})`);
    });
    console.log('\n✅ The query should work! The issue might be with authentication in the browser.');
  } else {
    console.log('\n⚠️ No connections found for the test user. This explains the UI issue.');
  }
}

createTestConnections().catch(console.error);
