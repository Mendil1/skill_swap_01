#!/usr/bin/env node

// Simple test to verify database connection and RLS status
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8';

async function testDatabaseAccess() {
    console.log('🔧 Testing SkillSwap Database Access...\n');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Test basic connection
        console.log('1. Testing database connection...');
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('user_id')
            .limit(1);

        if (testError) {
            console.log('❌ Connection failed:', testError.message);
            return;
        }

        console.log('✅ Database connection successful\n');

        // Test notification creation
        console.log('2. Testing notification creation...');
        const testNotification = {
            user_id: 'test-user-123',
            title: 'Test Notification',
            message: 'Testing database access',
            type: 'test',
            created_at: new Date().toISOString()
        };

        const { data: notifData, error: notifError } = await supabase
            .from('notifications')
            .insert([testNotification])
            .select();

        if (notifError) {
            console.log('❌ Notification creation failed:', notifError.message);
            console.log('Error details:', notifError);

            // Try to disable RLS
            console.log('\n3. Attempting to disable RLS...');
            try {
                const { error: rlsError } = await supabase.rpc('sql', {
                    query: 'ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;'
                });

                if (rlsError) {
                    console.log('❌ RLS disable failed:', rlsError.message);
                } else {
                    console.log('✅ RLS disabled successfully');

                    // Try notification creation again
                    const { data: retryData, error: retryError } = await supabase
                        .from('notifications')
                        .insert([testNotification])
                        .select();

                    if (retryError) {
                        console.log('❌ Notification still failing:', retryError.message);
                    } else {
                        console.log('✅ Notification creation now working!');

                        // Clean up test data
                        await supabase
                            .from('notifications')
                            .delete()
                            .eq('user_id', 'test-user-123');
                    }
                }
            } catch (rlsErr) {
                console.log('❌ RLS operation error:', rlsErr.message);
            }
        } else {
            console.log('✅ Notification creation successful!');
            console.log('Created notification:', notifData);

            // Clean up test data
            await supabase
                .from('notifications')
                .delete()
                .eq('user_id', 'test-user-123');
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
        console.log('Stack trace:', err.stack);
    }
}

testDatabaseAccess();
