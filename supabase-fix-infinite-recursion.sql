-- Fix Infinite Recursion in workspace_members policies
-- Run this in your Supabase SQL Editor

-- First, drop ALL existing policies on workspace_members to start clean
DROP POLICY IF EXISTS "users_can_view_memberships_by_email" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_owners_can_invite_members" ON public.workspace_members;
DROP POLICY IF EXISTS "users_can_view_own_memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_owners_can_manage_members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_basic" ON public.workspace_members;

-- Create simple, non-recursive policies for workspace_members
-- Policy 1: Users can view memberships where they are the member (by email only)
-- Note: Based on your actual table structure, workspace_members only has user_email, not user_id
CREATE POLICY "view_own_memberships" ON public.workspace_members
  FOR SELECT USING (
    user_email = auth.email()
  );

-- Policy 2: Workspace owners can view all members in their workspaces
CREATE POLICY "owners_view_workspace_members" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Policy 3: Workspace owners can insert new members
CREATE POLICY "owners_invite_members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Policy 4: Workspace owners can update member records
CREATE POLICY "owners_update_members" ON public.workspace_members
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Policy 5: Workspace owners can delete members
CREATE POLICY "owners_delete_members" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Also ensure workspaces policies are clean and simple
DROP POLICY IF EXISTS "users_can_view_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_create_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_update_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_delete_own_workspaces" ON public.workspaces;

-- Simple workspace policies
CREATE POLICY "view_own_workspaces" ON public.workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "create_workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "update_own_workspaces" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "delete_own_workspaces" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());
