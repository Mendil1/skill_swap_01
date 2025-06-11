import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAndFixDatabase() {
  console.log('🔧 Testing database and disabling RLS...\n');

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .limit(1);

    if (userError) {
      console.log('❌ Connection failed:', userError.message);
      return;
    }

    console.log('✅ Basic connection successful\n');

    // Test notifications table specifically
    console.log('2. Testing notifications table...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('notification_id')
      .limit(1);

    if (notifError) {
      console.log('❌ Notifications table error:', notifError.message);
    } else {
      console.log('✅ Notifications table accessible\n');
    }

    // Try direct SQL execution
    console.log('3. Attempting RLS disable via SQL...');

    const rlsStatements = [
      'ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE messages DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE users DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;'
    ];

    for (const statement of rlsStatements) {
      try {
        console.log(`Executing: ${statement}`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.log(`❌ Failed: ${error.message}`);
        } else {
          console.log(`✅ Success`);
        }
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`);
      }
    }

    // Test notification insertion
    console.log('\n4. Testing notification insertion...');
    const { data: insertResult, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: '12345678-1234-5678-9abc-123456789012',
        title: 'Database Test',
        message: 'Testing notification creation',
        type: 'test',
        is_read: false
      })
      .select();

    if (insertError) {
      console.log('❌ Notification insert failed:', insertError.message);
      console.log('Full error:', insertError);
    } else {
      console.log('✅ Notification insert successful!', insertResult);
    }

    // Test message table
    console.log('\n5. Testing messages table...');
    const { data: messages, error: messageError } = await supabase
      .from('messages')
      .select('message_id')
      .limit(1);

    if (messageError) {
      console.log('❌ Messages table error:', messageError.message);
    } else {
      console.log('✅ Messages table accessible');
    }

    console.log('\n🎉 Database test completed!');

  } catch (err) {
    console.error('❌ Test failed with exception:', err.message);
    console.error('Stack:', err.stack);
  }
}

testAndFixDatabase();
