-- Fix Workspace Membership and Chat Permissions
-- Run this in your Supabase SQL Editor

-- First, let's check and fix workspace_members table structure
-- Ensure workspace_members has the correct structure
DROP TABLE IF EXISTS public.workspace_members CASCADE;

CREATE TABLE public.workspace_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'declined')),
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_user_email ON public.workspace_members(user_email);
CREATE INDEX idx_workspace_members_status ON public.workspace_members(status);

-- Ensure workspace_chats table has correct structure
DROP TABLE IF EXISTS public.workspace_chats CASCADE;

CREATE TABLE public.workspace_chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for chat performance
CREATE INDEX idx_workspace_chats_workspace_id ON public.workspace_chats(workspace_id);
CREATE INDEX idx_workspace_chats_sender_id ON public.workspace_chats(sender_id);
CREATE INDEX idx_workspace_chats_recipient_id ON public.workspace_chats(recipient_id);
CREATE INDEX idx_workspace_chats_created_at ON public.workspace_chats(created_at);

-- Enable RLS on all tables
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspace_members
CREATE POLICY "Users can view members of workspaces they belong to" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_members.workspace_id 
      AND wm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = public.workspace_members.workspace_id 
      AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert members into workspaces they own" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = public.workspace_members.workspace_id 
      AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own membership" ON public.workspace_members
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for workspace_chats
CREATE POLICY "Users can view chats in workspaces they belong to" ON public.workspace_chats
  FOR SELECT USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_chats.workspace_id 
      AND wm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = public.workspace_chats.workspace_id 
      AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can send chats in workspaces they belong to" ON public.workspace_chats
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    (EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = public.workspace_chats.workspace_id 
      AND wm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = public.workspace_chats.workspace_id 
      AND w.owner_id = auth.uid()
    ))
  );

-- Create function to automatically accept invites for existing users
CREATE OR REPLACE FUNCTION public.accept_existing_invites()
RETURNS void AS $$
BEGIN
  -- Update all pending invites for users that exist
  UPDATE public.workspace_members 
  SET 
    status = 'active',
    accepted_at = NOW()
  WHERE 
    status = 'pending' 
    AND user_id IS NOT NULL;
    
  RAISE NOTICE 'Updated existing invites to active status';
END;
$$ LANGUAGE plpgsql;

-- Run the function to accept existing invites
SELECT public.accept_existing_invites();

-- Grant permissions
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_chats TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a function to help with debugging
CREATE OR REPLACE FUNCTION public.debug_workspace_access(workspace_uuid UUID)
RETURNS TABLE (
  user_email TEXT,
  workspace_name TEXT,
  is_owner BOOLEAN,
  is_member BOOLEAN,
  member_status TEXT,
  can_view_chats BOOLEAN,
  can_send_chats BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.email,
    w.name,
    (w.owner_id = auth.uid()) as is_owner,
    (wm.user_id IS NOT NULL) as is_member,
    COALESCE(wm.status, 'not_member') as member_status,
    (w.owner_id = auth.uid() OR wm.user_id IS NOT NULL) as can_view_chats,
    (w.owner_id = auth.uid() OR wm.user_id IS NOT NULL) as can_send_chats
  FROM public.users u
  CROSS JOIN public.workspaces w
  LEFT JOIN public.workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = u.id
  WHERE w.id = workspace_uuid AND u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
