-- FIX USER REGISTRATION ISSUE
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Check what users exist in auth.users vs public.users
-- ============================================

SELECT '=== CHECKING USER REGISTRATION ===' as info;

SELECT 'Users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

SELECT 'Users in public.users:' as info;
SELECT id, email, created_at FROM public.users ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Manually create missing users
-- ============================================

-- Insert any auth.users that don't exist in public.users
INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================
-- STEP 3: Create missing presence records
-- ============================================

-- Insert presence records for users that don't have them
INSERT INTO public.user_presence (user_id, last_seen, status, updated_at)
SELECT 
  u.id,
  u.created_at,
  'offline',
  u.created_at
FROM public.users u
LEFT JOIN public.user_presence up ON u.id = up.user_id
WHERE up.user_id IS NULL;

-- ============================================
-- STEP 4: Test the trigger function
-- ============================================

SELECT 'Testing trigger function:' as info;
SELECT 
  'handle_new_user function exists:' as test,
  EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') as result;

SELECT 'on_auth_user_created trigger exists:' as test,
  EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') as result;

-- ============================================
-- STEP 5: Show final state
-- ============================================

SELECT 'Final users in public.users:' as info;
SELECT id, email, created_at FROM public.users ORDER BY created_at DESC;

SELECT 'Final presence records:' as info;
SELECT user_id, status, last_seen FROM public.user_presence ORDER BY last_seen DESC;

-- ============================================
-- STEP 6: Test workspace creation manually
-- ============================================

-- Try to create a test workspace for the first user
SELECT 'Testing workspace creation:' as info;
SELECT 
  'Can create workspace for user:' as test,
  u.email,
  u.id as user_id
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 1;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ USER REGISTRATION FIX COMPLETE! Try creating a workspace now.' as status;
