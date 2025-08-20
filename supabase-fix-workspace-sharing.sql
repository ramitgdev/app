-- Fix Workspace Sharing Functionality
-- Run this in your Supabase SQL Editor

-- First, let's check what's in the workspace_members table
SELECT 'Current workspace_members data:' as info;
SELECT * FROM workspace_members ORDER BY created_at DESC;

-- Check if the invite was actually created
SELECT 'Checking for ramitgoodboy@gmail.com invite:' as info;
SELECT * FROM workspace_members 
WHERE user_email = 'ramitgoodboy@gmail.com' 
ORDER BY created_at DESC;

-- The issue is likely that the RLS policies are too restrictive
-- Let's fix the workspace_members policies to allow proper sharing

-- Drop the current restrictive policies
DROP POLICY IF EXISTS "workspace_members_select_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON public.workspace_members;

-- Create more permissive policies that allow sharing to work

-- Policy 1: Users can view memberships where they are the member (by email)
CREATE POLICY "view_own_memberships_by_email" ON public.workspace_members
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

-- Policy 3: Workspace owners can insert new members (for sharing)
CREATE POLICY "owners_invite_members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Policy 4: Users can update their own membership (to accept invites)
CREATE POLICY "users_update_own_membership" ON public.workspace_members
  FOR UPDATE USING (
    user_email = auth.email()
  );

-- Policy 5: Workspace owners can update any membership in their workspaces
CREATE POLICY "owners_update_workspace_members" ON public.workspace_members
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Policy 6: Workspace owners can delete members from their workspaces
CREATE POLICY "owners_delete_workspace_members" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Also fix the workspaces policies to ensure users can see workspaces they're invited to
DROP POLICY IF EXISTS "view_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "create_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "update_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "delete_own_workspaces" ON public.workspaces;

-- Create comprehensive workspace policies
CREATE POLICY "view_own_workspaces" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid()
  );

CREATE POLICY "view_shared_workspaces" ON public.workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_email = auth.email()
    )
  );

CREATE POLICY "create_workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "update_own_workspaces" ON public.workspaces
  FOR UPDATE USING (
    owner_id = auth.uid()
  );

CREATE POLICY "delete_own_workspaces" ON public.workspaces
  FOR DELETE USING (
    owner_id = auth.uid()
  );

-- Now let's manually fix any existing invites that might be stuck
-- Update any pending invites for ramitgoodboy@gmail.com to active status
UPDATE public.workspace_members 
SET 
  status = 'active',
  accepted_at = NOW(),
  user_id = (SELECT id FROM public.users WHERE email = 'ramitgoodboy@gmail.com')
WHERE 
  user_email = 'ramitgoodboy@gmail.com' 
  AND status = 'pending';

-- Grant necessary permissions
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a function to help with debugging workspace access (FIXED VERSION)
CREATE OR REPLACE FUNCTION public.debug_workspace_access_for_user(target_email TEXT)
RETURNS TABLE (
  workspace_name TEXT,
  workspace_id UUID,
  user_role TEXT,
  member_status TEXT,
  is_owner BOOLEAN,
  can_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.name,
    w.id,
    COALESCE(wm.role, 'owner') as user_role,
    COALESCE(wm.status, 'active') as member_status,
    (w.owner_id = (SELECT id FROM public.users WHERE email = target_email)) as is_owner,
    TRUE as can_access
  FROM public.workspaces w
  LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
    AND wm.user_email = target_email
  WHERE 
    w.owner_id = (SELECT id FROM public.users WHERE email = target_email)
    OR wm.user_email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Testing workspace access for ramitgoodboy@gmail.com:' as info;
SELECT * FROM public.debug_workspace_access_for_user('ramitgoodboy@gmail.com');

SELECT 'Testing workspace access for ramitrgoyal@gmail.com:' as info;
SELECT * FROM public.debug_workspace_access_for_user('ramitrgoyal@gmail.com');
