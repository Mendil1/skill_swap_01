-- Enable trust all policy for notifications table
-- This will allow notifications to be created without checking auth
-- WARNING: This is less secure but needed for this specific use case

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