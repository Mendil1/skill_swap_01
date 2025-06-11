-- Create a database function to insert notifications with RLS bypass
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT,
  p_reference_id UUID,
  p_is_read BOOLEAN DEFAULT FALSE
) RETURNS UUID
SECURITY DEFINER -- This means the function runs with the privileges of the creator
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    message,
    reference_id,
    is_read
  ) VALUES (
    p_user_id,
    p_type,
    p_message,
    p_reference_id,
    p_is_read
  )
  RETURNING notification_id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;