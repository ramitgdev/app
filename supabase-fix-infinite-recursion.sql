-- Fix Infinite Recursion in RLS Policies
-- Run this in your Supabase SQL Editor

-- First, disable RLS temporarily to clear the problematic policies
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view members of workspaces they belong to" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can insert members into workspaces they own" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view chats in workspaces they belong to" ON public.workspace_chats;
DROP POLICY IF EXISTS "Users can send chats in workspaces they belong to" ON public.workspace_chats;

-- Re-enable RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for workspace_members
CREATE POLICY "workspace_members_select_policy" ON public.workspace_members
  FOR SELECT USING (
    -- Users can view members if they are the owner of the workspace
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      WHERE w.id = public.workspace_members.workspace_id 
      AND w.owner_id = auth.uid()
    )
    OR
    -- Users can view members if they are a member themselves
    public.workspace_members.user_id = auth.uid()
    OR
    -- Users can view members if they are the workspace owner
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      WHERE w.id = public.workspace_members.workspace_id 
      AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert_policy" ON public.workspace_members
  FOR INSERT WITH CHECK (
    -- Only workspace owners can add members
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      WHERE w.id = public.workspace_members.workspace_id 
      AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_update_policy" ON public.workspace_members
  FOR UPDATE USING (
    -- Users can update their own membership
    public.workspace_members.user_id = auth.uid()
    OR
    -- Workspace owners can update any membership
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      WHERE w.id = public.workspace_members.workspace_id 
      AND w.owner_id = auth.uid()
    )
  );

-- Create simple, non-recursive policies for workspace_chats
CREATE POLICY "workspace_chats_select_policy" ON public.workspace_chats
  FOR SELECT USING (
    -- Users can view messages they sent or received
    public.workspace_chats.sender_id = auth.uid()
    OR public.workspace_chats.recipient_id = auth.uid()
    OR
    -- Users can view messages in workspaces they own
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      WHERE w.id = public.workspace_chats.workspace_id 
      AND w.owner_id = auth.uid()
    )
    OR
    -- Users can view messages in workspaces they are members of
    EXISTS (
      SELECT 1 FROM public.workspace_members wm 
      WHERE wm.workspace_id = public.workspace_chats.workspace_id 
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
    )
  );

CREATE POLICY "workspace_chats_insert_policy" ON public.workspace_chats
  FOR INSERT WITH CHECK (
    -- Users can only send messages as themselves
    public.workspace_chats.sender_id = auth.uid()
    AND
    (
      -- Users can send messages in workspaces they own
      EXISTS (
        SELECT 1 FROM public.workspaces w 
        WHERE w.id = public.workspace_chats.workspace_id 
        AND w.owner_id = auth.uid()
      )
      OR
      -- Users can send messages in workspaces they are members of
      EXISTS (
        SELECT 1 FROM public.workspace_members wm 
        WHERE wm.workspace_id = public.workspace_chats.workspace_id 
        AND wm.user_id = auth.uid()
        AND wm.status = 'active'
      )
    )
  );

-- Grant necessary permissions
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_chats TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a simple function to check workspace access
CREATE OR REPLACE FUNCTION public.check_workspace_access(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspaces w 
    WHERE w.id = workspace_uuid AND w.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = workspace_uuid 
    AND wm.user_id = auth.uid()
    AND wm.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
