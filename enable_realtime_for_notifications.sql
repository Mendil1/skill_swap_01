-- Enable real-time for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Make sure RLS (Row Level Security) is enabled for the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow users to see only their own notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Add a policy to allow the system to insert notifications for any user
CREATE POLICY "System can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (true);