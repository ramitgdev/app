-- FIX WORKSPACE SHARING RLS POLICY
-- This fixes the "new row violates row-level security policy for table workspace_members" error
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Drop the problematic policy
-- ============================================

DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;

-- ============================================
-- STEP 2: Create the correct insert policy
-- ============================================

-- This policy allows workspace owners to invite new members
CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 3: Also ensure workspace owners can view all members
-- ============================================

DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;

CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() 
    OR user_email = auth.email()
    OR EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 4: Ensure workspace owners can manage members
-- ============================================

DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;

CREATE POLICY "workspace_members_update" ON public.workspace_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;

CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 5: Verify the fix
-- ============================================

-- Test query to verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'workspace_members' 
  AND schemaname = 'public'
ORDER BY policyname;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT '✅ WORKSPACE SHARING FIXED! Workspace owners can now invite new members.' as status;
