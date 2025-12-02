-- FIX SHARED WORKSPACE ACCESS
-- This fixes the issue where invited users can't see workspaces they've been invited to
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Drop existing problematic policies
-- ============================================

DROP POLICY IF EXISTS "workspaces_select_own" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;

-- ============================================
-- STEP 2: Create comprehensive workspace access policy
-- ============================================

-- This policy allows users to see workspaces they own OR are members of (by user_id OR user_email)
CREATE POLICY "workspaces_select_comprehensive" ON public.workspaces
  FOR SELECT USING (
    -- User owns the workspace
    owner_id = auth.uid() 
    OR 
    -- User is a member by user_id (accepted invitations)
    EXISTS (
      SELECT 1 FROM public.workspace_members 
      WHERE workspace_id = public.workspaces.id 
        AND user_id = auth.uid()
        AND status IN ('pending', 'active', 'accepted')
    )
    OR
    -- User is a member by user_email (pending invitations)
    EXISTS (
      SELECT 1 FROM public.workspace_members 
      WHERE workspace_id = public.workspaces.id 
        AND user_email = auth.email()
        AND status IN ('pending', 'active', 'accepted')
    )
  );

-- ============================================
-- STEP 3: Create comprehensive workspace_members access policy
-- ============================================

-- This policy allows users to see memberships they're part of OR workspaces they own
CREATE POLICY "workspace_members_select_comprehensive" ON public.workspace_members
  FOR SELECT USING (
    -- User is the member (by user_id or user_email)
    user_id = auth.uid() 
    OR user_email = auth.email()
    OR
    -- User owns the workspace
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR
    -- User is a member of the workspace (can see other members)
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_members.workspace_id 
        AND (
          wm.user_id = auth.uid() 
          OR (wm.user_email = auth.email() AND wm.status IN ('pending', 'active', 'accepted'))
        )
    )
  );

-- ============================================
-- STEP 4: Update the workspace operations function
-- ============================================

-- Create a function to get all accessible workspaces for a user
CREATE OR REPLACE FUNCTION get_user_accessible_workspaces()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  membership_status TEXT,
  membership_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT 
    w.id,
    w.name,
    w.description,
    w.owner_id,
    w.created_at,
    w.updated_at,
    COALESCE(wm.status, 'owner') as membership_status,
    COALESCE(wm.role, 'owner') as membership_role
  FROM public.workspaces w
  LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
    AND (wm.user_id = auth.uid() OR wm.user_email = auth.email())
  WHERE w.owner_id = auth.uid()  -- Owned workspaces
    OR wm.workspace_id IS NOT NULL;  -- Shared workspaces
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: Create a function to get pending invitations
-- ============================================

CREATE OR REPLACE FUNCTION get_user_pending_invitations()
RETURNS TABLE (
  workspace_id UUID,
  workspace_name TEXT,
  inviter_email TEXT,
  inviter_name TEXT,
  role TEXT,
  invited_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wm.workspace_id,
    w.name as workspace_name,
    u.email as inviter_email,
    u.full_name as inviter_name,
    wm.role,
    wm.invited_at
  FROM public.workspace_members wm
  JOIN public.workspaces w ON w.id = wm.workspace_id
  LEFT JOIN public.users u ON u.id = wm.invited_by
  WHERE (wm.user_id = auth.uid() OR wm.user_email = auth.email())
    AND wm.status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 6: Verify the fix
-- ============================================

-- Test query to verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('workspaces', 'workspace_members') 
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ SHARED WORKSPACE ACCESS FIXED! Users can now see workspaces they are invited to.' as status;
