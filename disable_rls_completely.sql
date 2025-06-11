-- DISABLE ROW LEVEL SECURITY SCRIPT
-- This script will remove RLS as much as possible from the SkillSwap application
-- WARNING: This will make all data publicly accessible - use only for development/testing

-- 1. DISABLE RLS ON ALL MAIN TABLES
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_session_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE credits_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING RLS POLICIES

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

-- 3. GRANT FULL PUBLIC ACCESS TO ALL TABLES
-- This allows anonymous access to all tables without authentication

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

-- 4. ENABLE REALTIME FOR ALL TABLES (without RLS restrictions)
-- First, try to remove tables from realtime publication to avoid conflicts
DO $$
BEGIN
    -- Remove tables if they exist in publication
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS users;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS skills;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS user_skills;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS connection_requests;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS messages;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS sessions;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS group_sessions;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS group_session_participants;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS reviews;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS credits_transactions;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS notifications;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS reports;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- Now add all tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE skills;
ALTER PUBLICATION supabase_realtime ADD TABLE user_skills;
ALTER PUBLICATION supabase_realtime ADD TABLE connection_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE group_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE group_session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE credits_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- 5. CREATE SERVICE ROLE FUNCTION FOR BYPASSING RLS
-- This function can be called to perform operations that bypass any remaining RLS
CREATE OR REPLACE FUNCTION bypass_rls_operation(
  table_name text,
  operation text,
  data jsonb DEFAULT NULL,
  where_clause text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  query_text text;
BEGIN
  -- Construct the query based on operation
  CASE operation
    WHEN 'SELECT' THEN
      query_text := format('SELECT row_to_json(t) FROM %I t', table_name);
      IF where_clause IS NOT NULL THEN
        query_text := query_text || ' WHERE ' || where_clause;
      END IF;
    WHEN 'INSERT' THEN
      query_text := format('INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, %L) RETURNING row_to_json(%I)', 
                           table_name, table_name, data, table_name);
    WHEN 'UPDATE' THEN
      query_text := format('UPDATE %I SET (%s) = (%s) WHERE %s RETURNING row_to_json(%I)', 
                           table_name, 
                           (SELECT string_agg(key, ',') FROM jsonb_each_text(data)),
                           (SELECT string_agg(quote_literal(value), ',') FROM jsonb_each_text(data)),
                           COALESCE(where_clause, 'true'),
                           table_name);
    WHEN 'DELETE' THEN
      query_text := format('DELETE FROM %I WHERE %s RETURNING row_to_json(%I)', 
                           table_name, COALESCE(where_clause, 'true'), table_name);
  END CASE;
  
  -- Execute the query
  EXECUTE query_text INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION bypass_rls_operation TO authenticated;
GRANT EXECUTE ON FUNCTION bypass_rls_operation TO anon;

-- Summary message
DO $$
BEGIN
  RAISE NOTICE 'RLS has been disabled on all tables in the SkillSwap application.';
  RAISE NOTICE 'All data is now publicly accessible without authentication.';
  RAISE NOTICE 'This configuration should only be used for development/testing purposes.';
  RAISE NOTICE 'Tables affected: users, skills, user_skills, connection_requests, messages,';
  RAISE NOTICE 'sessions, group_sessions, group_session_participants, reviews,';
  RAISE NOTICE 'credits_transactions, notifications, reports';
END $$;
