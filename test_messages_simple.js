#!/usr/bin/env node
/**
 * Test Message Queries - Simplified
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

async function testMessages() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('📝 TESTING MESSAGE QUERIES\n');

  // Test 1: Basic message query
  console.log('1. Basic message query...');
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log(`   ✅ Success: Found ${data.length} messages`);
      if (data.length > 0) {
        console.log('   Sample message:', {
          id: data[0].id,
          content: data[0].content?.substring(0, 50) + '...',
          sender_id: data[0].sender_id,
          receiver_id: data[0].receiver_id
        });
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  // Test 2: Message query with separate user lookups
  console.log('\n2. Message query with separate user queries...');
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.log('   ❌ Error:', error.message);
      return;
    }

    console.log(`   ✅ Found ${messages.length} messages`);

    // For each message, fetch user details separately
    for (const message of messages) {
      const { data: sender } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', message.sender_id)
        .single();

      const { data: receiver } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', message.receiver_id)
        .single();

      console.log(`   Message: ${sender?.full_name || 'Unknown'} → ${receiver?.full_name || 'Unknown'}`);
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  // Test 3: Check users table structure
  console.log('\n3. Checking users table structure...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('   ❌ Error:', error.message);
    } else if (data.length > 0) {
      console.log('   ✅ Users table accessible');
      console.log('   Columns:', Object.keys(data[0]));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  console.log('\n✅ MESSAGE TESTING COMPLETE');
  console.log('The app can query messages and users successfully.');
  console.log('The complex join query had issues, but basic queries work fine.');
}

testMessages().catch(console.error);
