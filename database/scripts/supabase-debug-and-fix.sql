-- Debug and Fix Workspace Issues
-- Run this in your Supabase SQL Editor

-- First, let's debug what's happening
SELECT '=== DEBUGGING CURRENT STATE ===' as info;

-- Check the current table structure
SELECT 'workspace_members table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'workspace_members' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check the current constraints
SELECT 'workspace_members constraints:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.workspace_members'::regclass;

-- Check what's currently in the tables
SELECT 'Current workspaces:' as info;
SELECT * FROM workspaces;

SELECT 'Current workspace_members:' as info;
SELECT * FROM workspace_members;

-- Check what values are being inserted that violate the constraint
SELECT 'Checking for invalid status values:' as info;
SELECT DISTINCT status FROM workspace_members WHERE status IS NOT NULL;

-- Now let's fix the issues step by step

-- Step 1: Fix the check constraint to be more permissive
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_status_check;

-- Add a more permissive constraint
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_status_check 
CHECK (status IS NULL OR status IN ('pending', 'active', 'declined', 'accepted'));

-- Step 2: Update any existing invalid status values
UPDATE workspace_members 
SET status = 'active' 
WHERE status IS NULL OR status NOT IN ('pending', 'active', 'declined', 'accepted');

-- Step 3: Check the application code issue
-- The problem might be that the app is trying to insert a status value that's not allowed
-- Let's see what the current default is
SELECT 'Current default for status column:' as info;
SELECT column_default 
FROM information_schema.columns 
WHERE table_name = 'workspace_members' 
  AND column_name = 'status' 
  AND table_schema = 'public';

-- Step 4: Set a proper default
ALTER TABLE public.workspace_members ALTER COLUMN status SET DEFAULT 'active';

-- Step 5: Now let's check if the policies are working
SELECT 'Testing policy access for ramitrgoyal@gmail.com:' as info;
SELECT 
  w.name,
  w.id,
  wm.user_email,
  wm.status,
  wm.role
FROM workspaces w
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
WHERE w.name = 'hi' OR wm.user_email = 'ramitrgoyal@gmail.com';

SELECT 'Testing policy access for ramitgoodboy@gmail.com:' as info;
SELECT 
  w.name,
  w.id,
  wm.user_email,
  wm.status,
  wm.role
FROM workspaces w
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
WHERE w.name = 'hi' OR wm.user_email = 'ramitgoodboy@gmail.com';

-- Step 6: Manually ensure ramitgoodboy@gmail.com has access to the "hi" workspace
-- First, let's see if there's already a membership
SELECT 'Checking existing membership for ramitgoodboy@gmail.com:' as info;
SELECT * FROM workspace_members 
WHERE user_email = 'ramitgoodboy@gmail.com' AND workspace_id IN (
  SELECT id FROM workspaces WHERE name = 'hi'
);

-- If no membership exists, create one
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

-- Step 7: Test creating a workspace manually to see what happens
SELECT 'Testing workspace creation manually:' as info;
-- Let's try to insert a workspace member manually to see what the issue is
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
  u.email,
  'owner',
  'active',
  u.id,
  NOW()
FROM workspaces w
CROSS JOIN users u
WHERE w.name = 'yo' 
  AND u.email = 'ramitrgoyal@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM workspace_members wm 
    WHERE wm.workspace_id = w.id 
    AND wm.user_id = u.id
  )
LIMIT 1;

-- Step 8: Show final state
SELECT 'Final workspace_members data:' as info;
SELECT * FROM workspace_members ORDER BY created_at DESC;

SELECT 'Final workspaces data:' as info;
SELECT * FROM workspaces ORDER BY created_at DESC;

-- Step 9: Test the policies
SELECT 'Testing if policies work:' as info;
SELECT 'Can ramitrgoyal@gmail.com see workspaces?' as test;
SELECT COUNT(*) as workspace_count FROM workspaces WHERE owner_id = (
  SELECT id FROM users WHERE email = 'ramitrgoyal@gmail.com'
);

SELECT 'Can ramitgoodboy@gmail.com see workspace memberships?' as test;
SELECT COUNT(*) as membership_count FROM workspace_members WHERE user_email = 'ramitgoodboy@gmail.com';
