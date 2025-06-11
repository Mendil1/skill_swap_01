import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function setupTestConnections() {
  console.log('🔧 Setting up test connections for Mariem...\n');

  // First, find Mariem's user ID
  const { data: mariemUser, error: mariemError } = await supabase
    .from('users')
    .select('user_id, full_name, email')
    .ilike('email', '%pirytumi@logsmarter.net%')
    .single();

  if (mariemError || !mariemUser) {
    console.log('❌ Could not find Mariem user:', mariemError?.message);
    console.log('📋 Looking for all users instead...');

    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('user_id, full_name, email')
      .limit(5);

    if (allUsersError) {
      console.log('❌ Error fetching users:', allUsersError.message);
      return;
    }

    console.log('👥 Available users:');
    allUsers?.forEach((user, i) => {
      console.log(`  ${i+1}. ${user.full_name} - ${user.email} (${user.user_id})`);
    });
    return;
  }

  console.log('✅ Found Mariem:', mariemUser.full_name, mariemUser.email);
  const mariemUserId = mariemUser.user_id;

  // Find other users to connect with
  const { data: otherUsers, error: otherUsersError } = await supabase
    .from('users')
    .select('user_id, full_name, email')
    .neq('user_id', mariemUserId)
    .limit(3);

  if (otherUsersError || !otherUsers || otherUsers.length === 0) {
    console.log('❌ No other users found to create connections with');
    return;
  }

  console.log('👥 Other users available:');
  otherUsers.forEach((user, i) => {
    console.log(`  ${i+1}. ${user.full_name} - ${user.email}`);
  });

  // Check existing connections
  const { data: existingConnections, error: connError } = await supabase
    .from('connection_requests')
    .select('*')
    .or(`sender_id.eq.${mariemUserId},receiver_id.eq.${mariemUserId}`);

  if (connError) {
    console.log('❌ Error checking connections:', connError.message);
    return;
  }

  console.log(`\n📊 Mariem has ${existingConnections?.length || 0} existing connection requests`);

  if (existingConnections && existingConnections.length > 0) {
    console.log('📋 Existing connections:');
    existingConnections.forEach((conn, i) => {
      const isMariem = conn.sender_id === mariemUserId;
      console.log(`  ${i+1}. ${isMariem ? 'Sent to' : 'Received from'}: ${isMariem ? conn.receiver_id : conn.sender_id} (${conn.status})`);
    });

    // Check if any are accepted
    const acceptedConnections = existingConnections.filter(conn => conn.status === 'accepted');
    if (acceptedConnections.length > 0) {
      console.log('✅ Mariem has accepted connections! The issue might be elsewhere.');
      return;
    }
  }

  // Create test connections
  console.log('\n🔧 Creating test connections...');

  const testConnections = otherUsers.slice(0, 2).map(otherUser => ({
    sender_id: mariemUserId,
    receiver_id: otherUser.user_id,
    status: 'accepted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const { data: newConnections, error: insertError } = await supabase
    .from('connection_requests')
    .insert(testConnections)
    .select();

  if (insertError) {
    console.log('❌ Error creating connections:', insertError.message);
    return;
  }

  console.log(`✅ Created ${newConnections?.length || 0} test connections for Mariem`);
  newConnections?.forEach((conn, i) => {
    console.log(`  ${i+1}. Connected to: ${conn.receiver_id}`);
  });

  console.log('\n🎉 Test connections created! Try the session dialog again.');
}

setupTestConnections().catch(console.error);
