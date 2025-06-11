// Simple RLS disable script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jozrpjtnhpxvkwglchbt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvenJwanRuaHB4dmtrZ2xjaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc2MjE3MCwiZXhwIjoyMDQ5MzM4MTcwfQ.x6aFUPrMNP3Hs0TplOqkfNP4qKqPhAmdHRzUANWOLPs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('Starting simple RLS disable...');

  const queries = [
    'ALTER TABLE users DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE skills DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE user_skills DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE messages DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;'
  ];

  for (const query of queries) {
    try {
      console.log(`Executing: ${query}`);
      const { data, error } = await supabase.rpc('exec_sql', { sql: query });

      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Success`);
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
  }

  console.log('RLS disable completed!');
}

disableRLS().catch(console.error);
