-- Add Security Policies and Triggers to DevHub Tables
-- Run this AFTER the basic tables have been created
-- Run this in your Supabase SQL Editor

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Also create initial presence record
  INSERT INTO public.user_presence (user_id, status)
  VALUES (NEW.id, 'offline');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for users table
CREATE POLICY "users_can_view_own_profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Basic RLS policies for workspaces table
CREATE POLICY "users_can_create_workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "users_can_view_own_workspaces" ON public.workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "users_can_update_own_workspaces" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "users_can_delete_own_workspaces" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Basic RLS policies for workspace_members table
CREATE POLICY "users_can_view_own_memberships" ON public.workspace_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_memberships" ON public.workspace_members
  FOR UPDATE USING (user_id = auth.uid());

-- Basic RLS policies for workspace_chats table
CREATE POLICY "users_can_view_own_chats" ON public.workspace_chats
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "users_can_send_chats" ON public.workspace_chats
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Basic RLS policies for user_presence table
CREATE POLICY "users_can_view_own_presence" ON public.user_presence
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_presence" ON public.user_presence
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_presence" ON public.user_presence
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_email ON public.workspace_members(user_email);
CREATE INDEX IF NOT EXISTS idx_workspace_chats_workspace_id ON public.workspace_chats(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_chats_sender_id ON public.workspace_chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_workspace_chats_recipient_id ON public.workspace_chats(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON public.user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON public.user_presence(last_seen);
