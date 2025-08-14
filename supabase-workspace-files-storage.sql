-- Enhanced workspace_files table with file storage support
-- Run this in your Supabase SQL editor

-- First, let's add the missing columns to workspace_files table
ALTER TABLE workspace_files 
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/plain',
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_with TEXT[];

-- Create storage bucket for workspace files
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-files', 'workspace-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
CREATE POLICY "Users can upload files to their workspaces" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'workspace-files' AND
  auth.uid()::text = (storage.foldername(name))[1] OR
  EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE w.id::text = (storage.foldername(name))[2] AND
    (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
    wm.status = 'active'
  )
);

CREATE POLICY "Users can view files from their workspaces" ON storage.objects
FOR SELECT USING (
  bucket_id = 'workspace-files' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN workspaces w ON w.id = wm.workspace_id
      WHERE w.id::text = (storage.foldername(name))[2] AND
      (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
      wm.status = 'active'
    )
  )
);

CREATE POLICY "Users can update files in their workspaces" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'workspace-files' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN workspaces w ON w.id = wm.workspace_id
      WHERE w.id::text = (storage.foldername(name))[2] AND
      (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
      wm.status = 'active'
    )
  )
);

CREATE POLICY "Users can delete files from their workspaces" ON storage.objects
FOR DELETE USING (
  bucket_id = 'workspace-files' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN workspaces w ON w.id = wm.workspace_id
      WHERE w.id::text = (storage.foldername(name))[2] AND
      (wm.user_id = auth.uid() OR w.owner_id = auth.uid()) AND
      wm.status = 'active'
    )
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace_id ON workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_created_by ON workspace_files(created_by);
CREATE INDEX IF NOT EXISTS idx_workspace_files_file_path ON workspace_files(file_path);
CREATE INDEX IF NOT EXISTS idx_workspace_files_folder ON workspace_files(folder);

-- Create a function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_files()
RETURNS void AS $$
BEGIN
  -- Delete storage objects that don't have corresponding database records
  DELETE FROM storage.objects 
  WHERE bucket_id = 'workspace-files' 
  AND NOT EXISTS (
    SELECT 1 FROM workspace_files 
    WHERE file_path = storage.objects.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get workspace storage usage
CREATE OR REPLACE FUNCTION get_workspace_storage_usage(workspace_id_param UUID)
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  file_types JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_files,
    COALESCE(SUM(file_size), 0)::BIGINT as total_size,
    COALESCE(
      jsonb_object_agg(
        COALESCE(mime_type, 'unknown'), 
        file_count
      ), 
      '{}'::jsonb
    ) as file_types
  FROM (
    SELECT 
      mime_type,
      COUNT(*) as file_count,
      file_size
    FROM workspace_files 
    WHERE workspace_id = workspace_id_param
    GROUP BY mime_type, file_size
  ) grouped_files;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Update RLS policies for workspace_files table to include file operations
DROP POLICY IF EXISTS "Users can view workspace files they have access to" ON workspace_files;
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

DROP POLICY IF EXISTS "Users can insert files to workspaces they have access to" ON workspace_files;
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

DROP POLICY IF EXISTS "Users can update files in workspaces they have access to" ON workspace_files;
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

DROP POLICY IF EXISTS "Users can delete files from workspaces they have access to" ON workspace_files;
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

-- Create a trigger to automatically clean up storage files when database records are deleted
CREATE OR REPLACE FUNCTION cleanup_storage_file()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the corresponding storage file
  IF OLD.file_path IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'workspace-files' 
    AND name = OLD.file_path;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS cleanup_storage_file_trigger ON workspace_files;
CREATE TRIGGER cleanup_storage_file_trigger
  AFTER DELETE ON workspace_files
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_storage_file();

-- Add some helpful comments
COMMENT ON COLUMN workspace_files.file_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN workspace_files.file_url IS 'Public URL for accessing the file';
COMMENT ON COLUMN workspace_files.file_size IS 'File size in bytes';
COMMENT ON COLUMN workspace_files.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN workspace_files.is_shared IS 'Whether file is shared with other users';
COMMENT ON COLUMN workspace_files.shared_with IS 'Array of user IDs who have access to this file';

-- Create a view for easy file access with user information
CREATE OR REPLACE VIEW workspace_files_with_users AS
SELECT 
  wf.*,
  u.email as created_by_email,
  u.full_name as created_by_name,
  w.name as workspace_name
FROM workspace_files wf
LEFT JOIN auth.users u ON u.id = wf.created_by
LEFT JOIN workspaces w ON w.id = wf.workspace_id;

-- Grant access to the view
GRANT SELECT ON workspace_files_with_users TO authenticated;

-- Note: RLS policies cannot be applied to views directly
-- The view inherits security from the underlying tables

-- Final verification query to check if everything is set up correctly
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
    THEN '✅ Exists' ELSE '❌ Missing' END as status
UNION ALL
SELECT 
  'Storage policies' as component,
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%workspace%') 
    THEN '✅ Configured' ELSE '❌ Missing' END as status;
