-- SQL functions for fixing notification permissions
-- These functions can be executed from the Supabase SQL Editor

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

-- Function to apply all notification permissions at once
CREATE OR REPLACE FUNCTION apply_all_notification_permissions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Enable RLS
  PERFORM enable_rls_on_notifications();

  -- Create policies
  PERFORM create_service_role_policy();
  PERFORM create_user_notification_policies();
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
