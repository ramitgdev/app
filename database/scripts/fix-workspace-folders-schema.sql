-- Fix workspace_folders table schema
-- Ensure proper folder structure support

-- Create workspace_folders table if it doesn't exist
CREATE TABLE IF NOT EXISTS workspace_folders (
  id INTEGER PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id INTEGER REFERENCES workspace_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add any missing columns
ALTER TABLE workspace_folders
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES workspace_folders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Make created_by column nullable
ALTER TABLE workspace_folders
ALTER COLUMN created_by DROP NOT NULL;

-- Make required columns NOT NULL
ALTER TABLE workspace_folders
ALTER COLUMN workspace_id SET NOT NULL,
ALTER COLUMN name SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_folders_workspace_id ON workspace_folders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_folders_parent_id ON workspace_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_workspace_folders_created_at ON workspace_folders(created_at);

-- Enable RLS
ALTER TABLE workspace_folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspace_folders
-- Allow users to see folders for workspaces they're members of
DROP POLICY IF EXISTS "Users can view folders for workspaces they're members of" ON workspace_folders;
CREATE POLICY "Users can view folders for workspaces they're members of" ON workspace_folders
FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to insert folders for workspaces they're members of
DROP POLICY IF EXISTS "Users can insert folders for workspaces they're members of" ON workspace_folders;
CREATE POLICY "Users can insert folders for workspaces they're members of" ON workspace_folders
FOR INSERT WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to update folders for workspaces they're members of
DROP POLICY IF EXISTS "Users can update folders for workspaces they're members of" ON workspace_folders;
CREATE POLICY "Users can update folders for workspaces they're members of" ON workspace_folders
FOR UPDATE USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete folders for workspaces they're members of
DROP POLICY IF EXISTS "Users can delete folders for workspaces they're members of" ON workspace_folders;
CREATE POLICY "Users can delete folders for workspaces they're members of" ON workspace_folders
FOR DELETE USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Check current folder data
SELECT 
  'workspace_folders' as table_name,
  COUNT(*) as total_folders,
  COUNT(DISTINCT workspace_id) as unique_workspaces
FROM workspace_folders;

-- Show sample folder data
SELECT 
  id,
  workspace_id,
  name,
  parent_id,
  created_at,
  updated_at
FROM workspace_folders
ORDER BY workspace_id, created_at
LIMIT 10;
