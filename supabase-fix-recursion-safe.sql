-- Safe Fix for Infinite Recursion - Checks table structure first
-- Run this in your Supabase SQL Editor

-- First, let's see what columns actually exist in your workspace_members table
-- Run this query first to verify your table structure:
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

-- Policy 1: Users can view their own memberships (using email)
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    user_email = auth.email()
  );

-- Policy 2: Workspace owners can manage members (all operations)
CREATE POLICY "workspace_owners_manage_members" ON public.workspace_members
  FOR ALL USING (
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

-- Simple workspace policies
CREATE POLICY "workspace_owners_all_access" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid());
