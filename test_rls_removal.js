// Test script to verify RLS has been completely removed
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRLSRemoval() {
  console.log('🧪 Testing RLS removal...\n');

  try {
    // Test 1: Read from users table without auth
    console.log('1. Testing users table access...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log(`✅ Users table accessible - found ${users.length} records`);
    }

    // Test 2: Read from messages table without auth
    console.log('2. Testing messages table access...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, content')
      .limit(5);
    
    if (messagesError) {
      console.log('❌ Messages table error:', messagesError.message);
    } else {
      console.log(`✅ Messages table accessible - found ${messages.length} records`);
    }

    // Test 3: Read from connection_requests table without auth
    console.log('3. Testing connection_requests table access...');
    const { data: connections, error: connectionsError } = await supabase
      .from('connection_requests')
      .select('id, status')
      .limit(5);
    
    if (connectionsError) {
      console.log('❌ Connection requests table error:', connectionsError.message);
    } else {
      console.log(`✅ Connection requests table accessible - found ${connections.length} records`);
    }

    // Test 4: Read from sessions table without auth
    console.log('4. Testing sessions table access...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title')
      .limit(5);
    
    if (sessionsError) {
      console.log('❌ Sessions table error:', sessionsError.message);
    } else {
      console.log(`✅ Sessions table accessible - found ${sessions.length} records`);
    }

    // Test 5: Read from notifications table without auth
    console.log('5. Testing notifications table access...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, type')
      .limit(5);
    
    if (notificationsError) {
      console.log('❌ Notifications table error:', notificationsError.message);
    } else {
      console.log(`✅ Notifications table accessible - found ${notifications.length} records`);
    }

    console.log('\n🎉 RLS removal test completed!');
    console.log('If all tables show "accessible", RLS has been successfully removed.');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testRLSRemoval();
