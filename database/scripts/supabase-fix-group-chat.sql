-- Fix for Group Chat recipient_id Error
-- Run this in your Supabase SQL Editor

-- The issue is that group messages are trying to insert a recipient_id field
-- but group messages should not have recipients - they go to everyone

-- Let's check the current schema and fix it
DO $$ 
BEGIN
  -- Check if workspace_group_chats table has recipient_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspace_group_chats' 
    AND column_name = 'recipient_id'
  ) THEN
    -- Remove recipient_id from group chats table (it shouldn't be there)
    ALTER TABLE public.workspace_group_chats DROP COLUMN IF EXISTS recipient_id;
    RAISE NOTICE 'Removed recipient_id from workspace_group_chats table';
  ELSE
    RAISE NOTICE 'workspace_group_chats table is correct (no recipient_id)';
  END IF;
END $$;

-- Verify the workspace_group_chats table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspace_group_chats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test inserting a group message (this should work now)
-- Uncomment the lines below to test, but replace with actual workspace_id and user_id
/*
INSERT INTO public.workspace_group_chats (
  workspace_id,
  sender_id,
  message,
  message_type
) VALUES (
  'your-workspace-id-here',
  'your-user-id-here',
  'Test group message after fix',
  'text'
);
*/

-- Show success message
SELECT 'Group chat recipient_id error fixed!' as status;
