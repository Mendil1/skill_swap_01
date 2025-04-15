-- Add category column to skills table
ALTER TABLE skills ADD COLUMN category VARCHAR(100);

-- Update existing skills to have a default category (optional)
-- UPDATE skills SET category = 'Uncategorized' WHERE category IS NULL;
