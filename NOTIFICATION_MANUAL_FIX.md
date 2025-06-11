# Notification System Manual Fix Instructions

If you're experiencing issues with the notification system, follow these manual steps to fix the permissions in your Supabase database.

## 1. Log in to Supabase

1. Go to https://supabase.com and log in to your account
2. Open your project dashboard

## 2. Open the SQL Editor

1. Click on "SQL Editor" in the left sidebar
2. Create a new query

## 3. Run the Following SQL Commands

Copy and paste the following SQL commands into the editor and run them:

```sql
-- Drop all existing notification policies
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

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create Service Role Policy
-- This allows the service role to perform any operation
CREATE POLICY "Service role can do anything with notifications"
ON notifications
USING (auth.jwt()->>'role' = 'service_role');

-- Create User Policies
-- Users can see their own notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Allow authenticated users to insert notifications
CREATE POLICY "Users can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## 4. Create Required Functions

Run the following SQL to create helper functions for managing notification permissions:

```sql
-- Function to enable RLS on notifications table
CREATE OR REPLACE FUNCTION enable_rls_on_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Enable RLS on notifications table
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
END;
$$;

-- Function to create service role policy
CREATE OR REPLACE FUNCTION create_service_role_policy()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Service role can do anything with notifications" ON notifications;
  
  -- Create new policy for service role
  CREATE POLICY "Service role can do anything with notifications" 
  ON notifications 
  USING (auth.jwt()->>'role' = 'service_role');
END;
$$;

-- Function to create user notification policies
CREATE OR REPLACE FUNCTION create_user_notification_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
  
  -- Create policies for regular users
  CREATE POLICY "Users can view their own notifications" 
  ON notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert notifications" 
  ON notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
  
  CREATE POLICY "Users can update their own notifications" 
  ON notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);
END;
$$;

-- Function to execute arbitrary SQL (use with caution)
CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_string;
END;
$$;
```

## 5. Verify the Service Role Key

1. Go to Project Settings > API
2. Make sure your service role key is correctly set in your environment variables:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6. Test the Notification System

After applying these fixes:

1. Go to http://localhost:3000/test-notifications
2. Create a test notification
3. Check if it appears in the notification bell

## Troubleshooting

If you're still having issues:

1. Check the browser console for error messages
2. Verify that your Supabase environment variables are correctly set
3. Ensure that the notifications table exists with the correct schema
4. Check that your service role key has the necessary permissions

For detailed schema information, the notifications table should have:

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```
