-- Complete Fix for Group Chat recipient_id Error
-- Run this in your Supabase SQL Editor

-- Step 1: Check and fix the table structure
DO $$ 
BEGIN
  -- Remove recipient_id from group chats table if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspace_group_chats' 
    AND column_name = 'recipient_id'
  ) THEN
    ALTER TABLE public.workspace_group_chats DROP COLUMN recipient_id;
    RAISE NOTICE 'Removed recipient_id from workspace_group_chats table';
  ELSE
    RAISE NOTICE 'workspace_group_chats table is correct (no recipient_id)';
  END IF;
END $$;

-- Step 2: Check and fix the trigger function
-- The issue might be in the create_chat_notification function
CREATE OR REPLACE FUNCTION public.create_chat_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- For direct messages (workspace_chats table)
  IF TG_TABLE_NAME = 'workspace_chats' AND NEW.recipient_id IS NOT NULL THEN
    INSERT INTO public.chat_notifications (user_id, workspace_id, sender_id, message_preview, notification_type)
    VALUES (
      NEW.recipient_id,
      NEW.workspace_id,
      NEW.sender_id,
      LEFT(NEW.message, 100),
      'message'
    );
  END IF;
  
  -- For group messages (workspace_group_chats table) - NO recipient_id!
  IF TG_TABLE_NAME = 'workspace_group_chats' THEN
    INSERT INTO public.chat_notifications (user_id, workspace_id, sender_id, message_preview, notification_type)
    SELECT 
      wm.user_id,
      NEW.workspace_id,
      NEW.sender_id,
      LEFT(NEW.message, 100),
      'message'
    FROM public.workspace_members wm
    WHERE wm.workspace_id = NEW.workspace_id
    AND wm.user_id IS NOT NULL
    AND wm.user_id != NEW.sender_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop and recreate triggers to ensure they're using the fixed function
DROP TRIGGER IF EXISTS trigger_create_chat_notification_direct ON public.workspace_chats;
DROP TRIGGER IF EXISTS trigger_create_chat_notification_group ON public.workspace_group_chats;

-- Recreate triggers
CREATE TRIGGER trigger_create_chat_notification_direct
  AFTER INSERT ON public.workspace_chats
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_notification();

CREATE TRIGGER trigger_create_chat_notification_group
  AFTER INSERT ON public.workspace_group_chats
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_notification();

-- Step 4: Verify the workspace_group_chats table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspace_group_chats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Test inserting a group message (replace with actual values)
-- First, let's get a workspace and user to test with
DO $$
DECLARE
  test_workspace_id UUID;
  test_user_id UUID;
BEGIN
  -- Get first workspace
  SELECT id INTO test_workspace_id FROM public.workspaces LIMIT 1;
  
  -- Get first user
  SELECT id INTO test_user_id FROM public.users LIMIT 1;
  
  IF test_workspace_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    -- Insert test message
    INSERT INTO public.workspace_group_chats (
      workspace_id,
      sender_id,
      message,
      message_type
    ) VALUES (
      test_workspace_id,
      test_user_id,
      'Test group message after complete fix',
      'text'
    );
    
    RAISE NOTICE 'Test group message inserted successfully';
    
    -- Clean up test message
    DELETE FROM public.workspace_group_chats 
    WHERE message = 'Test group message after complete fix';
    
    RAISE NOTICE 'Test message cleaned up';
  ELSE
    RAISE NOTICE 'No workspace or user found for testing';
  END IF;
END $$;

-- Show success message
SELECT 'Complete group chat fix applied successfully!' as status;
