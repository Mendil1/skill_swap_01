-- Fix sessions.ts file to use correct table names
-- This file documents the required changes for sessions.ts

-- 1. Replace all "profiles" table references with "users" table
--    and change "id" column to "user_id"

-- 2. Replace all "connections" table references with "connection_requests" table
--    and update column names:
--    - user_id -> sender_id
--    - connected_user_id -> receiver_id

-- 3. Update foreign key references accordingly

-- These changes need to be made in the sessions.ts file manually
