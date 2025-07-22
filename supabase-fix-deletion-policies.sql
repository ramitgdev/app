-- Fix RLS policies to allow workspace deletion
-- Run this in your Supabase SQL Editor

-- Update workspace_members policies to allow workspace owners to delete members
DROP POLICY IF EXISTS "workspace_members_basic" ON public.workspace_members;
DROP POLICY IF EXISTS "users_can_view_memberships_by_email" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_owners_can_invite_members" ON public.workspace_members;

-- Allow users to view their own memberships
CREATE POLICY "users_can_view_own_memberships" ON public.workspace_members
  FOR SELECT USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR user_id = auth.uid()
  );

-- Allow workspace owners to manage all members in their workspaces
CREATE POLICY "workspace_owners_can_manage_members" ON public.workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Allow workspace owners to invite new members
CREATE POLICY "workspace_owners_can_invite_members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );
