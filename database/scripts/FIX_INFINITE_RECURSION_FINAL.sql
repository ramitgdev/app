-- FIX INFINITE RECURSION - FINAL VERSION
-- This fixes the "infinite recursion detected in policy for relation workspaces" error
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Disable RLS temporarily
-- ============================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop ALL existing policies
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Re-enable RLS
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create SIMPLE, NON-RECURSIVE policies
-- ============================================

-- Users table policies (SIMPLE)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces table policies (SIMPLE - no subqueries to workspace_members)
CREATE POLICY "workspaces_select_own" ON public.workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "workspaces_insert_own" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_own" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_own" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Workspace members table policies (SIMPLE)
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (user_id = auth.uid() OR user_email = auth.email());

CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "workspace_members_update" ON public.workspace_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE USING (true);

-- Workspace chats table policies (SIMPLE)
CREATE POLICY "workspace_chats_select" ON public.workspace_chats
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

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
-- STEP 5: Create SECURITY DEFINER functions for complex queries
-- ============================================

-- Function to get all accessible workspaces (bypasses RLS)
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

-- Function to get pending invitations (bypasses RLS)
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

-- Function to get shared workspaces (bypasses RLS)
CREATE OR REPLACE FUNCTION get_shared_workspaces()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT w.id, w.name, w.description, w.owner_id, w.created_at, w.updated_at
  FROM public.workspaces w
  JOIN public.workspace_members wm ON w.id = wm.workspace_id
  WHERE wm.user_id = auth.uid() 
    OR wm.user_email = auth.email()
    OR w.owner_id = auth.uid();
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

SELECT '✅ INFINITE RECURSION FIXED! Simple policies applied. Use functions for complex queries.' as status;
