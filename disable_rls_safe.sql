-- SAFE DISABLE ROW LEVEL SECURITY SCRIPT
-- This script will remove RLS safely without conflicts
-- WARNING: This will make all data publicly accessible - use only for development/testing

-- 1. DISABLE RLS ON ALL MAIN TABLES (with error handling)
DO $$
BEGIN
    -- Disable RLS on each table with error handling
    BEGIN
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on users table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on users: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on skills table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on skills: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE user_skills DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on user_skills table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on user_skills: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on connection_requests table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on connection_requests: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on messages table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on messages: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on sessions table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on sessions: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE group_sessions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on group_sessions table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on group_sessions: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE group_session_participants DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on group_session_participants table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on group_session_participants: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on reviews table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on reviews: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE credits_transactions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on credits_transactions table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on credits_transactions: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on notifications table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on notifications: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on reports table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on reports: %', SQLERRM;
    END;
END $$;

-- 2. DROP ALL EXISTING RLS POLICIES (with error handling)
DO $$
BEGIN
    -- Users table policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON users;
    DROP POLICY IF EXISTS "Anyone can view user profiles" ON users;
    DROP POLICY IF EXISTS "Users can create their own profile" ON users;

    -- Skills table policies
    DROP POLICY IF EXISTS "Anyone can view skills" ON skills;
    DROP POLICY IF EXISTS "Authenticated users can create skills" ON skills;

    -- User_skills table policies
    DROP POLICY IF EXISTS "Users can view all user skills" ON user_skills;
    DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;
    DROP POLICY IF EXISTS "Users can create their own skills" ON user_skills;
    DROP POLICY IF EXISTS "Users can update their own skills" ON user_skills;
    DROP POLICY IF EXISTS "Users can delete their own skills" ON user_skills;

    -- Connection_requests table policies
    DROP POLICY IF EXISTS "Users can view connection requests involving them" ON connection_requests;
    DROP POLICY IF EXISTS "Users can create connection requests" ON connection_requests;
    DROP POLICY IF EXISTS "Users can update connection requests they received" ON connection_requests;
    DROP POLICY IF EXISTS "Users can update connection requests they sent" ON connection_requests;

    -- Messages table policies
    DROP POLICY IF EXISTS "Users can view messages in their connections" ON messages;
    DROP POLICY IF EXISTS "Users can send messages in their connections" ON messages;

    -- Sessions table policies
    DROP POLICY IF EXISTS "Users can view sessions they're part of" ON sessions;
    DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
    DROP POLICY IF EXISTS "Users can update sessions they created or participate in" ON sessions;

    -- Group_sessions table policies
    DROP POLICY IF EXISTS "Users can view all group sessions" ON group_sessions;
    DROP POLICY IF EXISTS "Users can create group sessions" ON group_sessions;
    DROP POLICY IF EXISTS "Creators can update their group sessions" ON group_sessions;
    DROP POLICY IF EXISTS "Users can view group sessions" ON group_sessions;

    -- Group_session_participants table policies
    DROP POLICY IF EXISTS "Users can view group session participants" ON group_session_participants;
    DROP POLICY IF EXISTS "Users can join group sessions" ON group_session_participants;
    DROP POLICY IF EXISTS "Users can leave group sessions" ON group_session_participants;

    -- Reviews table policies
    DROP POLICY IF EXISTS "Users can view all reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;

    -- Credits_transactions table policies
    DROP POLICY IF EXISTS "Users can view their own transactions" ON credits_transactions;
    DROP POLICY IF EXISTS "System can create transactions" ON credits_transactions;

    -- Notifications table policies
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Bypass RLS for notifications" ON notifications;
    DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;

    -- Reports table policies
    DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
    DROP POLICY IF EXISTS "Users can create reports" ON reports;

    RAISE NOTICE 'All RLS policies have been dropped successfully';
END $$;

-- 3. GRANT FULL PUBLIC ACCESS TO ALL TABLES
DO $$
BEGIN
    -- Grant full access to authenticated role
    GRANT ALL ON users TO authenticated;
    GRANT ALL ON skills TO authenticated;
    GRANT ALL ON user_skills TO authenticated;
    GRANT ALL ON connection_requests TO authenticated;
    GRANT ALL ON messages TO authenticated;
    GRANT ALL ON sessions TO authenticated;
    GRANT ALL ON group_sessions TO authenticated;
    GRANT ALL ON group_session_participants TO authenticated;
    GRANT ALL ON reviews TO authenticated;
    GRANT ALL ON credits_transactions TO authenticated;
    GRANT ALL ON notifications TO authenticated;
    GRANT ALL ON reports TO authenticated;

    -- Grant full access to anonymous role (public access)
    GRANT ALL ON users TO anon;
    GRANT ALL ON skills TO anon;
    GRANT ALL ON user_skills TO anon;
    GRANT ALL ON connection_requests TO anon;
    GRANT ALL ON messages TO anon;
    GRANT ALL ON sessions TO anon;
    GRANT ALL ON group_sessions TO anon;
    GRANT ALL ON group_session_participants TO anon;
    GRANT ALL ON reviews TO anon;
    GRANT ALL ON credits_transactions TO anon;
    GRANT ALL ON notifications TO anon;
    GRANT ALL ON reports TO anon;

    RAISE NOTICE 'Full access granted to authenticated and anonymous roles';
END $$;

-- 4. CHECK WHICH TABLES ARE IN REALTIME PUBLICATION
-- This will help us avoid conflicts
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- Summary message
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RLS DISABLE PROCESS COMPLETED SAFELY';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RLS has been disabled on all available tables.';
    RAISE NOTICE 'All data is now publicly accessible without authentication.';
    RAISE NOTICE 'This configuration should only be used for development/testing.';
    RAISE NOTICE '============================================';
END $$;
