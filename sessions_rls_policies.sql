-- Enable RLS and create policies for sessions tables
-- This ensures that users can only see their own sessions

-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read sessions where they are organizer or participant
CREATE POLICY "Users can read their own sessions" ON sessions
FOR SELECT USING (
  auth.uid() = organizer_id OR auth.uid() = participant_id
);

-- Policy: Users can insert sessions where they are the organizer
CREATE POLICY "Users can create sessions as organizer" ON sessions
FOR INSERT WITH CHECK (
  auth.uid() = organizer_id
);

-- Policy: Users can update sessions where they are organizer or participant
CREATE POLICY "Users can update their own sessions" ON sessions
FOR UPDATE USING (
  auth.uid() = organizer_id OR auth.uid() = participant_id
);

-- Policy: Users can delete sessions where they are the organizer
CREATE POLICY "Users can delete sessions they organize" ON sessions
FOR DELETE USING (
  auth.uid() = organizer_id
);

-- Enable RLS on group_sessions table
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read group sessions where they are creator
CREATE POLICY "Users can read group sessions they created" ON group_sessions
FOR SELECT USING (
  auth.uid() = creator_id
);

-- Policy: Users can read group sessions where they are participants
CREATE POLICY "Users can read group sessions they participate in" ON group_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_session_participants
    WHERE group_session_id = group_sessions.id
    AND user_id = auth.uid()
  )
);

-- Policy: Users can insert group sessions where they are the creator
CREATE POLICY "Users can create group sessions" ON group_sessions
FOR INSERT WITH CHECK (
  auth.uid() = creator_id
);

-- Policy: Users can update group sessions where they are creator
CREATE POLICY "Users can update group sessions they created" ON group_sessions
FOR UPDATE USING (
  auth.uid() = creator_id
);

-- Policy: Users can delete group sessions where they are creator
CREATE POLICY "Users can delete group sessions they created" ON group_sessions
FOR DELETE USING (
  auth.uid() = creator_id
);

-- Enable RLS on group_session_participants table
ALTER TABLE group_session_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read participants for sessions they created
CREATE POLICY "Creators can read participants" ON group_session_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_sessions
    WHERE id = group_session_id
    AND creator_id = auth.uid()
  )
);

-- Policy: Users can read their own participation records
CREATE POLICY "Users can read their own participation" ON group_session_participants
FOR SELECT USING (
  auth.uid() = user_id
);

-- Policy: Users can join group sessions (insert their own participation)
CREATE POLICY "Users can join group sessions" ON group_session_participants
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Policy: Users can leave group sessions (delete their own participation)
CREATE POLICY "Users can leave group sessions" ON group_session_participants
FOR DELETE USING (
  auth.uid() = user_id
);

-- Policy: Creators can manage participants in their sessions
CREATE POLICY "Creators can manage participants" ON group_session_participants
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM group_sessions
    WHERE id = group_session_id
    AND creator_id = auth.uid()
  )
);
