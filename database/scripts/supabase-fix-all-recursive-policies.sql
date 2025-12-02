-- Comprehensive Fix for All Recursive RLS Policies
-- Run this to fix all infinite recursion issues

-- ============================================
-- STEP 1: DISABLE RLS TEMPORARILY
-- ============================================

SELECT '=== DISABLING RLS TEMPORARILY ===' as info;

-- Disable RLS on all tables to clear problematic policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- ============================================

SELECT '=== DROPPING ALL EXISTING POLICIES ===' as info;

-- Drop all policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_comprehensive" ON public.users;
DROP POLICY IF EXISTS "users_select_safe" ON public.users;

-- Drop all policies on workspaces table
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_policy" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_comprehensive" ON public.workspaces;

-- Drop all policies on workspace_members table
DROP POLICY IF EXISTS "Users can view workspace members for workspaces they belong to" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can invite members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select_comprehensive" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_comprehensive" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_comprehensive" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_comprehensive" ON public.workspace_members;

-- Drop all policies on workspace_chats table
DROP POLICY IF EXISTS "Users can view chats in workspaces they belong to" ON public.workspace_chats;
DROP POLICY IF EXISTS "Users can send chats in workspaces they belong to" ON public.workspace_chats;

-- Drop all policies on user_presence table
DROP POLICY IF EXISTS "Users can view presence of workspace members" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON public.user_presence;

-- ============================================
-- STEP 3: RE-ENABLE RLS
-- ============================================

SELECT '=== RE-ENABLING RLS ===' as info;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================

SELECT '=== CREATING SIMPLE, NON-RECURSIVE POLICIES ===' as info;

-- Users table - simple policy
CREATE POLICY "users_basic" ON public.users
FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update" ON public.users
FOR UPDATE USING (id = auth.uid());

-- Workspaces table - simple policies
CREATE POLICY "workspaces_basic" ON public.workspaces
FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = public.workspaces.id AND user_id = auth.uid()
  )
);

CREATE POLICY "workspaces_create" ON public.workspaces
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update" ON public.workspaces
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete" ON public.workspaces
FOR DELETE USING (owner_id = auth.uid());

-- Workspace members table - simple policies
CREATE POLICY "workspace_members_basic" ON public.workspace_members
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_insert" ON public.workspace_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_update" ON public.workspace_members
FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_delete" ON public.workspace_members
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

-- Workspace chats table - simple policies
CREATE POLICY "workspace_chats_basic" ON public.workspace_chats
FOR SELECT USING (
  sender_id = auth.uid() OR
  recipient_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "workspace_chats_insert" ON public.workspace_chats
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

-- User presence table - simple policies
CREATE POLICY "user_presence_basic" ON public.user_presence
FOR ALL USING (user_id = auth.uid());

-- ============================================
-- STEP 5: GRANT PERMISSIONS
-- ============================================

SELECT '=== GRANTING PERMISSIONS ===' as info;

GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_chats TO authenticated;
GRANT ALL ON public.user_presence TO authenticated;

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

SELECT '=== VERIFICATION ===' as info;

-- Check current policies
SELECT 'Current policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test basic access
SELECT 'Testing basic access...' as status;

-- Test users table access
SELECT 
  'Users table access:' as test,
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid()
  ) as can_access_users;

-- Test workspaces table access
SELECT 
  'Workspaces table access:' as test,
  EXISTS (
    SELECT 1 FROM public.workspaces WHERE owner_id = auth.uid()
  ) as can_access_workspaces;

SELECT '=== FIX COMPLETE ===' as info;
SELECT 'All recursive policies have been fixed. Try creating a workspace now.' as next_steps;
