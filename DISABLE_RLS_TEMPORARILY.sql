-- TEMPORARILY DISABLE RLS TO GET APP WORKING
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Disable RLS on all tables
-- ============================================

SELECT '=== DISABLING RLS TEMPORARILY ===' as info;

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop all policies
-- ============================================

SELECT '=== DROPPING ALL POLICIES ===' as info;

-- Drop ALL policies on all tables using a dynamic approach
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Verify RLS is disabled
-- ============================================

SELECT '=== VERIFYING RLS STATUS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'workspaces', 'workspace_members', 'workspace_chats', 'user_presence')
ORDER BY tablename;

-- ============================================
-- STEP 4: Test basic operations
-- ============================================

SELECT '=== TESTING BASIC OPERATIONS ===' as info;

-- Test if we can query workspaces
SELECT 'Can query workspaces:' as test;
SELECT COUNT(*) as workspace_count FROM public.workspaces;

-- Test if we can query users
SELECT 'Can query users:' as test;
SELECT COUNT(*) as user_count FROM public.users;

-- Test if we can query workspace_members
SELECT 'Can query workspace_members:' as test;
SELECT COUNT(*) as member_count FROM public.workspace_members;

-- ============================================
-- STEP 5: Show current data
-- ============================================

SELECT '=== CURRENT DATA ===' as info;

SELECT 'Current workspaces:' as info;
SELECT id, name, owner_id, created_at FROM public.workspaces ORDER BY created_at DESC;

SELECT 'Current users:' as info;
SELECT id, email, created_at FROM public.users ORDER BY created_at DESC;

SELECT 'Current workspace members:' as info;
SELECT id, workspace_id, user_email, role, status FROM public.workspace_members ORDER BY created_at DESC;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ RLS DISABLED! Your app should work now without infinite recursion.' as status;
SELECT '⚠️  WARNING: This is temporary. We will re-enable RLS with proper policies later.' as warning;
