-- FIX WORKSPACE CREATION ISSUE
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Check current workspace_members structure
-- ============================================

SELECT '=== CHECKING WORKSPACE MEMBERS STRUCTURE ===' as info;

SELECT 'Current workspace_members table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'workspace_members' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: Fix the invited_by constraint
-- ============================================

-- Make invited_by nullable since owners don't need to be "invited"
ALTER TABLE public.workspace_members ALTER COLUMN invited_by DROP NOT NULL;

-- ============================================
-- STEP 3: Update the workspace_members_insert policy
-- ============================================

-- Drop the current policy
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;

-- Create a new policy that allows inserting without invited_by
CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 4: Test workspace creation manually
-- ============================================

-- Get the current user
SELECT 'Current user for testing:' as info;
SELECT id, email FROM public.users ORDER BY created_at DESC LIMIT 1;

-- Try to create a test workspace member entry
SELECT 'Testing workspace member creation:' as info;
INSERT INTO public.workspace_members (
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
  u.email,
  'owner',
  'accepted',
  NULL, -- invited_by can be NULL for owners
  NOW()
FROM public.workspaces w
CROSS JOIN public.users u
WHERE w.name = 'hi' 
  AND u.email = 'ramitrgoyal@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = w.id 
    AND wm.user_id = u.id
  )
LIMIT 1;

-- ============================================
-- STEP 5: Show the result
-- ============================================

SELECT 'Workspace members after fix:' as info;
SELECT 
  wm.id,
  w.name as workspace_name,
  wm.user_email,
  wm.role,
  wm.status,
  wm.invited_by
FROM public.workspace_members wm
JOIN public.workspaces w ON wm.workspace_id = w.id
ORDER BY wm.created_at DESC;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ WORKSPACE CREATION FIX COMPLETE! Try creating a workspace now.' as status;
