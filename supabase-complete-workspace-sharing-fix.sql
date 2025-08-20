-- Complete Fix for Workspace Sharing Issues
-- Run this in your Supabase SQL Editor to fix all workspace sharing problems

-- ============================================
-- STEP 1: DIAGNOSE CURRENT STATE
-- ============================================

SELECT '=== DIAGNOSING CURRENT STATE ===' as info;

-- Check current policies
SELECT 'Current workspace_members policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'workspace_members' AND schemaname = 'public';

-- Check table structure
SELECT 'workspace_members table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'workspace_members' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check constraints
SELECT 'workspace_members constraints:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.workspace_members'::regclass;

-- Check RLS status
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('workspace_members', 'workspaces', 'users') 
AND schemaname = 'public';

-- ============================================
-- STEP 2: FIX TABLE STRUCTURE
-- ============================================

SELECT '=== FIXING TABLE STRUCTURE ===' as info;

-- Ensure all required columns exist with proper defaults
ALTER TABLE public.workspace_members 
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records that might have NULL invited_at
UPDATE public.workspace_members 
SET invited_at = COALESCE(invited_at, NOW())
WHERE invited_at IS NULL;

-- ============================================
-- STEP 3: FIX RLS POLICIES
-- ============================================

SELECT '=== FIXING RLS POLICIES ===' as info;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view workspace members for workspaces they belong to" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can invite members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_policy" ON public.workspace_members;

-- Create comprehensive SELECT policy
CREATE POLICY "workspace_members_select_comprehensive" ON public.workspace_members
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

-- Create comprehensive INSERT policy
CREATE POLICY "workspace_members_insert_comprehensive" ON public.workspace_members
FOR INSERT WITH CHECK (
  -- Allow if user is the workspace owner
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  )
  OR
  -- Allow if user is already a member of the workspace
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_members.workspace_id 
    AND (user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
  )
);

-- Create comprehensive UPDATE policy
CREATE POLICY "workspace_members_update_comprehensive" ON public.workspace_members
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

-- Create comprehensive DELETE policy
CREATE POLICY "workspace_members_delete_comprehensive" ON public.workspace_members
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

-- ============================================
-- STEP 4: FIX RELATED TABLE POLICIES
-- ============================================

SELECT '=== FIXING RELATED TABLE POLICIES ===' as info;

-- Fix workspaces table policies
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_policy" ON public.workspaces;

CREATE POLICY "workspaces_select_comprehensive" ON public.workspaces
FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = public.workspaces.id AND 
    (user_id = auth.uid() OR user_email = (SELECT email FROM public.users WHERE id = auth.uid()))
  )
);

-- Fix users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;

CREATE POLICY "users_select_comprehensive" ON public.users
FOR SELECT USING (
  id = auth.uid() OR
  email = (SELECT email FROM public.users WHERE id = auth.uid())
);

-- ============================================
-- STEP 5: GRANT PERMISSIONS
-- ============================================

SELECT '=== GRANTING PERMISSIONS ===' as info;

-- Grant necessary permissions
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

SELECT '=== VERIFICATION ===' as info;

-- Verify the current user context
SELECT 
  'Current user context:' as info,
  auth.uid() as current_user_id,
  (SELECT email FROM public.users WHERE id = auth.uid()) as current_user_email;

-- Test the policies
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

-- Show final table structure
SELECT 'Final workspace_members structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'workspace_members' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== FIX COMPLETE ===' as info;
SELECT 'Please test workspace sharing now. If issues persist, check the console for specific error messages.' as next_steps;
