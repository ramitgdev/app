-- Safe Fix for Infinite Recursion (Non-recursive RLS)
-- Run this in your Supabase SQL Editor

-- Optional: verify columns if needed
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'workspace_members' AND table_schema = 'public';

-- Drop ALL existing policies on workspace_members to start clean
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

-- Simple policies that avoid recursion
-- These use direct auth functions without complex subqueries

-- Policy 1: Users can view their own memberships (using email or user_id when set)
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    user_email = auth.email() OR user_id = auth.uid()
  );

-- Policy 1b: Invited users can update their own membership to accept (and set user_id)
CREATE POLICY "workspace_members_self_update" ON public.workspace_members
  FOR UPDATE USING (
    user_email = auth.email() OR user_id = auth.uid()
  ) WITH CHECK (
    user_email = auth.email() OR user_id = auth.uid()
  );

-- Policy 2: Workspace owners can manage members (all operations)
CREATE POLICY "workspace_owners_manage_members" ON public.workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Clean up workspace policies too
DROP POLICY IF EXISTS "users_can_view_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_create_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_update_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "users_can_delete_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "view_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "create_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "update_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "delete_own_workspaces" ON public.workspaces;

-- Simple workspace policies (split for clarity)
CREATE POLICY "workspace_select_own" ON public.workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "workspace_insert_own" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspace_update_own" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspace_delete_own" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Temporarily allow all authenticated users to SELECT workspaces
-- so the client can filter by memberWorkspaceIds without RLS recursion
DROP POLICY IF EXISTS "workspace_select_any_authenticated" ON public.workspaces;
CREATE POLICY "workspace_select_any_authenticated" ON public.workspaces
  FOR SELECT USING (true);
