// Script to execute RLS disable SQL using Supabase client
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables (URL or Service Role Key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeRLSDisable() {
  console.log('🔄 Starting RLS disable process...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('disable_rls_completely.sql', 'utf8');
    
    // Split into individual statements and filter out comments and empty lines
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute...\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back
      console.log(`Executing (${i + 1}/${statements.length}): ${statement.substring(0, 60)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`);
        errorCount++;
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Execution Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 All RLS policies have been successfully disabled!');
    } else {
      console.log('\n⚠️  Some statements failed. You may need to run them manually in Supabase SQL Editor.');
    }

  } catch (err) {
    console.error('❌ Failed to execute RLS disable script:', err.message);
  }
}

// Alternative: Display statements for manual execution
async function displayStatementsForManualExecution() {
  console.log('\n📋 SQL Statements for Manual Execution in Supabase:');
  console.log('Copy and paste the following into Supabase SQL Editor:\n');
  
  try {
    const sqlContent = fs.readFileSync('disable_rls_completely.sql', 'utf8');
    console.log(sqlContent);
  } catch (err) {
    console.error('❌ Failed to read SQL file:', err.message);
  }
}

// Check if we can use RPC, otherwise display for manual execution
async function main() {
  console.log('🔧 Attempting to disable RLS policies...\n');
  
  // First try to create a simple RPC function for executing SQL
  try {
    console.log('📝 Creating SQL execution function...');
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (funcError) {
      console.log('❌ Cannot create exec function, falling back to manual method...\n');
      await displayStatementsForManualExecution();
    } else {
      console.log('✅ Function created, executing RLS disable...\n');
      await executeRLSDisable();
    }
    
  } catch (err) {
    console.log('❌ RPC not available, showing statements for manual execution...\n');
    await displayStatementsForManualExecution();
  }
}

main();
