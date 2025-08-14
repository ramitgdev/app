-- Simple and reliable Supabase file storage setup
-- Run this in your Supabase SQL editor

-- Step 1: Add file storage columns to workspace_files table
ALTER TABLE workspace_files 
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/plain';

-- Step 2: Create storage bucket for workspace files
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-files', 'workspace-files', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace_id ON workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_created_by ON workspace_files(created_by);
CREATE INDEX IF NOT EXISTS idx_workspace_files_file_path ON workspace_files(file_path);

-- Step 4: Set up basic RLS policies for storage bucket
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'workspace-files' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'workspace-files' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'workspace-files' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'workspace-files' AND 
  auth.role() = 'authenticated'
);

-- Step 5: Update workspace_files table policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view workspace files they have access to" ON workspace_files;
DROP POLICY IF EXISTS "Users can insert files to workspaces they have access to" ON workspace_files;
DROP POLICY IF EXISTS "Users can update files in workspaces they have access to" ON workspace_files;
DROP POLICY IF EXISTS "Users can delete files from workspaces they have access to" ON workspace_files;

-- Create new policies for workspace_files
CREATE POLICY "Users can view workspace files they have access to" ON workspace_files
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE w.id = workspace_files.workspace_id AND
    (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
    wm.status = 'active'
  )
);

CREATE POLICY "Users can insert files to workspaces they have access to" ON workspace_files
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE w.id = workspace_files.workspace_id AND
    (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
    wm.status = 'active'
  )
);

CREATE POLICY "Users can update files in workspaces they have access to" ON workspace_files
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE w.id = workspace_files.workspace_id AND
    (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
    wm.status = 'active'
  )
);

CREATE POLICY "Users can delete files from workspaces they have access to" ON workspace_files
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE w.id = workspace_files.workspace_id AND
    (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
    wm.status = 'active'
  )
);

-- Step 6: Add helpful comments
COMMENT ON COLUMN workspace_files.file_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN workspace_files.file_url IS 'Public URL for accessing the file';
COMMENT ON COLUMN workspace_files.file_size IS 'File size in bytes';
COMMENT ON COLUMN workspace_files.mime_type IS 'MIME type of the file';

-- Step 7: Verification query
SELECT 
  'workspace_files table' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspace_files') 
    THEN '✅ Exists' ELSE '❌ Missing' END as status
UNION ALL
SELECT 
  'workspace-files bucket' as component,
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'workspace-files') 
    THEN '✅ Exists' ELSE '❌ Missing' END as status
UNION ALL
SELECT 
  'file_path column' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspace_files' AND column_name = 'file_path') 
    THEN '✅ Exists' ELSE '❌ Missing' END as status;

-- Success message
SELECT '🎉 File storage setup complete! You can now run the migration.' as message;
