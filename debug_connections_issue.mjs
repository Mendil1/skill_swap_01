import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

console.log('🔍 DEBUGGING: No connections found issue...\n');

async function debugConnections() {
  // First, let's check if there are any connections at all
  console.log('1. Checking all connection_requests in database...');

  const { data: allConnections, error: allError } = await supabase
    .from('connection_requests')
    .select('*');

  if (allError) {
    console.error('❌ Error fetching all connections:', allError.message);
    return;
  }

  console.log(`   Found ${allConnections?.length || 0} total connection requests`);

  if (allConnections && allConnections.length > 0) {
    console.log('   Status breakdown:');
    const statusCounts = {};
    allConnections.forEach(conn => {
      statusCounts[conn.status] = (statusCounts[conn.status] || 0) + 1;
    });
    console.log('  ', statusCounts);

    // Show some sample data
    console.log('\n   Sample connections:');
    allConnections.slice(0, 3).forEach((conn, i) => {
      console.log(`   ${i+1}. Sender: ${conn.sender_id}, Receiver: ${conn.receiver_id}, Status: ${conn.status}`);
    });
  }

  // Check accepted connections specifically
  console.log('\n2. Checking accepted connections...');

  const { data: acceptedConnections, error: acceptedError } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('status', 'accepted');

  if (acceptedError) {
    console.error('❌ Error fetching accepted connections:', acceptedError.message);
    return;
  }

  console.log(`   Found ${acceptedConnections?.length || 0} accepted connections`);

  if (acceptedConnections && acceptedConnections.length > 0) {
    console.log('   Accepted connections:');
    acceptedConnections.forEach((conn, i) => {
      console.log(`   ${i+1}. Sender: ${conn.sender_id}, Receiver: ${conn.receiver_id}`);
    });
  }

  // Now test the specific query our function uses
  console.log('\n3. Testing getUserConnections query logic...');

  const testUserId = "3b4a6049-5f7d-4383-bef7-42c24ae7843b"; // Known test user
  console.log(`   Using test user: ${testUserId}`);

  const { data: userConnections, error: userError } = await supabase
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

  if (userError) {
    console.error('❌ Error in getUserConnections query:', userError.message);
    return;
  }

  console.log(`   Found ${userConnections?.length || 0} connections for user ${testUserId}`);

  if (userConnections && userConnections.length > 0) {
    console.log('   User connections details:');
    userConnections.forEach((conn, i) => {
      const isUserSender = conn.sender_id === testUserId;
      const otherUser = isUserSender ? conn.receiver : conn.sender;
      console.log(`   ${i+1}. Connected to: ${otherUser?.full_name || 'Unknown'} (${isUserSender ? conn.receiver_id : conn.sender_id})`);
    });
  } else {
    console.log('   ⚠️ No connections found for this user!');
    console.log('   This explains why "No connections found" appears in the UI.');
  }

  // Check if the test user exists
  console.log('\n4. Verifying test user exists...');

  const { data: userData, error: userLookupError } = await supabase
    .from('users')
    .select('user_id, full_name, email')
    .eq('user_id', testUserId);

  if (userLookupError) {
    console.error('❌ Error looking up user:', userLookupError.message);
  } else if (userData && userData.length > 0) {
    console.log(`   ✅ User exists: ${userData[0].full_name} (${userData[0].email})`);
  } else {
    console.log('   ❌ Test user not found in database!');
  }

  console.log('\n🎯 CONCLUSION:');
  if (acceptedConnections && acceptedConnections.length > 0) {
    if (userConnections && userConnections.length > 0) {
      console.log('✅ There are connections and the query should work!');
      console.log('🔧 The issue might be in the UI component or authentication.');
    } else {
      console.log('⚠️ There are connections in the database, but not for the current user.');
      console.log('💡 You need to create connections for the user you\'re testing with.');
    }
  } else {
    console.log('❌ No accepted connections exist in the database at all.');
    console.log('💡 You need to create some connections first through the UI or database.');
  }
}

debugConnections().catch(console.error);
