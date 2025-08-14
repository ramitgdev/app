-- Final Fix for Group Chat recipient_id Error
-- Run this in your Supabase SQL Editor

-- Step 1: Remove recipient_id from group chats table if it exists
DO $$ 
BEGIN
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

-- Step 2: Create separate trigger functions for each table type
-- Function for direct messages (workspace_chats table)
CREATE OR REPLACE FUNCTION public.create_direct_chat_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chat_notifications (user_id, workspace_id, sender_id, message_preview, notification_type)
  VALUES (
    NEW.recipient_id,
    NEW.workspace_id,
    NEW.sender_id,
    LEFT(NEW.message, 100),
    'message'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for group messages (workspace_group_chats table) - NO recipient_id!
CREATE OR REPLACE FUNCTION public.create_group_chat_notification()
RETURNS TRIGGER AS $$
BEGIN
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop all existing triggers
DROP TRIGGER IF EXISTS trigger_create_chat_notification_direct ON public.workspace_chats;
DROP TRIGGER IF EXISTS trigger_create_chat_notification_group ON public.workspace_group_chats;
DROP TRIGGER IF EXISTS trigger_create_chat_notification ON public.workspace_chats;
DROP TRIGGER IF EXISTS trigger_create_chat_notification ON public.workspace_group_chats;

-- Step 4: Create new triggers with separate functions
CREATE TRIGGER trigger_create_direct_chat_notification
  AFTER INSERT ON public.workspace_chats
  FOR EACH ROW EXECUTE FUNCTION public.create_direct_chat_notification();

CREATE TRIGGER trigger_create_group_chat_notification
  AFTER INSERT ON public.workspace_group_chats
  FOR EACH ROW EXECUTE FUNCTION public.create_group_chat_notification();

-- Step 5: Verify the workspace_group_chats table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspace_group_chats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: Test inserting a group message
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
      'Test group message after final fix',
      'text'
    );
    
    RAISE NOTICE 'Test group message inserted successfully';
    
    -- Clean up test message
    DELETE FROM public.workspace_group_chats 
    WHERE message = 'Test group message after final fix';
    
    RAISE NOTICE 'Test message cleaned up';
  ELSE
    RAISE NOTICE 'No workspace or user found for testing';
  END IF;
END $$;

-- Show success message
SELECT 'Final group chat fix applied successfully!' as status;
