# Complete Database Reset Guide

## What This Does

The `database/scripts/supabase-complete-reset.sql` script will:

1. **Delete everything** - All tables, policies, triggers, and functions
2. **Rebuild from scratch** - Clean, properly structured tables
3. **Add workspace functionality** - Create, delete, and share workspaces
4. **Fix infinite recursion** - Simple, non-conflicting policies

## How to Use

### Step 1: Run the Reset Script
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the entire `database/scripts/supabase-complete-reset.sql` file
4. Click "Run" to execute

### Step 2: Test Your Functionality
After running the script, you should be able to:

- ✅ Create new workspaces
- ✅ Delete workspaces you own
- ✅ Share workspaces with other users
- ✅ View collaborators in shared workspaces

## Database Structure

### Tables Created:

1. **`users`** - User profiles (extends auth.users)
   - `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`

2. **`workspaces`** - Workspace information
   - `id`, `name`, `description`, `owner_id`, `created_at`, `updated_at`

3. **`workspace_members`** - Sharing/collaboration data
   - `id`, `workspace_id`, `user_id`, `user_email`, `role`, `status`, `invited_by`, `invited_at`, `accepted_at`, `created_at`

4. **`workspace_chats`** - Chat messages within workspaces
   - `id`, `workspace_id`, `sender_id`, `recipient_id`, `message`, `created_at`

5. **`user_presence`** - User online status
   - `id`, `user_id`, `last_seen`, `status`, `updated_at`

## Workspace Sharing Flow

### To Share a Workspace:
1. Insert a record into `workspace_members` table:
```sql
INSERT INTO workspace_members (workspace_id, user_email, invited_by)
VALUES ('workspace-uuid', 'collaborator@example.com', auth.uid());
```

### To Accept an Invitation:
1. Update the member record:
```sql
UPDATE workspace_members 
SET status = 'accepted', accepted_at = NOW(), user_id = auth.uid()
WHERE user_email = auth.email() AND workspace_id = 'workspace-uuid';
```

### To View Collaborators:
```sql
SELECT wm.*, u.full_name, u.avatar_url
FROM workspace_members wm
LEFT JOIN users u ON wm.user_id = u.id
WHERE wm.workspace_id = 'workspace-uuid' AND wm.status = 'accepted';
```

## Key Features

### 1. Workspace Creation
- Users can create unlimited workspaces
- Each workspace has an owner who can manage it

### 2. Workspace Deletion
- Only workspace owners can delete their workspaces
- Deletion cascades to remove all related data (members, chats)

### 3. Workspace Sharing
- Owners can invite users by email
- Invitations have pending/accepted/declined status
- Collaborators can view and participate in shared workspaces

### 4. Security
- Row Level Security (RLS) enabled on all tables
- Users can only see their own data and shared workspaces
- Simple policies that avoid infinite recursion

## Troubleshooting

### If you still get errors:
1. Make sure you're running the complete script in one go
2. Check that your Supabase project has the necessary permissions
3. Verify that the `auth.users` table exists (it should be created automatically)

### If workspace sharing doesn't work:
1. Check that the invited user exists in the `users` table
2. Verify the `user_email` matches exactly
3. Make sure the invitation status is properly updated

## Files to Use Going Forward

- **Use only:** `database/scripts/supabase-complete-reset.sql`
- **Ignore:** All other SQL files (they're outdated)

This reset gives you a clean, working database with all the functionality you need for workspace management and collaboration.
