-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_enabled BOOLEAN DEFAULT FALSE,
  email_address TEXT,
  webhook_enabled BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  notify_on_down BOOLEAN DEFAULT TRUE,
  notify_on_up BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  webhook_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_logs_project_id ON notification_logs(project_id);

-- Create index on created_at for faster date filtering
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
