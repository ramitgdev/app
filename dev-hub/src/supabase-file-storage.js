// Supabase File Storage Integration
// Connects file storage with workspace_files table and Supabase Storage

import { supabase } from './supabaseClient';
import storageService from './storage-service';

class SupabaseFileStorage {
  constructor() {
    this.bucket = 'workspace-files';
  }

  // Save file content to both Supabase Storage and workspace_files table
  async saveFile(workspaceId, fileData) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Create file blob from content
      const blob = new Blob([fileData.content || ''], { 
        type: this.getMimeType(fileData.title) 
      });
      
      // Generate unique file path
      const filePath = `workspaces/${workspaceId}/files/${Date.now()}_${fileData.title}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      // Save metadata to workspace_files table
      const { data: fileRecord, error: dbError } = await supabase
        .from('workspace_files')
        .insert([{
          workspace_id: workspaceId,
          title: fileData.title,
          notes: fileData.content || '',
          platform: fileData.platform || 'Supabase',
          folder: fileData.folder || 0,
          folder_name: fileData.folderName || 'All Resources',
          type: fileData.type || 'file',
          file_path: filePath,
          file_url: publicUrl,
          file_size: blob.size,
          mime_type: this.getMimeType(fileData.title),
          created_by: user.user.id
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Try to clean up uploaded file
        await supabase.storage.from(this.bucket).remove([filePath]);
        throw dbError;
      }

      return {
        success: true,
        file: fileRecord,
        url: publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('Error saving file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Load file content from Supabase Storage
  async loadFile(workspaceId, fileId) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get file metadata from database
      const { data: fileRecord, error: dbError } = await supabase
        .from('workspace_files')
        .select('*')
        .eq('id', fileId)
        .eq('workspace_id', workspaceId)
        .single();

      if (dbError) throw dbError;

      // If file has storage path, download from Supabase Storage
      if (fileRecord.file_path) {
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from(this.bucket)
          .download(fileRecord.file_path);

        if (downloadError) {
          console.warn('Storage download failed, using database content:', downloadError);
          // Fallback to database content
          return {
            success: true,
            content: fileRecord.notes || '',
            file: fileRecord
          };
        }

        // Convert blob to text
        const content = await fileBlob.text();
        return {
          success: true,
          content: content,
          file: fileRecord
        };
      } else {
        // Use content from database (legacy files)
        return {
          success: true,
          content: fileRecord.notes || '',
          file: fileRecord
        };
      }

    } catch (error) {
      console.error('Error loading file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update file content
  async updateFile(workspaceId, fileId, newContent) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get current file record
      const { data: fileRecord, error: getError } = await supabase
        .from('workspace_files')
        .select('*')
        .eq('id', fileId)
        .eq('workspace_id', workspaceId)
        .single();

      if (getError) throw getError;

      // Create new blob with updated content
      const blob = new Blob([newContent], { 
        type: this.getMimeType(fileRecord.title) 
      });

      let filePath = fileRecord.file_path;
      let publicUrl = fileRecord.file_url;

      // If file doesn't have storage path, create one
      if (!filePath) {
        filePath = `workspaces/${workspaceId}/files/${Date.now()}_${fileRecord.title}`;
      }

      // Upload updated content to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true // This will overwrite existing file
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get updated public URL
      const { data: { publicUrl: newPublicUrl } } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      // Update database record
      const { data: updatedRecord, error: updateError } = await supabase
        .from('workspace_files')
        .update({
          notes: newContent,
          file_path: filePath,
          file_url: newPublicUrl,
          file_size: blob.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        success: true,
        file: updatedRecord
      };

    } catch (error) {
      console.error('Error updating file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from both storage and database
  async deleteFile(workspaceId, fileId) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get file record first
      const { data: fileRecord, error: getError } = await supabase
        .from('workspace_files')
        .select('*')
        .eq('id', fileId)
        .eq('workspace_id', workspaceId)
        .single();

      if (getError) throw getError;

      // Delete from storage if file path exists
      if (fileRecord.file_path) {
        const { error: storageError } = await supabase.storage
          .from(this.bucket)
          .remove([fileRecord.file_path]);

        if (storageError) {
          console.warn('Storage deletion failed:', storageError);
          // Continue with database deletion even if storage fails
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('workspace_files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      return {
        success: true
      };

    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List all files in workspace
  async listFiles(workspaceId) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: files, error } = await supabase
        .from('workspace_files')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        files: files || []
      };

    } catch (error) {
      console.error('Error listing files:', error);
      return {
        success: false,
        error: error.message,
        files: []
      };
    }
  }

  // Migrate existing localStorage files to Supabase
  async migrateLocalFiles(workspaceId, localFiles) {
    const results = [];
    
    for (const localFile of localFiles) {
      try {
        const result = await this.saveFile(workspaceId, {
          title: localFile.title,
          content: localFile.notes || localFile.content || '',
          platform: localFile.platform || 'Migrated',
          folder: localFile.folder || 0,
          folderName: localFile.folderName || 'All Resources',
          type: localFile.type || 'file'
        });
        
        results.push({
          original: localFile,
          result: result,
          success: result.success
        });
      } catch (error) {
        results.push({
          original: localFile,
          result: { success: false, error: error.message },
          success: false
        });
      }
    }

    return results;
  }

  // Get MIME type from file extension
  getMimeType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'js': 'application/javascript',
      'jsx': 'application/javascript',
      'ts': 'application/typescript',
      'tsx': 'application/typescript',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'py': 'text/x-python',
      'java': 'text/x-java-source',
      'cpp': 'text/x-c++src',
      'c': 'text/x-csrc',
      'xml': 'application/xml',
      'yaml': 'application/x-yaml',
      'yml': 'application/x-yaml'
    };
    
    return mimeTypes[ext] || 'text/plain';
  }

  // Check storage usage
  async getStorageStats(workspaceId) {
    try {
      const { data: files, error } = await supabase
        .from('workspace_files')
        .select('file_size, mime_type, created_at')
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + (file.file_size || 0), 0),
        byType: {},
        byMonth: {}
      };

      files.forEach(file => {
        // Count by type
        const type = file.mime_type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Count by month
        const month = new Date(file.created_at).toISOString().substring(0, 7);
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      });

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const supabaseFileStorage = new SupabaseFileStorage();
export default supabaseFileStorage;
