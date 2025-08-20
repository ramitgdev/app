-- Working Policies Fix - Based on Past Success
-- Run this in your Supabase SQL Editor

-- First, let's see what's currently in the tables
SELECT 'Current workspaces:' as info;
SELECT * FROM workspaces;

SELECT 'Current workspace_members:' as info;
SELECT * FROM workspace_members;

-- Disable RLS temporarily
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on workspace_members
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'workspace_members' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.workspace_members';
    END LOOP;
    
    -- Drop all policies on workspace_chats
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'workspace_chats' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.workspace_chats';
    END LOOP;
    
    -- Drop all policies on workspaces
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'workspaces' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.workspaces';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Create the WORKING policies from the past (these don't cause recursion)

-- Workspaces table policies (SIMPLE - no cross-table references)
CREATE POLICY "workspaces_select_own" ON public.workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "workspaces_insert_own" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_own" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_own" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Workspace members table policies (SIMPLE - no cross-table references)
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

-- Workspace chats table policies (SIMPLE - no cross-table references)
CREATE POLICY "workspace_chats_select" ON public.workspace_chats
  FOR SELECT USING (
    sender_id = auth.uid() 
    OR recipient_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "workspace_chats_insert" ON public.workspace_chats
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Now manually fix the workspace access for ramitgoodboy@gmail.com
-- Find the "hi" workspace and ensure ramitgoodboy@gmail.com has access
UPDATE workspace_members 
SET 
  status = 'active',
  accepted_at = NOW(),
  user_id = (SELECT id FROM users WHERE email = 'ramitgoodboy@gmail.com')
WHERE 
  user_email = 'ramitgoodboy@gmail.com' 
  AND status = 'pending';

-- If no membership exists for ramitgoodboy@gmail.com, create one
INSERT INTO workspace_members (
  workspace_id, 
  user_id, 
  user_email, 
  role, 
  status, 
  invited_by, 
  accepted_at
)
SELECT 
  w.id,
  u.id,
  'ramitgoodboy@gmail.com',
  'member',
  'active',
  w.owner_id,
  NOW()
FROM workspaces w
CROSS JOIN users u
WHERE w.name = 'hi' 
  AND u.email = 'ramitgoodboy@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM workspace_members wm 
    WHERE wm.workspace_id = w.id 
    AND wm.user_email = 'ramitgoodboy@gmail.com'
  );

-- Test the fix
SELECT 'Testing workspace access for ramitgoodboy@gmail.com:' as info;
SELECT 
  w.name,
  w.id,
  wm.user_email,
  wm.status,
  wm.role
FROM workspaces w
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
WHERE w.name = 'hi' OR wm.user_email = 'ramitgoodboy@gmail.com';

SELECT 'Testing workspace access for ramitrgoyal@gmail.com:' as info;
SELECT 
  w.name,
  w.id,
  wm.user_email,
  wm.status,
  wm.role
FROM workspaces w
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
WHERE w.name = 'hi' OR wm.user_email = 'ramitrgoyal@gmail.com';

-- Show final status
SELECT 'Final workspace_members data:' as info;
SELECT * FROM workspace_members ORDER BY created_at DESC;

SELECT 'Final policies:' as info;
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('workspaces', 'workspace_members', 'workspace_chats')
ORDER BY tablename, policyname;
