// Supabase Workspace Storage Service
// Replaces localStorage with database storage for full collaboration

import { supabase } from './supabaseClient';

class SupabaseWorkspaceStorage {
  constructor() {
    this.cache = new Map(); // Local cache for performance
  }

  // ===== FOLDERS =====
  
  async loadFolders(workspaceId) {
    try {
      const { data, error } = await supabase
        .from('workspace_folders')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading folders:', error);
        return this.getDefaultFolders();
      }

      // Convert database format to app format
      const folders = data.map(folder => ({
        id: folder.id,
        text: folder.name,
        parent: folder.parent_id || 0,
        droppable: true,
        created_at: folder.created_at,
        updated_at: folder.updated_at
      }));

      // Ensure root folder exists
      if (!folders.find(f => f.id === 0)) {
        folders.unshift({
          id: 0,
          text: "All Resources",
          parent: 0,
          droppable: true
        });
      }

      this.cache.set(`folders-${workspaceId}`, folders);
      return folders;
    } catch (error) {
      console.error('Failed to load folders:', error);
      return this.getDefaultFolders();
    }
  }

  async saveFolders(workspaceId, folders) {
    try {
      // Filter out root folder (id: 0) as it's virtual
      const foldersToSave = folders.filter(f => f.id !== 0);
      
      // Delete existing folders for this workspace
      await supabase
        .from('workspace_folders')
        .delete()
        .eq('workspace_id', workspaceId);

      // Insert new folders
      if (foldersToSave.length > 0) {
        const folderData = foldersToSave.map(folder => ({
          id: folder.id,
          workspace_id: workspaceId,
          name: folder.text,
          parent_id: folder.parent === 0 ? null : folder.parent,
          created_at: folder.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('workspace_folders')
          .insert(folderData);

        if (error) {
          console.error('Error saving folders:', error);
          throw error;
        }
      }

      this.cache.set(`folders-${workspaceId}`, folders);
      return true;
    } catch (error) {
      console.error('Failed to save folders:', error);
      throw error;
    }
  }

  // ===== RESOURCES =====

  async loadWorkspaceFiles(workspaceId) {
    try {
      const { data, error } = await supabase
        .from('workspace_files')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading workspace files:', error);
        return [];
      }

      // Convert database format to app format
      const resources = data.map(file => ({
        id: file.id,
        title: file.title || file.name,
        url: file.url || `file://${file.title || file.name}`,
        tags: file.tags ? (Array.isArray(file.tags) ? file.tags : file.tags.split(',').map(t => t.trim())) : [],
        notes: file.notes || file.content || '',
        platform: file.platform || 'local',
        folder: file.folder || file.folder_id || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
        file_type: file.file_type,
        file_size: file.file_size
      }));

      this.cache.set(`resources-${workspaceId}`, resources);
      return resources;
    } catch (error) {
      console.error('Failed to load workspace files:', error);
      return [];
    }
  }

  async saveWorkspaceFiles(workspaceId, resources) {
    try {
      // Delete existing resources for this workspace
      await supabase
        .from('workspace_files')
        .delete()
        .eq('workspace_id', workspaceId);

      // Insert new resources
      if (resources.length > 0) {
        const resourceData = resources.map(resource => ({
          // Don't set id - let Supabase generate it
          workspace_id: workspaceId,
          title: resource.title,
          name: resource.title, // Keep both for compatibility
          url: resource.url,
          notes: resource.notes || '',
          content: resource.notes || '', // Keep both for compatibility
          tags: Array.isArray(resource.tags) ? resource.tags.join(',') : (resource.tags || ''),
          platform: resource.platform || 'local',
          folder: resource.folder === 0 ? null : resource.folder,
          folder_id: resource.folder === 0 ? null : resource.folder, // Keep both for compatibility
          file_type: this.getFileTypeFromName(resource.title),
          file_size: resource.file_size || 0,
          created_at: resource.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null // Set to null for now, or get from auth context
        }));

        const { error } = await supabase
          .from('workspace_files')
          .insert(resourceData);

        if (error) {
          console.error('Error saving workspace files:', error);
          throw error;
        }
      }

      this.cache.set(`resources-${workspaceId}`, resources);
      return true;
    } catch (error) {
      console.error('Failed to save workspace files:', error);
      throw error;
    }
  }

  // ===== INDIVIDUAL OPERATIONS =====

  async addFolder(workspaceId, folder) {
    try {
      const folderData = {
        id: folder.id,
        workspace_id: workspaceId,
        name: folder.text,
        parent_id: folder.parent === 0 ? null : folder.parent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('workspace_folders')
        .insert([folderData]);

      if (error) {
        console.error('Error adding folder:', error);
        throw error;
      }

      // Update cache
      const cachedFolders = this.cache.get(`folders-${workspaceId}`) || [];
      this.cache.set(`folders-${workspaceId}`, [...cachedFolders, folder]);

      return true;
    } catch (error) {
      console.error('Failed to add folder:', error);
      throw error;
    }
  }

  async updateFolder(workspaceId, folderId, updates) {
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (updates.text) updateData.name = updates.text;
      if (updates.parent !== undefined) updateData.parent_id = updates.parent === 0 ? null : updates.parent;

      const { error } = await supabase
        .from('workspace_folders')
        .update(updateData)
        .eq('id', folderId)
        .eq('workspace_id', workspaceId);

      if (error) {
        console.error('Error updating folder:', error);
        throw error;
      }

      // Update cache
      const cachedFolders = this.cache.get(`folders-${workspaceId}`) || [];
      const updatedFolders = cachedFolders.map(f => 
        f.id === folderId ? { ...f, ...updates } : f
      );
      this.cache.set(`folders-${workspaceId}`, updatedFolders);

      return true;
    } catch (error) {
      console.error('Failed to update folder:', error);
      throw error;
    }
  }

  async deleteFolder(workspaceId, folderId) {
    try {
      // Delete folder and all its files
      await supabase
        .from('workspace_files')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('folder_id', folderId);

      await supabase
        .from('workspace_folders')
        .delete()
        .eq('id', folderId)
        .eq('workspace_id', workspaceId);

      // Update cache
      const cachedFolders = this.cache.get(`folders-${workspaceId}`) || [];
      const cachedResources = this.cache.get(`resources-${workspaceId}`) || [];
      
      this.cache.set(`folders-${workspaceId}`, cachedFolders.filter(f => f.id !== folderId));
      this.cache.set(`resources-${workspaceId}`, cachedResources.filter(r => r.folder !== folderId));

      return true;
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  }

  async addResource(workspaceId, resource) {
    try {
      const resourceData = {
        id: resource.id,
        workspace_id: workspaceId,
        name: resource.title,
        url: resource.url,
        content: resource.notes || '',
        tags: Array.isArray(resource.tags) ? resource.tags.join(',') : (resource.tags || ''),
        platform: resource.platform || 'local',
        folder_id: resource.folder === 0 ? null : resource.folder,
        file_type: this.getFileTypeFromName(resource.title),
        file_size: resource.file_size || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('workspace_files')
        .insert([resourceData]);

      if (error) {
        console.error('Error adding resource:', error);
        throw error;
      }

      // Update cache
      const cachedResources = this.cache.get(`resources-${workspaceId}`) || [];
      this.cache.set(`resources-${workspaceId}`, [...cachedResources, resource]);

      return true;
    } catch (error) {
      console.error('Failed to add resource:', error);
      throw error;
    }
  }

  async updateResource(workspaceId, resourceId, updates) {
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (updates.title) updateData.name = updates.title;
      if (updates.url) updateData.url = updates.url;
      if (updates.notes !== undefined) updateData.content = updates.notes;
      if (updates.tags) updateData.tags = Array.isArray(updates.tags) ? updates.tags.join(',') : updates.tags;
      if (updates.platform) updateData.platform = updates.platform;
      if (updates.folder !== undefined) updateData.folder_id = updates.folder === 0 ? null : updates.folder;

      const { error } = await supabase
        .from('workspace_files')
        .update(updateData)
        .eq('id', resourceId)
        .eq('workspace_id', workspaceId);

      if (error) {
        console.error('Error updating resource:', error);
        throw error;
      }

      // Update cache
      const cachedResources = this.cache.get(`resources-${workspaceId}`) || [];
      const updatedResources = cachedResources.map(r => 
        r.id === resourceId ? { ...r, ...updates } : r
      );
      this.cache.set(`resources-${workspaceId}`, updatedResources);

      return true;
    } catch (error) {
      console.error('Failed to update resource:', error);
      throw error;
    }
  }

  async deleteResource(workspaceId, resourceId) {
    try {
      const { error } = await supabase
        .from('workspace_files')
        .delete()
        .eq('id', resourceId)
        .eq('workspace_id', workspaceId);

      if (error) {
        console.error('Error deleting resource:', error);
        throw error;
      }

      // Update cache
      const cachedResources = this.cache.get(`resources-${workspaceId}`) || [];
      this.cache.set(`resources-${workspaceId}`, cachedResources.filter(r => r.id !== resourceId));

      return true;
    } catch (error) {
      console.error('Failed to delete resource:', error);
      throw error;
    }
  }

  // ===== BATCH OPERATIONS =====

  async addMultipleFolders(workspaceId, folders) {
    try {
      const foldersToSave = folders.filter(f => f.id !== 0);
      
      if (foldersToSave.length === 0) return true;

      const folderData = foldersToSave.map(folder => ({
        id: folder.id,
        workspace_id: workspaceId,
        name: folder.text,
        parent_id: folder.parent === 0 ? null : folder.parent,
        created_at: folder.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('workspace_folders')
        .insert(folderData);

      if (error) {
        console.error('Error adding multiple folders:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to add multiple folders:', error);
      throw error;
    }
  }

  async addMultipleResources(workspaceId, resources) {
    try {
      if (resources.length === 0) return true;

      const resourceData = resources.map(resource => ({
        id: resource.id,
        workspace_id: workspaceId,
        name: resource.title,
        url: resource.url,
        content: resource.notes || '',
        tags: Array.isArray(resource.tags) ? resource.tags.join(',') : (resource.tags || ''),
        platform: resource.platform || 'local',
        folder_id: resource.folder === 0 ? null : resource.folder,
        file_type: this.getFileTypeFromName(resource.title),
        file_size: resource.file_size || 0,
        created_at: resource.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('workspace_files')
        .insert(resourceData);

      if (error) {
        console.error('Error adding multiple resources:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to add multiple resources:', error);
      throw error;
    }
  }

  // ===== MIGRATION FROM LOCALSTORAGE =====

  async migrateFromLocalStorage(workspaceId) {
    try {
      console.log(`Starting migration for workspace ${workspaceId}`);

      // Load existing data from localStorage
      const localFolders = this.loadFromLocalStorage(`folders-${workspaceId}`, []);
      const localResources = this.loadFromLocalStorage(`resources-${workspaceId}`, []);

      console.log(`Found ${localFolders.length} folders and ${localResources.length} resources in localStorage`);

      if (localFolders.length === 0 && localResources.length === 0) {
        console.log('No data to migrate');
        return { success: true, message: 'No data to migrate' };
      }

      // Check if data already exists in Supabase
      const existingFolders = await this.loadFolders(workspaceId);
      const existingResources = await this.loadWorkspaceFiles(workspaceId);

      if (existingFolders.length > 1 || existingResources.length > 0) {
        console.log('Data already exists in Supabase, skipping migration');
        return { success: true, message: 'Data already exists in Supabase' };
      }

      // Migrate folders
      if (localFolders.length > 0) {
        await this.addMultipleFolders(workspaceId, localFolders);
        console.log(`Migrated ${localFolders.length} folders`);
      }

      // Migrate resources
      if (localResources.length > 0) {
        await this.addMultipleResources(workspaceId, localResources);
        console.log(`Migrated ${localResources.length} resources`);
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(`folders-${workspaceId}`);
      localStorage.removeItem(`resources-${workspaceId}`);

      console.log('Migration completed successfully');
      return { 
        success: true, 
        message: `Successfully migrated ${localFolders.length} folders and ${localResources.length} resources` 
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return { 
        success: false, 
        message: `Migration failed: ${error.message}` 
      };
    }
  }

  // ===== REAL-TIME SYNC =====

  setupRealtimeSync(workspaceId, onFoldersChange, onResourcesChange) {
    // Subscribe to folder changes
    const foldersSubscription = supabase
      .channel(`workspace-folders-${workspaceId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'workspace_folders',
          filter: `workspace_id=eq.${workspaceId}`
        }, 
        async (payload) => {
          console.log('Folders changed:', payload);
          const updatedFolders = await this.loadFolders(workspaceId);
          onFoldersChange(updatedFolders);
        }
      )
      .subscribe();

    // Subscribe to resource changes
    const resourcesSubscription = supabase
      .channel(`workspace-files-${workspaceId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'workspace_files',
          filter: `workspace_id=eq.${workspaceId}`
        }, 
        async (payload) => {
          console.log('Resources changed:', payload);
          const updatedResources = await this.loadWorkspaceFiles(workspaceId);
          onResourcesChange(updatedResources);
        }
      )
      .subscribe();

    return () => {
      foldersSubscription.unsubscribe();
      resourcesSubscription.unsubscribe();
    };
  }

  // ===== UTILITY METHODS =====

  getDefaultFolders() {
    return [{
      id: 0,
      text: "All Resources",
      parent: 0,
      droppable: true
    }];
  }

  loadFromLocalStorage(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  }

  getFileTypeFromName(fileName) {
    if (!fileName) return 'unknown';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    const typeMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'txt': 'text',
      'pdf': 'pdf',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'gif': 'image',
      'svg': 'image'
    };

    return typeMap[extension] || 'unknown';
  }

  // ===== SEARCH =====

  async searchWorkspace(workspaceId, query) {
    try {
      const { data, error } = await supabase
        .from('workspace_files')
        .select('*')
        .eq('workspace_id', workspaceId)
        .or(`name.ilike.%${query}%,content.ilike.%${query}%,tags.ilike.%${query}%`);

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      return data.map(file => ({
        id: file.id,
        title: file.name,
        url: file.url,
        tags: file.tags ? file.tags.split(',').map(t => t.trim()) : [],
        notes: file.content || '',
        platform: file.platform || 'local',
        folder: file.folder_id || 0,
        file_type: file.file_type,
        file_size: file.file_size
      }));
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  // ===== WORKSPACE STATISTICS =====

  async getWorkspaceStats(workspaceId) {
    try {
      const { data: folderCount } = await supabase
        .from('workspace_folders')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId);

      const { data: fileCount } = await supabase
        .from('workspace_files')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId);

      const { data: files } = await supabase
        .from('workspace_files')
        .select('file_size, file_type')
        .eq('workspace_id', workspaceId);

      const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      const fileTypes = {};
      files?.forEach(file => {
        const type = file.file_type || 'unknown';
        fileTypes[type] = (fileTypes[type] || 0) + 1;
      });

      return {
        folders: folderCount?.length || 0,
        files: fileCount?.length || 0,
        totalSize,
        fileTypes
      };
    } catch (error) {
      console.error('Failed to get workspace stats:', error);
      return { folders: 0, files: 0, totalSize: 0, fileTypes: {} };
    }
  }

  // ===== CACHE MANAGEMENT =====

  clearCache(workspaceId = null) {
    if (workspaceId) {
      this.cache.delete(`folders-${workspaceId}`);
      this.cache.delete(`resources-${workspaceId}`);
    } else {
      this.cache.clear();
    }
  }

  // ===== BACKUP & EXPORT =====

  async exportWorkspace(workspaceId) {
    try {
      const folders = await this.loadFolders(workspaceId);
      const resources = await this.loadWorkspaceFiles(workspaceId);

      return {
        workspaceId,
        exportedAt: new Date().toISOString(),
        folders,
        resources
      };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  async importWorkspace(workspaceId, data) {
    try {
      if (data.folders) {
        await this.saveFolders(workspaceId, data.folders);
      }
      
      if (data.resources) {
        await this.saveWorkspaceFiles(workspaceId, data.resources);
      }

      return { success: true };
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
const supabaseWorkspaceStorage = new SupabaseWorkspaceStorage();

export default supabaseWorkspaceStorage;
export { SupabaseWorkspaceStorage };
