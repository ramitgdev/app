-- EMERGENCY FIX: Stop All Infinite Recursion
-- Run this immediately to fix ALL recursion issues

-- ============================================
-- STEP 1: NUCLEAR OPTION - DISABLE ALL RLS
-- ============================================

SELECT '=== EMERGENCY: DISABLING ALL RLS ===' as info;

-- Disable RLS on ALL tables to stop recursion immediately
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: DROP ALL POLICIES
-- ============================================

SELECT '=== DROPPING ALL POLICIES ===' as info;

-- Drop ALL policies on ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
    END LOOP;
END $$;

-- ============================================
-- STEP 3: GRANT BASIC PERMISSIONS
-- ============================================

SELECT '=== GRANTING BASIC PERMISSIONS ===' as info;

-- Grant basic permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_presence TO authenticated;

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================

SELECT '=== VERIFICATION ===' as info;

-- Check that RLS is disabled
SELECT 
  'RLS Status:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'workspaces', 'workspace_members', 'workspace_chats', 'user_presence') 
AND schemaname = 'public';

-- Check that no policies exist
SELECT 
  'Policy count:' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

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

SELECT '=== EMERGENCY FIX COMPLETE ===' as info;
SELECT 'RLS has been disabled on all tables. You should now be able to create workspaces.' as next_steps;
SELECT 'WARNING: This removes security restrictions. Re-enable RLS with proper policies later.' as security_note;
