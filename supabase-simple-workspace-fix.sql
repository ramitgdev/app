-- Simple Workspace Fix - No Recursion
-- Run this in your Supabase SQL Editor

-- First, disable RLS temporarily to clear all problematic policies
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start clean
DROP POLICY IF EXISTS "view_own_memberships_by_email" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_view_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_invite_members" ON public.workspace_members;
DROP POLICY IF EXISTS "users_update_own_membership" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_update_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "owners_delete_workspace_members" ON public.workspace_members;

DROP POLICY IF EXISTS "view_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "view_shared_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "create_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "update_own_workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "delete_own_workspaces" ON public.workspaces;

DROP POLICY IF EXISTS "workspace_chats_select_policy" ON public.workspace_chats;
DROP POLICY IF EXISTS "workspace_chats_insert_policy" ON public.workspace_chats;

-- Re-enable RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Create VERY simple policies that avoid any recursion

-- Workspaces: Users can do everything with workspaces they own
CREATE POLICY "workspaces_owner_all" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid());

-- Workspace members: Simple policies
CREATE POLICY "workspace_members_view_by_email" ON public.workspace_members
  FOR SELECT USING (user_email = auth.email());

CREATE POLICY "workspace_members_owner_all" ON public.workspace_members
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Workspace chats: Simple policies
CREATE POLICY "workspace_chats_participant" ON public.workspace_chats
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "workspace_chats_send" ON public.workspace_chats
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_chats TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Now manually fix the workspace access issue
-- First, let's see what workspaces exist
SELECT 'All workspaces:' as info;
SELECT * FROM workspaces;

SELECT 'All workspace members:' as info;
SELECT * FROM workspace_members;

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
