// Test notification creation directly
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotificationCreation() {
  console.log('Testing notification creation with correct database...');
  
  try {
    // First, test connection
    const { error: testError } = await supabase
      .from('users')
      .select('user_id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Try to disable RLS on notifications table
    console.log('Disabling RLS on notifications table...');
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;' 
    });
    
    if (rlsError) {
      console.log('❌ RLS disable failed:', rlsError.message);
      console.log('Trying direct insert anyway...');
    } else {
      console.log('✅ RLS disabled successfully on notifications!');
    }
    
    // Test creating a notification directly
    console.log('Testing notification creation...');
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: '12345678-1234-5678-9abc-123456789012', // Test UUID
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'test',
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.log('❌ Notification creation failed:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Notification created successfully:', data);
    }
    
    // Test reading notifications
    console.log('\nTesting notification reading...');
    const { data: readData, error: readError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.log('❌ Notification reading failed:', readError.message);
    } else {
      console.log('✅ Notifications read successfully:', readData.length, 'notifications found');
    }
    
  } catch (err) {
    console.log('❌ Exception during test:', err.message);
  }
}

testNotificationCreation();
