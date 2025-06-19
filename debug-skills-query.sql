-- Test query to check user_skills data structure
-- Run this in your Supabase SQL editor to see what data exists

-- Check if there are any user_skills records
SELECT
  us.user_skill_id,
  us.user_id,
  us.skill_id,
  us.type,
  s.name as skill_name,
  s.description as skill_description,
  s.category as skill_category
FROM user_skills us
LEFT JOIN skills s ON us.skill_id = s.skill_id
LIMIT 10;

-- Check count of skills by type
SELECT
  type,
  COUNT(*) as count
FROM user_skills
GROUP BY type;

-- Check if skills table has data
SELECT COUNT(*) as total_skills FROM skills;

-- Check if user_skills table has data
SELECT COUNT(*) as total_user_skills FROM user_skills;
