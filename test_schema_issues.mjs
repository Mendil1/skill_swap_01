import { createClient } from '@supabase/supabase-js';

// Using the credentials from schema.sql
const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchemaIssues() {
  console.log('🔄 Testing current database schema and identifying issues...\n');

  try {
    // 1. Test notifications table RLS issue
    console.log('1️⃣ Testing notifications table...');
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
          type: 'test',
          title: 'Test Notification',
          message: 'Testing RLS policies'
        });

      if (error) {
        console.log('❌ Notifications insert failed:', error.message);
        console.log('   This confirms RLS policy issues need fixing');
      } else {
        console.log('✅ Notifications insert worked (unexpected)');
        // Clean up test data
        await supabase.from('notifications').delete().eq('type', 'test');
      }
    } catch (err) {
      console.log('❌ Notifications test error:', err.message);
    }

    // 2. Test sessions table structure
    console.log('\n2️⃣ Testing sessions table structure...');
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, status, organizer_id')
        .limit(1);

      if (error) {
        console.log('❌ Sessions table query failed:', error.message);
        if (error.message.includes('column "status" does not exist')) {
          console.log('   Confirmed: status column is missing');
        }
        if (error.message.includes('column "id" does not exist')) {
          console.log('   Confirmed: column naming issue (session_id vs id)');
        }
      } else {
        console.log('✅ Sessions table structure seems correct');
      }
    } catch (err) {
      console.log('❌ Sessions test error:', err.message);
    }

    // 3. Test group_sessions table structure
    console.log('\n3️⃣ Testing group_sessions table structure...');
    try {
      const { data, error } = await supabase
        .from('group_sessions')
        .select('id, status, creator_id')
        .limit(1);

      if (error) {
        console.log('❌ Group sessions table query failed:', error.message);
        if (error.message.includes('column "status" does not exist')) {
          console.log('   Confirmed: status column is missing');
        }
        if (error.message.includes('column "id" does not exist')) {
          console.log('   Confirmed: column naming issue (session_id vs id)');
        }
        if (error.message.includes('column "creator_id" does not exist')) {
          console.log('   Confirmed: column naming issue (organizer_id vs creator_id)');
        }
      } else {
        console.log('✅ Group sessions table structure seems correct');
      }
    } catch (err) {
      console.log('❌ Group sessions test error:', err.message);
    }

    console.log('\n🔧 SOLUTION: Execute the database_fixes.sql file in Supabase SQL Editor');
    console.log('📍 Location: https://sogwgxkxuuvvvjbqlcdo.supabase.co/project/sogwgxkxuuvvvjbqlcdo/sql');

  } catch (err) {
    console.error('Overall test failed:', err.message);
  }
}

testDatabaseSchemaIssues();
