-- Add Workspace Files Support to Existing Database
-- Run this after the main supabase-complete-reset.sql

-- ============================================
-- WORKSPACE FILES TABLE
-- ============================================

-- Create workspace_files table to store file metadata
CREATE TABLE IF NOT EXISTS public.workspace_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT, -- File content
  platform TEXT DEFAULT 'Local',
  folder INTEGER DEFAULT 0, -- Folder ID (0 = root)
  folder_name TEXT,
  type TEXT DEFAULT 'file',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL
);

-- Create workspace_folders table for folder structure
CREATE TABLE IF NOT EXISTS public.workspace_folders (
  id SERIAL PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id INTEGER REFERENCES public.workspace_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on workspace_files
ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

-- Users can view files in workspaces they own or are members of
CREATE POLICY "workspace_files_select" ON public.workspace_files
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

-- Users can insert files in workspaces they own or are members of
CREATE POLICY "workspace_files_insert" ON public.workspace_files
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

-- Users can update files they created or in workspaces they own
CREATE POLICY "workspace_files_update" ON public.workspace_files
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Users can delete files they created or in workspaces they own
CREATE POLICY "workspace_files_delete" ON public.workspace_files
  FOR DELETE USING (
    created_by = auth.uid() 
    OR workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Enable RLS on workspace_folders
ALTER TABLE public.workspace_folders ENABLE ROW LEVEL SECURITY;

-- Users can view folders in workspaces they own or are members of
CREATE POLICY "workspace_folders_select" ON public.workspace_folders
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

-- Users can insert folders in workspaces they own or are members of
CREATE POLICY "workspace_folders_insert" ON public.workspace_folders
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

-- Users can update folders in workspaces they own
CREATE POLICY "workspace_folders_update" ON public.workspace_folders
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Users can delete folders in workspaces they own
CREATE POLICY "workspace_folders_delete" ON public.workspace_folders
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for faster file queries by workspace
CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace_id ON public.workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_folder ON public.workspace_files(folder);
CREATE INDEX IF NOT EXISTS idx_workspace_files_created_by ON public.workspace_files(created_by);

-- Index for faster folder queries
CREATE INDEX IF NOT EXISTS idx_workspace_folders_workspace_id ON public.workspace_folders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_folders_parent_id ON public.workspace_folders(parent_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to workspace_files
CREATE TRIGGER handle_workspace_files_updated_at
  BEFORE UPDATE ON public.workspace_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get all files in a workspace
CREATE OR REPLACE FUNCTION get_workspace_files(workspace_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  notes TEXT,
  platform TEXT,
  folder INTEGER,
  folder_name TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wf.id,
    wf.title,
    wf.notes,
    wf.platform,
    wf.folder,
    wf.folder_name,
    wf.type,
    wf.created_at,
    wf.updated_at,
    wf.created_by
  FROM public.workspace_files wf
  WHERE wf.workspace_id = workspace_uuid
  ORDER BY wf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all folders in a workspace
CREATE OR REPLACE FUNCTION get_workspace_folders(workspace_uuid UUID)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  parent_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wf.id,
    wf.name,
    wf.parent_id,
    wf.created_at,
    wf.created_by
  FROM public.workspace_folders wf
  WHERE wf.workspace_id = workspace_uuid
  ORDER BY wf.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
