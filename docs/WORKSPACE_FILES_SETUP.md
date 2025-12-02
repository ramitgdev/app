# Workspace Files Setup Guide

This guide will help you implement proper file storage for shared workspaces so that files appear for all collaborators.

## The Problem

Currently, when you share a workspace, only the workspace metadata is shared. The actual files are stored locally in the browser's memory and don't appear for other users who access the shared workspace.

## The Solution

We need to:
1. Add database tables for storing workspace files
2. Update the file operations to use the database
3. Modify the file explorer to load files from the database

## Setup Steps

### Step 1: Update Database Schema

Run the `database/scripts/supabase-workspace-files.sql` script in your Supabase SQL Editor:

```sql
-- Copy and paste the entire database/scripts/supabase-workspace-files.sql file
-- This will create the workspace_files and workspace_folders tables
```

### Step 2: Update Your App.js

You need to modify your main App.js file to use the new file operations. Here are the key changes:

#### Import the new file operations:

```javascript
import { 
  loadWorkspaceData, 
  createWorkspaceFile, 
  updateWorkspaceFile, 
  deleteWorkspaceFile,
  syncWorkspaceFiles 
} from './workspace-file-operations';
```

#### Update the workspace selection logic:

```javascript
// When a workspace is selected, load its files from the database
const handleWorkspaceSelect = async (workspace) => {
  setSelectedWksp(workspace);
  
  // Load files and folders from database
  const result = await loadWorkspaceData(workspace.id);
  if (result.success) {
    // Convert database files to local format
    const localFiles = result.files.map(convertDatabaseFileToLocal);
    const localFolders = result.folders || [];
    
    // Update the workspace with loaded data
    setSelectedWksp(prev => ({
      ...prev,
      resources: localFiles,
      folders: localFolders
    }));
  } else {
    console.error('Failed to load workspace data:', result.error);
  }
};
```

#### Update file creation:

```javascript
onCreateNewFile={async (fileData) => {
  if (!selectedWksp) return;
  
  const newFile = {
    id: Date.now() + Math.random(),
    title: fileData.fileName,
    notes: fileData.initialContent,
    platform: 'Local',
    folder: 0, // Use root folder ID (0)
    folderName: fileData.folder,
    createdAt: new Date().toISOString(),
    type: 'file'
  };

  // Save to database
  const result = await createWorkspaceFile(selectedWksp.id, {
    title: newFile.title,
    notes: newFile.notes,
    folder: newFile.folder,
    folder_name: newFile.folderName
  });

  if (result.success) {
    // Update local state
    setSelectedWksp(prev => ({
      ...prev,
      resources: [...(prev.resources || []), newFile]
    }));

    // Auto-open in IDE
    if (fileData.openInIDE) {
      setSelectedResource(newFile);
    }
  } else {
    console.error('Failed to create file:', result.error);
  }
}}
```

#### Update file editing:

```javascript
const editResource = async (resourceId, updates) => {
  if (!selectedWksp) return;
  
  // Update in database
  const result = await updateWorkspaceFile(resourceId, updates);
  
  if (result.success) {
    // Update local state
    setSelectedWksp(prev => ({
      ...prev,
      resources: prev.resources.map(r => 
        r.id === resourceId ? { ...r, ...updates } : r
      )
    }));
  } else {
    console.error('Failed to update file:', result.error);
  }
};
```

#### Update file deletion:

```javascript
const removeResource = async (resourceId) => {
  if (!selectedWksp) return;
  
  // Delete from database
  const result = await deleteWorkspaceFile(resourceId);
  
  if (result.success) {
    // Update local state
    setSelectedWksp(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== resourceId)
    }));
  } else {
    console.error('Failed to delete file:', result.error);
  }
};
```

### Step 3: Sync Existing Files

If you have existing files in local storage that you want to sync to the database, you can use the sync function:

```javascript
// Sync existing local files to database
const syncExistingFiles = async () => {
  if (!selectedWksp || !selectedWksp.resources) return;
  
  const result = await syncWorkspaceFiles(selectedWksp.id, selectedWksp.resources);
  if (result.success) {
    console.log('Files synced successfully');
  } else {
    console.error('Failed to sync files:', result.error);
  }
};
```

### Step 4: Test the Implementation

1. **Create a workspace** and add some files
2. **Share the workspace** with another user
3. **Accept the invitation** from the other account
4. **Verify that files appear** in the file explorer for the shared workspace

## Key Benefits

✅ **Files are now shared** - All collaborators can see the same files
✅ **Real-time updates** - Changes are saved to the database
✅ **Persistent storage** - Files survive browser refreshes and device changes
✅ **Proper permissions** - Only workspace members can access files
✅ **Scalable** - Can handle large numbers of files and users

## Troubleshooting

### Files still don't appear
- Check that the database tables were created successfully
- Verify that the user has proper permissions (workspace member)
- Check browser console for any errors

### Permission errors
- Make sure the RLS policies are working correctly
- Verify that the user is authenticated
- Check that the workspace membership status is 'accepted'

### Performance issues
- The database includes indexes for better performance
- Consider pagination for workspaces with many files
- Use the helper functions for bulk operations

## Next Steps

Once this is working, you can enhance it further:

1. **Real-time updates** - Use Supabase subscriptions for live file updates
2. **File versioning** - Track file changes over time
3. **File sharing** - Share individual files within workspaces
4. **File search** - Add search functionality across workspace files
5. **File preview** - Add preview capabilities for different file types
