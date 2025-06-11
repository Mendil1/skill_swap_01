const { createClient } = require('@supabase/supabase-js');

// Using the credentials from schema.sql
const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');

    // Test basic connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful!');

    // Test current schema issues
    console.log('\n🔍 Checking current schema...');

    // Check if notifications table has RLS issues
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (notifError) {
      console.log('⚠️  Notifications table issue:', notifError.message);
    } else {
      console.log('✅ Notifications table accessible');
    }

    // Check sessions table structure
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status')
      .limit(1);

    if (sessionError) {
      console.log('⚠️  Sessions table issue:', sessionError.message);
    } else {
      console.log('✅ Sessions table accessible');
    }

    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

testConnection();
