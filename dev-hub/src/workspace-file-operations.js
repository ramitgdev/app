// Workspace File Operations for React App
// Import this into your components and use these functions

import { supabase } from './supabaseClient';

// ============================================
// WORKSPACE FILE OPERATIONS
// ============================================

export const getWorkspaceFiles = async (workspaceId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, files: data };
  } catch (error) {
    console.error('Error fetching workspace files:', error);
    return { success: false, error: error.message };
  }
};

export const createWorkspaceFile = async (workspaceId, fileData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_files')
      .insert([
        {
          workspace_id: workspaceId,
          title: fileData.title,
          notes: fileData.notes || '',
          platform: fileData.platform || 'Local',
          folder: fileData.folder || 0,
          folder_name: fileData.folder_name,
          type: fileData.type || 'file',
          created_by: user.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    console.log('File created:', data);
    return { success: true, file: data };
  } catch (error) {
    console.error('Error creating file:', error);
    return { success: false, error: error.message };
  }
};

export const updateWorkspaceFile = async (fileId, updates) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_files')
      .update({
        title: updates.title,
        notes: updates.notes,
        folder: updates.folder,
        folder_name: updates.folder_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('File updated:', data);
    return { success: true, file: data };
  } catch (error) {
    console.error('Error updating file:', error);
    return { success: false, error: error.message };
  }
};

export const deleteWorkspaceFile = async (fileId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('workspace_files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
    
    console.log('File deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// WORKSPACE FOLDER OPERATIONS
// ============================================

export const getWorkspaceFolders = async (workspaceId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_folders')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name', { ascending: true });

    if (error) throw error;
    
    return { success: true, folders: data };
  } catch (error) {
    console.error('Error fetching workspace folders:', error);
    return { success: false, error: error.message };
  }
};

export const createWorkspaceFolder = async (workspaceId, folderData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_folders')
      .insert([
        {
          workspace_id: workspaceId,
          name: folderData.name,
          parent_id: folderData.parent_id || null,
          created_by: user.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    console.log('Folder created:', data);
    return { success: true, folder: data };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, error: error.message };
  }
};

export const updateWorkspaceFolder = async (folderId, updates) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_folders')
      .update({
        name: updates.name,
        parent_id: updates.parent_id
      })
      .eq('id', folderId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('Folder updated:', data);
    return { success: true, folder: data };
  } catch (error) {
    console.error('Error updating folder:', error);
    return { success: false, error: error.message };
  }
};

export const deleteWorkspaceFolder = async (folderId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('workspace_folders')
      .delete()
      .eq('id', folderId);

    if (error) throw error;
    
    console.log('Folder deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting folder:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BULK OPERATIONS
// ============================================

export const syncWorkspaceFiles = async (workspaceId, localFiles) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get existing files from database
    const { data: existingFiles } = await supabase
      .from('workspace_files')
      .select('id, title')
      .eq('workspace_id', workspaceId);

    const existingFileTitles = existingFiles?.map(f => f.title) || [];

    // Filter out files that already exist
    const newFiles = localFiles.filter(file => !existingFileTitles.includes(file.title));

    if (newFiles.length === 0) {
      return { success: true, message: 'No new files to sync' };
    }

    // Insert new files
    const { data, error } = await supabase
      .from('workspace_files')
      .insert(
        newFiles.map(file => ({
          workspace_id: workspaceId,
          title: file.title,
          notes: file.notes || '',
          platform: file.platform || 'Local',
          folder: file.folder || 0,
          folder_name: file.folder_name,
          type: file.type || 'file',
          created_by: user.user.id
        }))
      )
      .select();

    if (error) throw error;
    
    console.log(`Synced ${data.length} files to workspace`);
    return { success: true, files: data };
  } catch (error) {
    console.error('Error syncing files:', error);
    return { success: false, error: error.message };
  }
};

export const loadWorkspaceData = async (workspaceId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get both files and folders in parallel
    const [filesResult, foldersResult] = await Promise.all([
      getWorkspaceFiles(workspaceId),
      getWorkspaceFolders(workspaceId)
    ]);

    if (!filesResult.success) throw new Error(filesResult.error);
    if (!foldersResult.success) throw new Error(foldersResult.error);

    return {
      success: true,
      files: filesResult.files,
      folders: foldersResult.folders
    };
  } catch (error) {
    console.error('Error loading workspace data:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const convertLocalFileToDatabase = (localFile, workspaceId) => {
  return {
    workspace_id: workspaceId,
    title: localFile.title,
    notes: localFile.notes || '',
    platform: localFile.platform || 'Local',
    folder: localFile.folder || 0,
    folder_name: localFile.folder_name,
    type: localFile.type || 'file'
  };
};

export const convertDatabaseFileToLocal = (dbFile) => {
  return {
    id: dbFile.id,
    title: dbFile.title,
    notes: dbFile.notes,
    platform: dbFile.platform,
    folder: dbFile.folder,
    folderName: dbFile.folder_name,
    type: dbFile.type,
    createdAt: dbFile.created_at,
    updatedAt: dbFile.updated_at
  };
};
