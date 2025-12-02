-- ORIGINAL WORKING SCRIPT - This was the last known working state
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
-- STEP 2: Drop all policies
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
-- STEP 4: Create the original working policies
-- ============================================

-- Users table policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces table policies (this is the key one that was working)
CREATE POLICY "workspaces_select_own" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() 
    OR id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "workspaces_insert_own" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_own" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_own" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Workspace members table policies (this was working for sharing)
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() 
    OR user_email = auth.email()
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_update" ON public.workspace_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Workspace chats table policies
CREATE POLICY "workspace_chats_select" ON public.workspace_chats
  FOR SELECT USING (
    sender_id = auth.uid() 
    OR recipient_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

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
-- STEP 5: Fix the workspace_members table structure
-- ============================================

-- Make invited_by nullable
ALTER TABLE public.workspace_members ALTER COLUMN invited_by DROP NOT NULL;

-- Fix the role constraint to be more permissive
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_role_check;
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_role_check 
CHECK (role IS NULL OR role IN ('owner', 'collaborator', 'member', 'admin', 'user'));

-- ============================================
-- STEP 6: Update existing data to work properly
-- ============================================

-- Update all pending invites for ramitgoodboy@gmail.com to accepted
UPDATE public.workspace_members 
SET 
  status = 'accepted',
  accepted_at = NOW()
WHERE user_email = 'ramitgoodboy@gmail.com' 
  AND status = 'pending';

-- Ensure ramitgoodboy@gmail.com has user_id set
UPDATE public.workspace_members 
SET user_id = (SELECT id FROM public.users WHERE email = 'ramitgoodboy@gmail.com')
WHERE user_email = 'ramitgoodboy@gmail.com' 
  AND user_id IS NULL;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ ORIGINAL WORKING SCRIPT APPLIED! This should work like it did before.' as status;
