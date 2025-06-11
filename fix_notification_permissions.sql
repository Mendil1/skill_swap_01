-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;

-- Make sure RLS (Row Level Security) is enabled for the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow users to see only their own notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Add a policy to allow authenticated users to insert notifications for ANY user
-- This is necessary for connection requests and messages to work properly
CREATE POLICY "Users can insert notifications for others" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add a policy to allow users to update their own notifications (e.g., marking as read)
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE
USING (auth.uid() = user_id);