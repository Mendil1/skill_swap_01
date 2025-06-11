-- Database Schema Fixes for Sessions System
-- This script fixes the column naming and missing columns issues

-- Fix sessions table
-- 1. Add status column if it doesn't exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));

-- 2. Add id column that matches the expected UUID format (if using session_id rename)
-- Note: We'll create a view or update references, but for now let's add missing columns

-- Fix group_sessions table
-- 1. Add status column if it doesn't exist
ALTER TABLE group_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));

-- 2. Rename organizer_id to creator_id to match expected naming
ALTER TABLE group_sessions RENAME COLUMN organizer_id TO creator_id;

-- 3. Update group_session_participants to reference the correct column name
-- First check if the column exists and rename if needed
ALTER TABLE group_session_participants RENAME COLUMN session_id TO group_session_id;

-- Create profiles table as a view of users table for compatibility
CREATE OR REPLACE VIEW profiles AS
SELECT
    user_id as id,
    full_name,
    email,
    bio,
    availability,
    profile_image_url,
    created_at,
    updated_at
FROM users;

-- Create connections table as a view of connection_requests for compatibility
CREATE OR REPLACE VIEW connections AS
SELECT
    connection_id as id,
    sender_id as user_id,
    receiver_id as connected_user_id,
    status,
    created_at
FROM connection_requests;

-- Grant proper permissions for the views
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON connections TO anon, authenticated;

-- Update RLS policies for sessions tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_session_participants ENABLE ROW LEVEL SECURITY;

-- RLS policy for sessions - users can only see sessions they're part of
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
CREATE POLICY "Users can view their own sessions" ON sessions
    FOR ALL USING (
        auth.uid()::text = organizer_id::text OR
        auth.uid()::text = participant_id::text
    );

-- RLS policy for group sessions - users can see group sessions they created or joined
DROP POLICY IF EXISTS "Users can view group sessions they're involved in" ON group_sessions;
CREATE POLICY "Users can view group sessions they're involved in" ON group_sessions
    FOR ALL USING (
        auth.uid()::text = creator_id::text OR
        EXISTS (
            SELECT 1 FROM group_session_participants gsp
            WHERE gsp.group_session_id = group_sessions.session_id
            AND gsp.user_id::text = auth.uid()::text
        )
    );

-- RLS policy for group session participants
DROP POLICY IF EXISTS "Users can view group session participants" ON group_session_participants;
CREATE POLICY "Users can view group session participants" ON group_session_participants
    FOR ALL USING (
        auth.uid()::text = user_id::text OR
        EXISTS (
            SELECT 1 FROM group_sessions gs
            WHERE gs.session_id = group_session_participants.group_session_id
            AND gs.creator_id::text = auth.uid()::text
        )
    );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_organizer_id ON sessions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_participant_id ON sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

CREATE INDEX IF NOT EXISTS idx_group_sessions_creator_id ON group_sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_scheduled_at ON group_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_group_sessions_status ON group_sessions(status);

CREATE INDEX IF NOT EXISTS idx_group_session_participants_group_session_id ON group_session_participants(group_session_id);
CREATE INDEX IF NOT EXISTS idx_group_session_participants_user_id ON group_session_participants(user_id);
