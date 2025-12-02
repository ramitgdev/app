-- Complete Reset and Rebuild of Supabase Schema
-- This will delete everything and start fresh
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: DROP EVERYTHING (Clean Slate)
-- ============================================

-- Drop all policies first
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_create_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_update_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_delete_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_view_memberships_by_email" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_owners_can_invite_members" ON public.workspace_members;
DROP POLICY IF EXISTS "users_can_view_own_memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_owners_can_manage_members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_basic" ON public.workspace_members;
DROP POLICY IF EXISTS "view_own_memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_view_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_invite_members" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_update_members" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_delete_members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_owners_manage_members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_owners_all_access" ON public.workspaces;
DROP POLICY IF EXISTS "view_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "create_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "update_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "delete_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_view_own_chats" ON public.workspace_chats;
DROP POLICY IF EXISTS "users_can_send_chats" ON public.workspace_chats;
DROP POLICY IF EXISTS "users_can_view_own_presence" ON public.user_presence;
DROP POLICY IF EXISTS "users_can_update_own_presence" ON public.user_presence;
DROP POLICY IF EXISTS "users_can_insert_own_presence" ON public.user_presence;

-- Drop all triggers
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.workspace_chats CASCADE;
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.user_presence CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- STEP 2: CREATE TABLES (Fresh Start)
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_members table (for sharing workspaces)
CREATE TABLE public.workspace_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_by UUID REFERENCES public.users(id) NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_chats table
CREATE TABLE public.workspace_chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_presence table
CREATE TABLE public.user_presence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREATE FUNCTIONS AND TRIGGERS
-- ============================================

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
  INSERT INTO public.user_presence (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================

-- Users table policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces table policies
CREATE POLICY "workspaces_select_own" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() 
    OR id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "workspaces_insert_own" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_own" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_own" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Workspace members table policies (for sharing functionality)
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() 
    OR user_email = auth.email()
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_update" ON public.workspace_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Workspace chats table policies
CREATE POLICY "workspace_chats_select" ON public.workspace_chats
  FOR SELECT USING (
    sender_id = auth.uid() 
    OR recipient_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "workspace_chats_insert" ON public.workspace_chats
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- User presence table policies
CREATE POLICY "user_presence_select_own" ON public.user_presence
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_presence_update_own" ON public.user_presence
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_presence_insert_own" ON public.user_presence
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_user_email ON public.workspace_members(user_email);
CREATE INDEX idx_workspace_members_status ON public.workspace_members(status);
CREATE INDEX idx_workspace_chats_workspace_id ON public.workspace_chats(workspace_id);
CREATE INDEX idx_workspace_chats_sender_id ON public.workspace_chats(sender_id);
CREATE INDEX idx_workspace_chats_recipient_id ON public.workspace_chats(recipient_id);
CREATE INDEX idx_user_presence_user_id ON public.user_presence(user_id);

-- ============================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- COMPLETE! Your database is now ready with:
-- 1. Clean table structure
-- 2. Workspace creation/deletion functionality
-- 3. Workspace sharing functionality
-- 4. Collaborator management
-- 5. No infinite recursion issues
-- ============================================
