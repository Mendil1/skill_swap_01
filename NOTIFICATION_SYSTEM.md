# Notification System Documentation

This document describes the notification system in SkillSwap, including how it works, how to test it, and how to troubleshoot common issues.

## Overview

The notification system enables real-time and persistent notifications for users. It supports:

- Connection requests
- Connection acceptances
- Direct messages
- System notifications

## Architecture

The system uses:

1. **Supabase Database**: Stores notifications in the `notifications` table
2. **Row Level Security (RLS)**: Controls access to notifications
3. **Service Role API**: Enables creating notifications for other users
4. **Client-side Fallback**: Stores notifications locally if server is unreachable
5. **Retry Mechanism**: Automatically retries failed notification creation

## Key Components

- `/api/notifications` - API route for creating and fetching notifications
- `/utils/notifications.ts` - Client-side utility for creating notifications
- `/utils/notification-retry.ts` - Handles retrying failed notifications
- `/components/notifications/notification-bell.tsx` - UI component for displaying notifications

## Testing the Notification System

### Using the Test Pages

1. **Notification Tests Page**
   - Visit `/notification-tests` to run comprehensive tests
   - Test client utility, direct API calls, and permission fixes
   - View test results and current notifications

2. **System Status Page**
   - Visit `/notification-system-status` to check the overall health
   - Validates environment variables, authentication, database connection

3. **Fix Notifications Page**
   - Visit `/fix-notifications` to apply permission fixes
   - Resets notification table permissions with correct RLS policies

### Manual Testing

1. **Create Test Notification**
   ```typescript
   import { createNotification } from "@/utils/notifications";
   
   await createNotification({
     userId: "user-id-here",
     type: "system",
     message: "Test notification",
     referenceId: "optional-reference"
   });
   ```

2. **Check Notification Bell**
   - The notification bell should display a badge with unread count
   - Click to see the notification in the dropdown

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**
   - Check browser console for errors
   - Verify user is logged in
   - Check RLS permissions on notifications table
   - Verify service role key is correctly set

2. **Permission Denied Errors**
   - Run the fix-notifications page to reset permissions
   - Verify service role key is correct in environment variables

3. **API Errors**
   - Check if CORS is properly configured
   - Verify API route is correctly handling cookies

### How to Fix RLS Permissions

If you encounter permission issues, visit `/fix-notifications` and click "Apply Notification Permissions". This will reset all permissions on the notifications table with the correct policies.

Alternatively, you can run the following SQL in the Supabase SQL editor:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can do anything with notifications" ON notifications;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create correct policies
CREATE POLICY "Service role can do anything with notifications"
ON notifications
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE
USING (auth.uid() = user_id);
```

## Environment Variables

Make sure these environment variables are set:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=your-site-url
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## Local Storage

The notification system uses local storage for:

1. **Pending Notifications**: Failed notifications waiting to be retried
2. **Local Notifications**: Fallback when server is unreachable
3. **User ID Cache**: For performance optimization

To clear this data, use:

```javascript
localStorage.removeItem('pending_notifications');
localStorage.removeItem('local_notifications');
localStorage.removeItem('currentUserId');
```
