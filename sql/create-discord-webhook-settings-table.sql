-- Create Discord webhook settings table
CREATE TABLE IF NOT EXISTS discord_webhook_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT FALSE,
  url TEXT,
  username TEXT DEFAULT 'Bot Keeper',
  avatar_url TEXT,
  content TEXT,
  embed_title TEXT DEFAULT 'Status Update: {project_name}',
  embed_description TEXT DEFAULT '{status_emoji} **{project_name}** is now **{status}**',
  embed_color TEXT DEFAULT '#5865F2',
  embed_thumbnail TEXT,
  embed_image TEXT,
  embed_author_name TEXT,
  embed_author_url TEXT,
  embed_author_icon_url TEXT,
  embed_footer_text TEXT DEFAULT 'Bot Keeper Monitoring',
  embed_footer_icon_url TEXT,
  include_timestamp BOOLEAN DEFAULT TRUE,
  include_uptime BOOLEAN DEFAULT TRUE,
  include_response_time BOOLEAN DEFAULT TRUE,
  include_downtime BOOLEAN DEFAULT TRUE,
  include_buttons BOOLEAN DEFAULT TRUE,
  mention_everyone BOOLEAN DEFAULT FALSE,
  mention_roles TEXT[] DEFAULT '{}',
  mention_users TEXT[] DEFAULT '{}',
  notification_frequency TEXT DEFAULT 'status_change',
  selected_projects TEXT[] DEFAULT '{}',
  notify_on_online BOOLEAN DEFAULT TRUE,
  notify_on_offline BOOLEAN DEFAULT TRUE,
  notify_on_ping BOOLEAN DEFAULT FALSE,
  notify_on_edit BOOLEAN DEFAULT FALSE,
  notify_on_delete BOOLEAN DEFAULT TRUE,
  notify_on_pause BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on enabled field for faster queries
CREATE INDEX IF NOT EXISTS idx_discord_webhook_settings_enabled ON discord_webhook_settings(enabled);

-- Insert default settings if none exist
INSERT INTO discord_webhook_settings (enabled) 
SELECT FALSE 
WHERE NOT EXISTS (SELECT 1 FROM discord_webhook_settings);
