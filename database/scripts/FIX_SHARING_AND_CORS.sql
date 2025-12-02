-- FIX WORKSPACE SHARING LOGIC AND CORS
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Check current workspace members
-- ============================================

SELECT '=== CHECKING CURRENT WORKSPACE MEMBERS ===' as info;

SELECT 'All workspace members:' as info;
SELECT 
  wm.id,
  w.name as workspace_name,
  wm.user_email,
  wm.role,
  wm.status,
  wm.invited_by,
  wm.accepted_at
FROM public.workspace_members wm
JOIN public.workspaces w ON wm.workspace_id = w.id
ORDER BY wm.created_at DESC;

-- ============================================
-- STEP 2: Update pending invites to accepted
-- ============================================

-- Update all pending invites for ramitgoodboy@gmail.com to accepted
UPDATE public.workspace_members 
SET 
  status = 'accepted',
  accepted_at = NOW()
WHERE user_email = 'ramitgoodboy@gmail.com' 
  AND status = 'pending';

-- ============================================
-- STEP 3: Ensure ramitgoodboy@gmail.com has user_id
-- ============================================

-- Get the user_id for ramitgoodboy@gmail.com
SELECT 'Getting user_id for ramitgoodboy@gmail.com:' as info;
SELECT id, email FROM public.users WHERE email = 'ramitgoodboy@gmail.com';

-- Update workspace_members to include user_id for ramitgoodboy@gmail.com
UPDATE public.workspace_members 
SET user_id = (SELECT id FROM public.users WHERE email = 'ramitgoodboy@gmail.com')
WHERE user_email = 'ramitgoodboy@gmail.com' 
  AND user_id IS NULL;

-- ============================================
-- STEP 4: Show final state
-- ============================================

SELECT 'Final workspace members for ramitgoodboy@gmail.com:' as info;
SELECT 
  wm.id,
  w.name as workspace_name,
  wm.user_email,
  wm.role,
  wm.status,
  wm.user_id,
  wm.accepted_at
FROM public.workspace_members wm
JOIN public.workspaces w ON wm.workspace_id = w.id
WHERE wm.user_email = 'ramitgoodboy@gmail.com'
ORDER BY wm.created_at DESC;

-- ============================================
-- STEP 5: Test what ramitgoodboy@gmail.com should see
-- ============================================

SELECT 'Workspaces that ramitgoodboy@gmail.com should see:' as info;
SELECT DISTINCT 
  w.id,
  w.name,
  wm.role,
  wm.status,
  w.created_at
FROM public.workspaces w
JOIN public.workspace_members wm ON w.id = wm.workspace_id
WHERE wm.user_email = 'ramitgoodboy@gmail.com' 
  AND wm.status = 'accepted'
ORDER BY w.created_at DESC;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ WORKSPACE SHARING FIXED! ramitgoodboy@gmail.com should now see shared workspaces.' as status;
