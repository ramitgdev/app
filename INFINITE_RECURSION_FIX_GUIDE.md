# Fix Infinite Recursion in Supabase Policies

## The Problem
You're getting "infinite recursion detected in policy for relation 'workspace_members'" because your RLS policies are creating circular references. This happens when:

1. Multiple overlapping policies exist on the same table
2. Policies reference other tables that reference back to the original table
3. Complex subqueries in policies create dependency loops

## The Solution

### Step 1: Run the Fix Script
Execute the `database/scripts/supabase-fix-infinite-recursion.sql` file in your Supabase SQL Editor. This will:

1. **Drop all existing conflicting policies** on `workspace_members` and `workspaces` tables
2. **Create clean, simple policies** that avoid circular references
3. **Use direct comparisons** instead of complex subqueries where possible

### Step 2: Key Changes Made

#### Before (Problematic):
```sql
-- This could cause recursion
CREATE POLICY "users_can_view_memberships_by_email" ON public.workspace_members
  FOR SELECT USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
```

#### After (Fixed):
```sql
-- This uses auth.email() directly, avoiding subqueries
CREATE POLICY "view_own_memberships" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() 
    OR user_email = auth.email()
  );
```

### Step 3: Policy Structure
The new policies follow this pattern:

1. **Simple direct comparisons** using `auth.uid()` and `auth.email()`
2. **Separate policies for each operation** (SELECT, INSERT, UPDATE, DELETE)
3. **Clear ownership model** - workspace owners can manage their workspaces and members
4. **No circular references** between tables

### Step 4: Test Your Workspace Creation
After running the fix script, try creating a new workspace again. The error should be resolved.

## Prevention Tips

1. **Keep policies simple** - avoid complex subqueries when possible
2. **Use auth.uid() and auth.email() directly** instead of querying auth.users
3. **Separate policies by operation** rather than using broad "FOR ALL" policies
4. **Test policies incrementally** - add one at a time to identify issues early

## If You Still Have Issues

1. Check for any custom policies you might have added
2. Ensure your table structure matches what the policies expect
3. Look for any triggers that might be interfering
4. Consider temporarily disabling RLS to test basic functionality

## Files to Use Going Forward

- Use `database/scripts/supabase-basic-tables.sql` for table creation
- Use `database/scripts/supabase-fix-infinite-recursion.sql` for security policies
- Avoid mixing multiple security policy files
