-- FINAL FIX FOR INFINITE RECURSION
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
-- STEP 4: Create SIMPLE policies (no recursion)
-- ============================================

-- Users table policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces table policies (SIMPLE - no subqueries)
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
-- STEP 5: Create a function to get shared workspaces
-- ============================================

-- This function will be used by the app to get shared workspaces
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
-- COMPLETE!
-- ============================================

SELECT '✅ RECURSION FIXED! Simple policies applied. Use get_shared_workspaces() function to get workspaces.' as status;
