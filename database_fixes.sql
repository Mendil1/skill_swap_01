-- Database fixes for notification and session issues
-- Run this in Supabase SQL Editor

-- 1. Add missing status columns to sessions tables
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'upcoming' 
CHECK (status IN ('upcoming', 'in-progress', 'completed', 'cancelled'));

ALTER TABLE group_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'upcoming' 
CHECK (status IN ('upcoming', 'in-progress', 'completed', 'cancelled'));

-- Update column names to match the code expectations
-- Note: Be careful with these renames as they affect foreign key relationships
-- Using DO blocks to handle cases where columns might already be renamed

DO $$
BEGIN
    -- Rename sessions.session_id to id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'session_id') THEN
        ALTER TABLE sessions RENAME COLUMN session_id TO id;
    END IF;
    
    -- Rename group_sessions.session_id to id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'group_sessions' AND column_name = 'session_id') THEN
        ALTER TABLE group_sessions RENAME COLUMN session_id TO id;
    END IF;
    
    -- Fix group_session_participants foreign key and rename column if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'group_session_participants' AND column_name = 'session_id') THEN
        -- Drop the old constraint if it exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'group_session_participants_session_id_fkey') THEN
            ALTER TABLE group_session_participants DROP CONSTRAINT group_session_participants_session_id_fkey;
        END IF;
        
        -- Rename the column
        ALTER TABLE group_session_participants RENAME COLUMN session_id TO group_session_id;
        
        -- Add the new constraint
        ALTER TABLE group_session_participants ADD CONSTRAINT group_session_participants_group_session_id_fkey 
          FOREIGN KEY (group_session_id) REFERENCES group_sessions(id) ON DELETE CASCADE;
    END IF;
    
    -- Rename group_sessions.organizer_id to creator_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'group_sessions' AND column_name = 'organizer_id') THEN
        ALTER TABLE group_sessions RENAME COLUMN organizer_id TO creator_id;
    END IF;
END $$;

-- 2. Fix notifications table RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Bypass RLS for notifications" ON notifications;

-- Make sure RLS (Row Level Security) is enabled for the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow users to see only their own notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Add a policy to allow ANYONE to insert notifications
-- This is necessary since we're having auth issues with the client
CREATE POLICY "Bypass RLS for notifications" 
ON notifications FOR INSERT 
WITH CHECK (true);

-- Add a policy to allow users to update their own notifications (e.g., marking as read)
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Add RLS policies for sessions tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_session_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing sessions policies if they exist
DROP POLICY IF EXISTS "Users can view sessions they're part of" ON sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update sessions they created or participate in" ON sessions;

-- Sessions policies
CREATE POLICY "Users can view sessions they're part of" 
ON sessions FOR SELECT 
USING (auth.uid() = organizer_id OR auth.uid() = participant_id);

CREATE POLICY "Users can create sessions" 
ON sessions FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update sessions they created or participate in" 
ON sessions FOR UPDATE
USING (auth.uid() = organizer_id OR auth.uid() = participant_id);

-- Drop existing group sessions policies if they exist
DROP POLICY IF EXISTS "Users can view all group sessions" ON group_sessions;
DROP POLICY IF EXISTS "Users can create group sessions" ON group_sessions;
DROP POLICY IF EXISTS "Creators can update their group sessions" ON group_sessions;

-- Group sessions policies
CREATE POLICY "Users can view all group sessions" 
ON group_sessions FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create group sessions" 
ON group_sessions FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their group sessions" 
ON group_sessions FOR UPDATE
USING (auth.uid() = creator_id);

-- Drop existing group session participants policies if they exist
DROP POLICY IF EXISTS "Users can view group session participants" ON group_session_participants;
DROP POLICY IF EXISTS "Users can join group sessions" ON group_session_participants;
DROP POLICY IF EXISTS "Users can leave group sessions" ON group_session_participants;

-- Group session participants policies
CREATE POLICY "Users can view group session participants" 
ON group_session_participants FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can join group sessions" 
ON group_session_participants FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave group sessions" 
ON group_session_participants FOR DELETE
USING (auth.uid() = user_id);

-- 4. Add RLS policies for messages and connection_requests
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing messages policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their connections" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their connections" ON messages;

-- Messages policies
CREATE POLICY "Users can view messages in their connections" 
ON messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM connection_requests cr 
    WHERE cr.connection_id = messages.connection_id 
    AND (cr.sender_id = auth.uid() OR cr.receiver_id = auth.uid())
    AND cr.status = 'accepted'
  )
);

CREATE POLICY "Users can send messages in their connections" 
ON messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM connection_requests cr 
    WHERE cr.connection_id = messages.connection_id 
    AND (cr.sender_id = auth.uid() OR cr.receiver_id = auth.uid())
    AND cr.status = 'accepted'
  )
);

-- Drop existing connection requests policies if they exist
DROP POLICY IF EXISTS "Users can view connection requests involving them" ON connection_requests;
DROP POLICY IF EXISTS "Users can create connection requests" ON connection_requests;
DROP POLICY IF EXISTS "Users can update connection requests they received" ON connection_requests;

-- Connection requests policies
CREATE POLICY "Users can view connection requests involving them" 
ON connection_requests FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests" 
ON connection_requests FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update connection requests they received" 
ON connection_requests FOR UPDATE
USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
