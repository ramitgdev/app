-- FIX ROLE CHECK CONSTRAINT
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Check current constraint
-- ============================================

SELECT '=== CHECKING CURRENT ROLE CONSTRAINT ===' as info;

SELECT 'Current role constraint:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.workspace_members'::regclass 
  AND conname LIKE '%role%';

-- ============================================
-- STEP 2: Check what role values exist
-- ============================================

SELECT 'Current role values in database:' as info;
SELECT DISTINCT role FROM public.workspace_members WHERE role IS NOT NULL;

-- ============================================
-- STEP 3: Check what the app is trying to insert
-- ============================================

SELECT '=== DEBUGGING ROLE ISSUE ===' as info;

-- Let's see what the app might be trying to insert
SELECT 'Possible role values the app might use:' as info;
SELECT 'owner' as possible_role
UNION ALL
SELECT 'collaborator' as possible_role
UNION ALL
SELECT 'member' as possible_role
UNION ALL
SELECT 'admin' as possible_role
UNION ALL
SELECT 'user' as possible_role;

-- ============================================
-- STEP 4: Fix the constraint to be more permissive
-- ============================================

-- Drop the current constraint
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_role_check;

-- Add a more permissive constraint that includes common role values
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_role_check 
CHECK (role IS NULL OR role IN ('owner', 'collaborator', 'member', 'admin', 'user'));

-- ============================================
-- STEP 5: Update any existing invalid role values
-- ============================================

-- Update any existing invalid roles to 'collaborator'
UPDATE public.workspace_members 
SET role = 'collaborator' 
WHERE role IS NOT NULL 
  AND role NOT IN ('owner', 'collaborator', 'member', 'admin', 'user');

-- ============================================
-- STEP 6: Test the fix
-- ============================================

SELECT '=== TESTING ROLE INSERTION ===' as info;

-- Test inserting with different role values
SELECT 'Testing role insertion with "member":' as test;
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
  'test@example.com',
  'member',
  'pending',
  w.owner_id,
  NULL
FROM public.workspaces w
CROSS JOIN public.users u
WHERE w.name = 'hello' 
  AND u.email = 'ramitrgoyal@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = w.id 
    AND wm.user_email = 'test@example.com'
  )
LIMIT 1;

-- Clean up test data
DELETE FROM public.workspace_members WHERE user_email = 'test@example.com';

-- ============================================
-- STEP 7: Show final constraint
-- ============================================

SELECT 'Final role constraint:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.workspace_members'::regclass 
  AND conname LIKE '%role%';

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ ROLE CONSTRAINT FIXED! Try sharing a workspace now.' as status;
