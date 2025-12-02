-- Quick Fix for Infinite Recursion in Workspaces Table RLS Policy
-- Run this immediately to fix the workspace creation issue

-- Drop the problematic workspaces policies that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_policy" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_comprehensive" ON public.workspaces;

-- Create a simple, safe policy for workspaces table
CREATE POLICY "workspaces_select_safe" ON public.workspaces
FOR SELECT USING (
  -- Allow users to see workspaces they own
  owner_id = auth.uid()
);

-- Create simple policies for other operations
CREATE POLICY "workspaces_create_safe" ON public.workspaces
FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "workspaces_update_safe" ON public.workspaces
FOR UPDATE USING (
  owner_id = auth.uid()
);

CREATE POLICY "workspaces_delete_safe" ON public.workspaces
FOR DELETE USING (
  owner_id = auth.uid()
);

-- Grant basic permissions
GRANT ALL ON public.workspaces TO authenticated;

-- Test if the fix worked
SELECT 'Workspaces table policies fixed. Testing basic access...' as status;

-- Try to select from workspaces table to verify no recursion
SELECT id, name, owner_id 
FROM public.workspaces 
WHERE owner_id = auth.uid() 
LIMIT 1;
