-- Updated and consolidated notification policies

-- Drop all existing policies for a clean slate
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Bypass RLS for notifications" ON notifications;

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view only their own notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Allow ANY authenticated user to insert notifications
-- This is critical for connection requests and messages functionality
CREATE POLICY "Users can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 3: Users can only update their own notifications
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Policy 4: Service Role Bypass (for the API endpoint)
-- This allows the service role to perform any operation
CREATE POLICY "Service role can do anything with notifications"
ON notifications
USING (auth.jwt()->>'role' = 'service_role');