# Supabase File Storage Setup Guide

This guide will help you migrate from localStorage to Supabase Storage to solve the "Storage quota exceeded" error and enable file sharing between workspace collaborators.

## Problem Analysis

The error you're seeing occurs because:
1. **Browser Storage Limits**: localStorage has a ~5-10MB limit per domain
2. **Large File Content**: Code files, especially with comments and content, can quickly exceed this limit
3. **No Sharing**: localStorage is per-browser, so collaborators can't see files

## Solution Overview

We're implementing a hybrid approach:
- **Supabase Storage**: For actual file content (unlimited, shareable)
- **Database Records**: For metadata and quick access
- **Automatic Migration**: Move existing localStorage files to Supabase

## Setup Steps

### 1. Run the Database Schema Update

Execute this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase-workspace-files-storage.sql
```

This will:
- Add file storage columns to `workspace_files` table
- Create the `workspace-files` storage bucket
- Set up proper RLS policies for file sharing
- Add indexes for performance

### 2. Update Your App.js

Add the migration component to handle the transition:

```javascript
import SupabaseFileMigration from './SupabaseFileMigration';
import supabaseFileStorage from './supabase-file-storage';

// Add state for migration
const [showMigration, setShowMigration] = useState(false);
const [migrationComplete, setMigrationComplete] = useState(false);

// Check if migration is needed (add this in useEffect)
useEffect(() => {
  const checkMigrationNeeded = async () => {
    if (currentWorkspace && !migrationComplete) {
      // Check if there are local files that need migration
      const localFiles = resources.filter(r => r.notes && r.notes.trim().length > 0);
      if (localFiles.length > 0) {
        // Check if files already exist in Supabase
        const result = await supabaseFileStorage.listFiles(currentWorkspace.id);
        if (result.success && result.files.length === 0) {
          setShowMigration(true);
        }
      }
    }
  };
  
  checkMigrationNeeded();
}, [currentWorkspace, resources, migrationComplete]);

// Add migration dialog to your render
<SupabaseFileMigration
  open={showMigration}
  onClose={() => setShowMigration(false)}
  workspaceId={currentWorkspace?.id}
  localResources={resources}
  onMigrationComplete={(results) => {
    console.log('Migration completed:', results);
    setMigrationComplete(true);
    setShowMigration(false);
    // Refresh resources from Supabase
    loadWorkspaceFiles();
  }}
/>
```

### 3. Update File Operations

Replace localStorage operations with Supabase operations:

```javascript
// Instead of localStorage.setItem()
const saveFileToSupabase = async (fileData) => {
  const result = await supabaseFileStorage.saveFile(currentWorkspace.id, fileData);
  if (result.success) {
    // Update local state
    setResources(prev => [...prev, result.file]);
  }
  return result;
};

// Instead of localStorage.getItem()
const loadFileFromSupabase = async (fileId) => {
  const result = await supabaseFileStorage.loadFile(currentWorkspace.id, fileId);
  return result.success ? result.content : '';
};

// Update file content
const updateFileInSupabase = async (fileId, newContent) => {
  const result = await supabaseFileStorage.updateFile(currentWorkspace.id, fileId, newContent);
  if (result.success) {
    // Update local state
    setResources(prev => prev.map(r => 
      r.id === fileId ? { ...r, notes: newContent } : r
    ));
  }
  return result;
};
```

### 4. Load Files from Supabase

Add a function to load workspace files:

```javascript
const loadWorkspaceFiles = async () => {
  if (!currentWorkspace) return;
  
  const result = await supabaseFileStorage.listFiles(currentWorkspace.id);
  if (result.success) {
    setResources(result.files);
  }
};

// Call this when workspace changes
useEffect(() => {
  if (currentWorkspace) {
    loadWorkspaceFiles();
  }
}, [currentWorkspace]);
```

## File Sharing Solution

### Why Collaborators See Folders But Not Contents

This happens because:
1. **Workspace Structure**: Shared via `workspace_members` table ✅
2. **File Content**: Still stored in localStorage (per-browser) ❌

### After Migration

1. **Files in Supabase**: All collaborators can access the same files
2. **Real-time Updates**: Changes sync across all users
3. **Proper Permissions**: RLS policies ensure only workspace members can access files

## Testing the Setup

### 1. Verify Database Setup

Run this query in Supabase SQL Editor:

```sql
-- Check if everything is set up correctly
SELECT 
  'workspace_files table' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspace_files') 
    THEN '✅ Exists' ELSE '❌ Missing' END as status
UNION ALL
SELECT 
  'workspace-files bucket' as component,
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'workspace-files') 
    THEN '✅ Exists' ELSE '❌ Missing' END as status;
```

### 2. Test File Upload

```javascript
// Test saving a file
const testFile = {
  title: 'test.js',
  content: 'console.log("Hello Supabase!");',
  platform: 'Test',
  folder: 0,
  folderName: 'All Resources'
};

const result = await supabaseFileStorage.saveFile(workspaceId, testFile);
console.log('Save result:', result);
```

### 3. Test File Sharing

1. Create a file in one browser
2. Open the same workspace in another browser (different user)
3. Verify the file appears for both users

## Migration Process

### Automatic Migration

The `SupabaseFileMigration` component will:

1. **Analyze**: Scan localStorage for files with content
2. **Upload**: Move each file to Supabase Storage
3. **Link**: Create database records linking files to workspace
4. **Verify**: Confirm all files were migrated successfully

### Manual Migration (if needed)

```javascript
// Get all localStorage files
const localFiles = JSON.parse(localStorage.getItem('resources') || '[]');

// Migrate each file
for (const file of localFiles) {
  if (file.notes && file.notes.trim()) {
    const result = await supabaseFileStorage.saveFile(workspaceId, {
      title: file.title,
      content: file.notes,
      platform: file.platform || 'Migrated',
      folder: file.folder || 0,
      folderName: file.folderName || 'All Resources'
    });
    console.log(`Migrated ${file.title}:`, result.success);
  }
}
```

## Storage Benefits

### Before (localStorage)
- ❌ 5-10MB limit per browser
- ❌ No sharing between users
- ❌ Data lost if browser cache cleared
- ❌ No backup/sync

### After (Supabase Storage)
- ✅ Unlimited storage (within Supabase limits)
- ✅ Real-time sharing with collaborators
- ✅ Persistent, backed up data
- ✅ Version control possible
- ✅ File metadata and search
- ✅ Access control via RLS

## Troubleshooting

### Storage Quota Error Persists

1. Clear browser localStorage: `localStorage.clear()`
2. Refresh the page
3. Re-run migration if needed

### Files Not Appearing for Collaborators

1. Check workspace membership in database
2. Verify RLS policies are active
3. Ensure files have correct `workspace_id`

### Migration Fails

1. Check Supabase connection
2. Verify storage bucket exists
3. Check user authentication
4. Review browser console for errors

## Next Steps

1. **Run the SQL setup** in Supabase
2. **Add migration component** to your App.js
3. **Test with a small file** first
4. **Run full migration** when ready
5. **Verify sharing** works with collaborators

The storage quota issue should be completely resolved, and your collaborators will finally be able to see and edit the files in shared workspaces!
