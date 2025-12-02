-- Final Workspace Fix - Address All Issues
-- Run this in your Supabase SQL Editor

-- First, let's check the current table structure and constraints
SELECT 'Checking workspace_members table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'workspace_members' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Checking workspace_members constraints:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.workspace_members'::regclass;

-- Let's see what's currently in the tables
SELECT 'Current workspaces:' as info;
SELECT * FROM workspaces;

SELECT 'Current workspace_members:' as info;
SELECT * FROM workspace_members;

-- Fix the check constraint issue first
-- Drop the problematic check constraint
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_status_check;

-- Recreate the constraint with the correct values
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_status_check 
CHECK (status IN ('pending', 'active', 'declined'));

-- Now let's completely disable RLS and start fresh
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

-- Create simple, working policies

-- Workspaces: Users can see workspaces they own OR are members of
CREATE POLICY "workspaces_access" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_email = auth.email()
    )
  );

CREATE POLICY "workspaces_owner_manage" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid());

-- Workspace members: Users can see memberships where they are the member
CREATE POLICY "workspace_members_view_own" ON public.workspace_members
  FOR SELECT USING (user_email = auth.email());

-- Workspace members: Workspace owners can see all members in their workspaces
CREATE POLICY "workspace_members_owner_view" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Workspace members: Workspace owners can add members
CREATE POLICY "workspace_members_owner_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Workspace members: Users can update their own membership
CREATE POLICY "workspace_members_update_own" ON public.workspace_members
  FOR UPDATE USING (user_email = auth.email());

-- Workspace chats: Users can see messages they sent or received
CREATE POLICY "workspace_chats_view" ON public.workspace_chats
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Workspace chats: Users can send messages
CREATE POLICY "workspace_chats_insert" ON public.workspace_chats
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_chats TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Now fix the workspace access for ramitgoodboy@gmail.com
-- First, let's see what workspaces exist
SELECT 'Available workspaces:' as info;
SELECT * FROM workspaces;

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
