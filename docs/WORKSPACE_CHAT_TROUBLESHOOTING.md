# Workspace Chat Troubleshooting Guide

## Current Issue
- `ramitrgoyal@gmail.com` can send messages but `ramitgoodboy@gmail.com` can't see any collaborators or messages
- This indicates a workspace membership or permissions issue

## Step-by-Step Fix Process

### Step 1: Run Database Fix Scripts

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Presence System Fix**
   ```sql
   -- Copy and paste the entire database/scripts/supabase-fix-presence-system.sql file
   -- Click "Run"
   ```

3. **Run the Workspace Permissions Fix**
   ```sql
   -- Copy and paste the entire database/scripts/supabase-fix-workspace-chat-permissions.sql file
   -- Click "Run"
   ```

### Step 2: Debug Current State

1. **Open DevHub in the `ramitrgoyal@gmail.com` account**
2. **Open Browser Console** (F12)
3. **Run the debug script**:
   ```javascript
   // Copy and paste the scripts/debug-workspace-membership.js content
   // This will show you the current state of workspaces and members
   ```

4. **Check the console output** for:
   - User workspaces
   - Workspace members
   - User profiles
   - Presence data
   - Existing chat messages
   - Any errors

### Step 3: Connect Accounts to Workspace

1. **In the `ramitrgoyal@gmail.com` account console**, run:
   ```javascript
   // Copy and paste the scripts/connect-accounts-to-workspace.js content
   // This will automatically connect both accounts to the same workspace
   ```

2. **Check the console output** for:
   - Workspace creation/selection
   - User connection
   - Member addition
   - Test message sending

### Step 4: Test the Connection

1. **Refresh both browser windows**
2. **Navigate to the same workspace** in both accounts
3. **Check the Team section** - both users should appear
4. **Try sending direct messages** between the accounts

## Expected Results After Fix

### ✅ Working Features:
- Both accounts should see each other in the Team section
- Direct message recipient dropdown should show the other user
- Messages should be sent and received in real-time
- Team member status should be consistent across accounts

### 🔍 Debug Information to Look For:

#### In Console Output:
```
👤 Current user: ramitrgoyal@gmail.com
📁 User workspaces: [workspace object]
👥 Workspace members: [member objects]
👤 User profiles: [user objects]
🟢 Presence data: [presence objects]
💬 Existing chat messages: [chat objects]
✅ Test message sent successfully: [message object]
```

#### In Database (Supabase Dashboard):
- `workspace_members` table should have entries for both users
- `workspace_chats` table should have the test message
- `user_presence` table should have records for both users

## Common Issues and Solutions

### Issue 1: "No workspaces found for user"
**Solution:**
- Run the `scripts/connect-accounts-to-workspace.js` script
- This will create a workspace if none exists

### Issue 2: "RLS policy issue" errors
**Solution:**
- Run the `database/scripts/supabase-fix-workspace-chat-permissions.sql` script
- This recreates the tables with proper RLS policies

### Issue 3: "User not found" errors
**Solution:**
- Make sure both accounts are created in the `users` table
- Check that both users have logged in at least once

### Issue 4: Messages not appearing in real-time
**Solution:**
- Check that the real-time subscriptions are working
- Verify that both users are in the same workspace
- Ensure the `workspace_chats` table has proper permissions

## Manual Database Checks

### Check Workspace Membership:
```sql
SELECT 
  w.name as workspace_name,
  u.email as user_email,
  wm.status as member_status,
  wm.role as member_role
FROM workspaces w
JOIN workspace_members wm ON w.id = wm.workspace_id
JOIN users u ON wm.user_id = u.id
ORDER BY w.name, u.email;
```

### Check Chat Messages:
```sql
SELECT 
  w.name as workspace_name,
  sender.email as sender_email,
  recipient.email as recipient_email,
  wc.message,
  wc.created_at
FROM workspace_chats wc
JOIN workspaces w ON wc.workspace_id = w.id
JOIN users sender ON wc.sender_id = sender.id
LEFT JOIN users recipient ON wc.recipient_id = recipient.id
ORDER BY wc.created_at DESC;
```

### Check User Presence:
```sql
SELECT 
  u.email,
  up.status,
  up.last_seen,
  up.updated_at
FROM users u
LEFT JOIN user_presence up ON u.id = up.user_id
ORDER BY u.email;
```

## Final Verification Steps

1. **Both accounts should see the same workspace**
2. **Team section should show both users**
3. **Direct message dropdown should list the other user**
4. **Messages should be sent and received immediately**
5. **Team member status should be consistent**

## If Issues Persist

1. **Check browser console for errors**
2. **Verify database permissions in Supabase**
3. **Ensure both users are authenticated**
4. **Check that real-time subscriptions are enabled**
5. **Try clearing browser cache and local storage**

## Support Information

If you continue to have issues after following these steps:

1. **Save the console output** from the debug scripts
2. **Take screenshots** of any error messages
3. **Note which step** the issue occurs at
4. **Check the database tables** in Supabase dashboard for data consistency

The debug scripts will provide detailed information about what's working and what's not, which will help identify the specific issue.
