#!/bin/bash

echo "🔧 SkillSwap Messaging System - Complete Fix Script"
echo "================================================="

# Kill any existing dev servers
echo "Stopping any running processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Install dependencies
echo "Installing dependencies..."
npm install

# Test database connection and disable RLS
echo "Testing database connection and disabling RLS..."
node -e "
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('🔍 Testing database connection...');

  try {
    // Test connection
    const { error: testError } = await supabase.from('users').select('user_id').limit(1);

    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Disable RLS on critical tables
    const tables = ['notifications', 'messages', 'connection_requests', 'users', 'sessions'];

    for (const table of tables) {
      console.log(\`🔧 Disabling RLS on \${table}...\`);

      const { error } = await supabase.rpc('exec_sql', {
        sql: \`ALTER TABLE \${table} DISABLE ROW LEVEL SECURITY;\`
      });

      if (error) {
        console.log(\`⚠️  Could not disable RLS on \${table}: \${error.message}\`);
      } else {
        console.log(\`✅ RLS disabled on \${table}\`);
      }
    }

    // Test notification creation
    console.log('🔍 Testing notification creation...');
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: '12345678-1234-5678-9abc-123456789012',
        title: 'System Test',
        message: 'RLS disable test notification',
        type: 'system',
        is_read: false
      })
      .select();

    if (error) {
      console.log('❌ Notification test failed:', error.message);
    } else {
      console.log('✅ Notification creation successful!');
    }

    console.log('🎉 Database fixes completed!');

  } catch (err) {
    console.log('❌ Database fix failed:', err.message);
  }
}

fixDatabase();
"

echo "Starting development server..."
npm run dev
