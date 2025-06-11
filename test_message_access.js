// Test script to verify message and connection access after database fixes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessageAccess() {
  try {
    console.log('🔄 Testing message and connection access...');

    // Test connection_requests access
    console.log('\n📋 Testing connection_requests access...');
    const { data: connections, error: connectionsError } = await supabase
      .from('connection_requests')
      .select('*')
      .limit(5);

    if (connectionsError) {
      console.log('❌ Connection requests error:', connectionsError.message);
    } else {
      console.log('✅ Connection requests accessible:', connections?.length || 0, 'records found');
    }

    // Test messages access
    console.log('\n💬 Testing messages access...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);

    if (messagesError) {
      console.log('❌ Messages error:', messagesError.message);
    } else {
      console.log('✅ Messages accessible:', messages?.length || 0, 'records found');
    }

    // Test notifications access
    console.log('\n🔔 Testing notifications access...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);

    if (notificationsError) {
      console.log('❌ Notifications error:', notificationsError.message);
    } else {
      console.log('✅ Notifications accessible:', notifications?.length || 0, 'records found');
    }

    // Test sessions access
    console.log('\n📅 Testing sessions access...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, status')
      .limit(5);

    if (sessionsError) {
      console.log('❌ Sessions error:', sessionsError.message);
    } else {
      console.log('✅ Sessions accessible with status column:', sessions?.length || 0, 'records found');
    }

    console.log('\n✨ Test completed! If you see ✅ marks, the fixes are working.');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testMessageAccess();
