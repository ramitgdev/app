-- Fix for Workspace Sharing RLS Policy Issues
-- Run this in your Supabase SQL Editor to fix the workspace sharing problem

-- First, let's check the current state
SELECT 'Current workspace_members policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'workspace_members' AND schemaname = 'public';

-- Drop all existing policies on workspace_members to start fresh
DROP POLICY IF EXISTS "Users can view workspace members for workspaces they belong to" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can invite members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON public.workspace_members;

-- Create a comprehensive SELECT policy that allows users to see members of workspaces they belong to
CREATE POLICY "workspace_members_select_policy" ON public.workspace_members
FOR SELECT USING (
  -- Allow if user is the member being viewed
  user_id = auth.uid() OR
  user_email = (SELECT email FROM public.users WHERE id = auth.uid()) OR
  -- Allow if user is the workspace owner
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  ) OR
  -- Allow if user is a member of the workspace
  EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id 
    AND (wm.user_id = auth.uid() OR wm.user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
  )
);

-- Create a comprehensive INSERT policy that allows workspace owners and members to invite
CREATE POLICY "workspace_members_insert_policy" ON public.workspace_members
FOR INSERT WITH CHECK (
  -- Allow if user is the workspace owner
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
  OR
  -- Allow if user is already a member of the workspace (for collaborative invites)
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_members.workspace_id 
    AND (user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
  )
);

-- Create a comprehensive UPDATE policy
CREATE POLICY "workspace_members_update_policy" ON public.workspace_members
FOR UPDATE USING (
  -- Allow if user is the member being updated
  user_id = auth.uid() OR
  user_email = (SELECT email FROM public.users WHERE id = auth.uid()) OR
  -- Allow if user is the workspace owner
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

-- Create a comprehensive DELETE policy
CREATE POLICY "workspace_members_delete_policy" ON public.workspace_members
FOR DELETE USING (
  -- Allow if user is the member being deleted
  user_id = auth.uid() OR
  user_email = (SELECT email FROM public.users WHERE id = auth.uid()) OR
  -- Allow if user is the workspace owner
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

-- Grant necessary permissions to ensure authenticated users can access the table
GRANT ALL ON public.workspace_members TO authenticated;

-- Also ensure the workspaces table has proper policies
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;
CREATE POLICY "workspaces_select_policy" ON public.workspaces
FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = public.workspaces.id AND 
    (user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
  )
);

-- Ensure users table has proper policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
FOR SELECT USING (
  id = auth.uid() OR
  email = (SELECT email FROM public.users WHERE id = auth.uid())
);

-- Verify the current user context
SELECT 
  'Current user context:' as info,
  auth.uid() as current_user_id,
  (SELECT email FROM public.users WHERE id = auth.uid()) as current_user_email;

-- Test the policies by checking if the current user can see workspace_members
SELECT 
  'Policy test results:' as info,
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid())
  ) as can_view_own_memberships,
  EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE owner_id = auth.uid()
  ) as owns_workspaces;

-- Show final policies
SELECT 'Final workspace_members policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'workspace_members' AND schemaname = 'public';

-- Additional debugging: Check if RLS is enabled and working
SELECT 
  'RLS Status:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('workspace_members', 'workspaces', 'users') 
AND schemaname = 'public';
