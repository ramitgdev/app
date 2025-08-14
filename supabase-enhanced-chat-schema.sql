-- Enhanced Chat System Database Schema
-- Run this in your Supabase SQL Editor to add chat functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENHANCED CHAT TABLES
-- ============================================

-- Create workspace_group_chats table for group messaging
CREATE TABLE IF NOT EXISTS public.workspace_group_chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'code', 'image')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance existing workspace_chats table
ALTER TABLE public.workspace_chats 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'code', 'image')),
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Create slack_integrations table
CREATE TABLE IF NOT EXISTS public.slack_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  slack_workspace_id TEXT NOT NULL,
  slack_workspace_name TEXT,
  access_token TEXT NOT NULL,
  bot_user_id TEXT,
  connected_by UUID REFERENCES public.users(id) NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create slack_channels table for channel mapping
CREATE TABLE IF NOT EXISTS public.slack_channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slack_integration_id UUID REFERENCES public.slack_integrations(id) ON DELETE CASCADE NOT NULL,
  slack_channel_id TEXT NOT NULL,
  slack_channel_name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_notifications table
CREATE TABLE IF NOT EXISTS public.chat_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message_preview TEXT,
  notification_type TEXT DEFAULT 'message' CHECK (notification_type IN ('message', 'mention', 'file_shared')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for workspace_group_chats
CREATE INDEX IF NOT EXISTS idx_workspace_group_chats_workspace_id ON public.workspace_group_chats(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_group_chats_created_at ON public.workspace_group_chats(created_at);
CREATE INDEX IF NOT EXISTS idx_workspace_group_chats_sender_id ON public.workspace_group_chats(sender_id);

-- Indexes for enhanced workspace_chats
CREATE INDEX IF NOT EXISTS idx_workspace_chats_workspace_id ON public.workspace_chats(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_chats_created_at ON public.workspace_chats(created_at);
CREATE INDEX IF NOT EXISTS idx_workspace_chats_sender_recipient ON public.workspace_chats(sender_id, recipient_id);

-- Indexes for slack_integrations
CREATE INDEX IF NOT EXISTS idx_slack_integrations_workspace_id ON public.slack_integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_slack_integrations_slack_workspace_id ON public.slack_integrations(slack_workspace_id);

-- Indexes for chat_notifications
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON public.chat_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_is_read ON public.chat_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_created_at ON public.chat_notifications(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE public.workspace_group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_notifications ENABLE ROW LEVEL SECURITY;

-- Workspace group chats policies
CREATE POLICY "Users can view group chats in workspaces they belong to" ON public.workspace_group_chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspace_group_chats.workspace_id 
      AND (user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Users can send group chats in workspaces they belong to" ON public.workspace_group_chats
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspace_group_chats.workspace_id 
      AND (user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
    )
  );

-- Slack integrations policies
CREATE POLICY "Workspace owners can manage slack integrations" ON public.slack_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can view slack integrations" ON public.slack_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.slack_integrations.workspace_id 
      AND (user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
    )
  );

-- Slack channels policies
CREATE POLICY "Users can view slack channels for their workspace integrations" ON public.slack_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.slack_integrations si
      JOIN public.workspace_members wm ON si.workspace_id = wm.workspace_id
      WHERE si.id = public.slack_channels.slack_integration_id
      AND (wm.user_id = auth.uid() OR wm.user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
    )
  );

-- Chat notifications policies
CREATE POLICY "Users can view their own notifications" ON public.chat_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.chat_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users" ON public.chat_notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to create notification when new message is sent
CREATE OR REPLACE FUNCTION public.create_chat_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- For direct messages
  IF TG_TABLE_NAME = 'workspace_chats' AND NEW.recipient_id IS NOT NULL THEN
    INSERT INTO public.chat_notifications (user_id, workspace_id, sender_id, message_preview, notification_type)
    VALUES (
      NEW.recipient_id,
      NEW.workspace_id,
      NEW.sender_id,
      LEFT(NEW.message, 100),
      'message'
    );
  END IF;
  
  -- For group messages
  IF TG_TABLE_NAME = 'workspace_group_chats' THEN
    INSERT INTO public.chat_notifications (user_id, workspace_id, sender_id, message_preview, notification_type)
    SELECT 
      wm.user_id,
      NEW.workspace_id,
      NEW.sender_id,
      LEFT(NEW.message, 100),
      'message'
    FROM public.workspace_members wm
    WHERE wm.workspace_id = NEW.workspace_id
    AND wm.user_id IS NOT NULL
    AND wm.user_id != NEW.sender_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for notifications
CREATE TRIGGER trigger_create_chat_notification_direct
  AFTER INSERT ON public.workspace_chats
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_notification();

CREATE TRIGGER trigger_create_chat_notification_group
  AFTER INSERT ON public.workspace_group_chats
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_notification();

-- Function to update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, last_seen, status)
  VALUES (auth.uid(), NOW(), 'online')
  ON CONFLICT (user_id)
  DO UPDATE SET 
    last_seen = NOW(),
    status = 'online',
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE BUCKET FOR CHAT FILES
-- ============================================

-- Create storage bucket for chat files (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('workspace-files', 'workspace-files', true);

-- Storage policies for chat files
CREATE POLICY "Users can upload files to their workspace" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workspace-files' AND
    (storage.foldername(name))[1] = 'workspace-' || (
      SELECT workspace_id::text FROM public.workspace_members 
      WHERE user_id = auth.uid() 
      AND workspace_id::text = (storage.foldername(name))[1]
      LIMIT 1
    )
  );

CREATE POLICY "Users can view files in their workspace" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'workspace-files' AND
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.user_id = auth.uid()
      AND wm.workspace_id::text = (storage.foldername(name))[1]
    )
  );

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================

-- Insert sample group message (uncomment if needed)
-- INSERT INTO public.workspace_group_chats (workspace_id, sender_id, message, message_type)
-- VALUES (
--   'your-workspace-id-here',
--   'your-user-id-here',
--   'Welcome to the workspace! 👋',
--   'text'
-- );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created successfully
SELECT 
  table_name,
  CASE WHEN table_name IN (
    'workspace_group_chats',
    'slack_integrations', 
    'slack_channels',
    'chat_notifications'
  ) THEN '✅ Created' ELSE '❌ Missing' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'workspace_group_chats',
  'slack_integrations', 
  'slack_channels',
  'chat_notifications'
);

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'workspace_group_chats',
  'slack_integrations', 
  'slack_channels',
  'chat_notifications'
);
