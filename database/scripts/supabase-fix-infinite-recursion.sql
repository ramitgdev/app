-- Quick Fix for Infinite Recursion in Users Table RLS Policy
-- Run this immediately to fix the workspace creation issue

-- Drop the problematic users policy that's causing infinite recursion
DROP POLICY IF EXISTS "users_select_comprehensive" ON public.users;

-- Create a simple, safe policy for users table
CREATE POLICY "users_select_safe" ON public.users
FOR SELECT USING (
  -- Allow users to see their own profile
  id = auth.uid()
);

-- Also check and fix any other problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Grant basic permissions
GRANT SELECT ON public.users TO authenticated;

-- Test if the fix worked
SELECT 'Users table policies fixed. Testing basic access...' as status;

-- Try to select from users table to verify no recursion
SELECT id, email, full_name 
FROM public.users 
WHERE id = auth.uid() 
LIMIT 1;
