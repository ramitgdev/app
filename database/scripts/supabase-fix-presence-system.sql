-- Fix Presence System and Team Member Status
-- Run this in your Supabase SQL Editor

-- Ensure user_presence table has correct structure
DROP TABLE IF EXISTS public.user_presence CASCADE;

CREATE TABLE public.user_presence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_presence_user_id ON public.user_presence(user_id);
CREATE INDEX idx_user_presence_last_seen ON public.user_presence(last_seen);
CREATE INDEX idx_user_presence_status ON public.user_presence(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_presence
CREATE POLICY "Users can view presence of workspace members" ON public.user_presence
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm1
      JOIN public.workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid() AND wm2.user_id = public.user_presence.user_id
    )
  );

CREATE POLICY "Users can update their own presence" ON public.user_presence
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own presence" ON public.user_presence
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create function to automatically create presence record for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status)
  VALUES (NEW.id, 'offline')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_presence ON auth.users;
CREATE TRIGGER on_auth_user_created_presence
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_presence();

-- Create presence records for existing users who don't have them
INSERT INTO public.user_presence (user_id, status)
SELECT id, 'offline'
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_presence)
ON CONFLICT (user_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON public.user_presence TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
