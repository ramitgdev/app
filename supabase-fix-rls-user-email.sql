-- Fix RLS policies to support user_email lookups
-- This fixes the issue where workspace members with user_id=null but user_email set
-- cannot access workspaces due to RLS policies only checking user_id

-- Get current user email for comparison
CREATE OR REPLACE FUNCTION auth.email() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    (auth.jwt() ->> 'email')
  )
$$ LANGUAGE SQL STABLE;

-- Drop and recreate the workspace RLS policy to include user_email checks
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;

CREATE POLICY "Users can view workspaces they own or are members of" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspaces.id AND (
        user_id = auth.uid() OR 
        (user_email = auth.email() AND status = 'active')
      )
    )
  );

-- Also update workspace_members policy to check user_email
DROP POLICY IF EXISTS "Users can view workspace members for workspaces they belong to" ON public.workspace_members;

CREATE POLICY "Users can view workspace members for workspaces they belong to" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    user_email = auth.email() OR
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_members.workspace_id AND (
        wm.user_id = auth.uid() OR
        (wm.user_email = auth.email() AND wm.status = 'active')
      )
    )
  );

-- Update workspace chats policy to include user_email check
DROP POLICY IF EXISTS "Users can view chats in workspaces they belong to" ON public.workspace_chats;

CREATE POLICY "Users can view chats in workspaces they belong to" ON public.workspace_chats
  FOR SELECT USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspace_chats.workspace_id AND (
        user_id = auth.uid() OR
        (user_email = auth.email() AND status = 'active')
      )
    )
  );

-- Update chat insert policy too
DROP POLICY IF EXISTS "Users can send chats in workspaces they belong to" ON public.workspace_chats;

CREATE POLICY "Users can send chats in workspaces they belong to" ON public.workspace_chats
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspace_chats.workspace_id AND (
        user_id = auth.uid() OR
        (user_email = auth.email() AND status = 'active')
      )
    )
  );