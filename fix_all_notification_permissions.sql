-- Create an updated permissions file for notifications that addresses all issues
-- This will be applied to the database to fix notification permissions

-- Drop all existing policies for a clean slate
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Bypass RLS for notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can do anything with notifications" ON notifications;
DROP POLICY IF EXISTS "Allow anon to insert notifications" ON notifications;

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Allow service role to do anything (this is critical for our API endpoint)
CREATE POLICY "Service role bypass"
ON notifications
USING (true)
WITH CHECK (true);

-- 2. Users can view only their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- 3. Allow ANY authenticated user to insert notifications
CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Users can only update their own notifications
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
