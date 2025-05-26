-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'unknown',
  uptime VARCHAR(10) DEFAULT '0%',
  response_time INTEGER DEFAULT 0,
  last_pinged TIMESTAMP WITH TIME ZONE,
  icon_type VARCHAR(50),
  icon_url TEXT,
  discord_webhook_enabled BOOLEAN DEFAULT false,
  discord_webhook_url TEXT,
  discord_webhook_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ping_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS ping_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  response_time INTEGER,
  error_message TEXT,
  pinged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default user if none exists
INSERT INTO users (id, email, name)
SELECT 'default-user-id'::uuid, 'default@example.com', 'Default User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'default@example.com');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_enabled ON projects(enabled);
CREATE INDEX IF NOT EXISTS idx_ping_history_project_id ON ping_history(project_id);
CREATE INDEX IF NOT EXISTS idx_ping_history_pinged_at ON ping_history(pinged_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_project_id ON notification_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
