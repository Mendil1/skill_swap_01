-- Comprehensive notification system permissions fix
-- This SQL script applies all necessary Row Level Security policies for the notification system

-- First, drop all existing policies for a clean slate
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Bypass RLS for notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can do anything with notifications" ON notifications;
DROP POLICY IF EXISTS "Allow anon to insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role bypass" ON notifications;
DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service Role Bypass (highest priority)
-- This allows the service role to perform any operation
-- Critical for API endpoints that need to create notifications for other users
CREATE POLICY "Service role can do anything with notifications"
ON notifications
USING (auth.jwt()->>'role' = 'service_role');

-- Policy 2: Users can view only their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Policy 3: Allow ANY authenticated user to insert notifications
-- This is critical for connection requests and messages functionality
CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 4: Users can only update their own notifications
-- This allows users to mark notifications as read
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for notifications table (if needed)
-- This allows clients to receive real-time updates when notifications change
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Notes:
-- 1. The service role policy uses auth.jwt()->>'role' = 'service_role' which is more specific and secure
-- 2. All policies use the user_id field to match against auth.uid()
-- 3. The insert policy allows any authenticated user to create notifications (needed for messaging)
-- 4. There's no delete policy as notifications should be kept for audit purposes
