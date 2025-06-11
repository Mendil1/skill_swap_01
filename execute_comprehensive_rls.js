// Execute the comprehensive RLS disable script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeRLSDisable() {
  console.log('🔧 Executing comprehensive RLS disable script...\n');

  try {
    // Test connection first
    console.log('Testing database connection...');
    const { data, error: testError } = await supabase.from('users').select('user_id').limit(1);

    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      return;
    }

    console.log('✅ Database connection successful\n');

    // Read and execute the comprehensive SQL script
    const sqlScript = fs.readFileSync('disable_rls_safe.sql', 'utf8');

    // Split into executable blocks (DO $$ blocks and individual statements)
    const blocks = sqlScript.split(/(?=DO \$\$|SELECT|--\s*Summary)/);

    console.log(`Found ${blocks.length} SQL blocks to execute...\n`);

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();

      if (!block || block.startsWith('--') || block.length < 10) {
        continue;
      }

      console.log(`Executing block ${i + 1}...`);
      console.log(block.substring(0, 100) + '...\n');

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: block });

        if (error) {
          console.log(`❌ Block ${i + 1} failed:`, error.message);
        } else {
          console.log(`✅ Block ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`❌ Block ${i + 1} exception:`, err.message);
      }

      // Small delay between blocks
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 RLS disable script execution completed!');

    // Test notification creation
    console.log('\nTesting notification creation...');
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: '12345678-1234-5678-9abc-123456789012',
        title: 'RLS Test',
        message: 'Testing after RLS disable',
        type: 'test',
        is_read: false
      })
      .select();

    if (notifError) {
      console.log('❌ Notification test failed:', notifError.message);
    } else {
      console.log('✅ Notification creation successful!', notifData);
    }

  } catch (err) {
    console.error('❌ Script execution failed:', err.message);
  }
}

executeRLSDisable();
