-- Add icon fields to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS icon_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Set default icon type for existing projects
UPDATE projects 
SET icon_type = 'globe' 
WHERE icon_type IS NULL;
