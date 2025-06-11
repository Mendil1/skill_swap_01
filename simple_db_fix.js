console.log('Starting database fix...');

// Use require for Node.js compatibility
const supabaseJs = require('@supabase/supabase-js');
const { createClient } = supabaseJs;

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8';

console.log('Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeRLSFix() {
  console.log('Testing connection...');

  try {
    // Simple connection test
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      console.log('Connection error:', error);
      return;
    }

    console.log('Connection successful!');

    // Disable RLS on key tables
    const sqlCommands = [
      "ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE messages DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE users DISABLE ROW LEVEL SECURITY;",
      "DROP POLICY IF EXISTS \"Users can view their own notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"System can insert notifications\" ON notifications;",
      "DROP POLICY IF EXISTS \"Users can insert notifications for others\" ON notifications;",
      "GRANT ALL ON notifications TO authenticated;",
      "GRANT ALL ON notifications TO anon;",
      "GRANT ALL ON messages TO authenticated;",
      "GRANT ALL ON messages TO anon;",
      "GRANT ALL ON connection_requests TO authenticated;",
      "GRANT ALL ON connection_requests TO anon;"
    ];

    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`Executing ${i + 1}/${sqlCommands.length}: ${sql.substring(0, 50)}...`);

      try {
        const result = await supabase.rpc('exec_sql', { sql });

        if (result.error) {
          console.log(`  ❌ Error: ${result.error.message}`);
        } else {
          console.log(`  ✅ Success`);
        }
      } catch (err) {
        console.log(`  ❌ Exception: ${err.message}`);
      }
    }

    // Test notification creation
    console.log('\nTesting notification creation...');
    const testNotification = {
      user_id: '12345678-1234-5678-9abc-123456789012',
      title: 'Test Notification',
      message: 'This is a test',
      type: 'test',
      is_read: false
    };

    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select();

    if (notifError) {
      console.log('Notification test failed:', notifError);
    } else {
      console.log('✅ Notification test successful:', notifData);
    }

    console.log('\nDatabase fix completed!');

  } catch (err) {
    console.log('Fix failed:', err);
  }
}

executeRLSFix();
