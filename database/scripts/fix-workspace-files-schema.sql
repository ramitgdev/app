-- Fix workspace_files table schema
-- Add missing columns and update existing ones

-- Add missing columns to workspace_files table
ALTER TABLE workspace_files 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing columns if they don't exist
ALTER TABLE workspace_files 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN workspace_id SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace_id ON workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_created_at ON workspace_files(created_at);
CREATE INDEX IF NOT EXISTS idx_workspace_files_folder ON workspace_files(folder);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view workspace files" ON workspace_files;
CREATE POLICY "Users can view workspace files" ON workspace_files
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid() 
      OR id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid() AND status = 'accepted'
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert workspace files" ON workspace_files;
CREATE POLICY "Users can insert workspace files" ON workspace_files
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid() 
      OR id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid() AND status = 'accepted'
      )
    )
  );

DROP POLICY IF EXISTS "Users can update workspace files" ON workspace_files;
CREATE POLICY "Users can update workspace files" ON workspace_files
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid() 
      OR id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid() AND status = 'accepted'
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete workspace files" ON workspace_files;
CREATE POLICY "Users can delete workspace files" ON workspace_files
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid() 
      OR id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid() AND status = 'accepted'
      )
    )
  );

-- Enable RLS
ALTER TABLE workspace_files ENABLE ROW LEVEL SECURITY;
