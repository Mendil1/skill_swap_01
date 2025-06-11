import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Get the Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }

    // Create Supabase client with service role key to bypass RLS
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, any>) {
          // API routes don't need to set cookies
        },
        remove(name: string, options: Record<string, any>) {
          // API routes don't need to remove cookies
        },
      },
    });

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'add_notification_indexes.sql');
    let sql: string;

    try {
      sql = fs.readFileSync(sqlFilePath, 'utf8');
    } catch (err) {
      console.error('Error reading SQL file:', err);
      return NextResponse.json({
        success: false,
        error: 'Could not read SQL file'
      }, { status: 500 });
    }

    // Execute the SQL using Supabase's rpc function or a raw query
    // Method 1: Using RPC if available
    try {
      // Check if the execute_sql RPC function exists
      const { data: rpcCheck, error: rpcCheckError } = await supabase.rpc('rpc_exists', { function_name: 'execute_sql' });

      if (!rpcCheckError && rpcCheck) {
        // Use the RPC function to execute SQL
        const { data, error } = await supabase.rpc('execute_sql', { sql_string: sql });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Successfully applied database indexes using RPC',
          method: 'rpc'
        });
      }
    } catch (error) {
      console.log('RPC method failed, trying raw query method...');
    }

    // Method 2: Execute SQL statements individually
    try {
      // Split the SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const results = [];

      for (const statement of statements) {
        // Execute each statement using RPC
        const { error } = await supabase.rpc('execute_sql', { 
          sql_query: statement 
        });

        if (error) {
          results.push({ statement, success: false, error: error.message });
        } else {
          results.push({ statement, success: true });
        }
      }

      const allSucceeded = results.every(r => r.success);

      return NextResponse.json({
        success: allSucceeded,
        message: allSucceeded
          ? 'Successfully applied database indexes using raw SQL'
          : 'Some SQL statements failed',
        method: 'raw_sql',
        results
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: `Failed to execute SQL: ${error.message || 'Unknown error'}`,
        method: 'raw_sql'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error applying performance optimizations:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
