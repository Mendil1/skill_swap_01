-- Fix notifications table permissions
-- This SQL script will update the RLS policies for the notifications table

-- First, we'll disable all existing RLS policies on the notifications table
DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can only insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admin can do anything with notifications" ON notifications;

-- Enable RLS on the notifications table if it's not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own notifications
CREATE POLICY "Users can see their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow users to create notifications for themselves
CREATE POLICY "Users can insert their own notifications"
ON notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy to allow service role to do anything with notifications
-- This is essential for server-side notification creation
CREATE POLICY "Service role can do anything with notifications"
ON notifications
USING (auth.jwt() ->> 'role' = 'service_role');

-- Optional: Create a trigger to handle notification cleanup (deleting old notifications)
-- Uncomment this if you want to automatically remove old notifications
/*
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete notifications older than 30 days
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_read = TRUE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_notifications_trigger ON notifications;
CREATE TRIGGER cleanup_notifications_trigger
AFTER INSERT ON notifications
EXECUTE PROCEDURE clean_old_notifications();
*/
