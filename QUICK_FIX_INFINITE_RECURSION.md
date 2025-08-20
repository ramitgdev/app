# Quick Fix for Infinite Recursion Error

## The Problem
You're getting an error: **"infinite recursion detected in policy for relation 'workspace_members'"**

This happens when RLS (Row Level Security) policies reference each other in a circular way, causing the database to get stuck in an infinite loop.

## Quick Fix Steps

### Step 1: Fix the Database Policies
1. **Open your Supabase dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the entire `supabase-fix-infinite-recursion.sql` file**
4. **Click "Run"**

This will:
- ✅ Remove the problematic recursive policies
- ✅ Create simple, non-recursive policies
- ✅ Fix the workspace sharing functionality

### Step 2: Manually Connect Accounts
Since the share functionality was broken, we'll connect the accounts manually:

1. **Open DevHub in the `ramitrgoyal@gmail.com` account**
2. **Open browser console** (F12)
3. **Copy and paste the `manual-workspace-connection.js` content**
4. **Run it**

This will:
- ✅ Find or create a workspace
- ✅ Add both accounts as members
- ✅ Test message sending
- ✅ Verify the connection

### Step 3: Test the Fix
1. **Refresh both browser windows**
2. **Both accounts should now see the same workspace**
3. **Check the Team section** - both users should appear
4. **Try sending direct messages** between the accounts

## What Was Wrong

The original RLS policies were trying to check workspace membership by looking at the `workspace_members` table, but the policies for `workspace_members` were also trying to check workspace membership, creating a circular dependency.

## The Fix

The new policies are simpler and avoid recursion by:
- ✅ Using direct workspace ownership checks
- ✅ Avoiding circular references between tables
- ✅ Using simple EXISTS clauses instead of complex joins

## Expected Results

After running the fix:
- ✅ Workspace sharing should work again
- ✅ Both accounts should see each other in the Team section
- ✅ Direct messages should work between accounts
- ✅ No more infinite recursion errors

## If You Still Have Issues

1. **Check the console output** from the manual connection script
2. **Look for any error messages** in the browser console
3. **Verify both accounts are logged in** and have user records
4. **Try clearing browser cache** and refreshing

The manual connection script will show you exactly what's happening and help identify any remaining issues.
