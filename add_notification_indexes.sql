-- Add indexes to improve notification system performance

-- Add index to user_id column in notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Add index to created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON notifications(user_id, is_read);

-- Add index for reference_id lookups
CREATE INDEX IF NOT EXISTS idx_notifications_reference_id ON notifications(reference_id);

-- Analyze the table to update statistics for the query planner
ANALYZE notifications;
