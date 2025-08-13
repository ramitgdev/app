// Storage Service for External File Storage
// Supports multiple cloud providers with fallback options

import { createClient } from '@supabase/supabase-js';

class StorageService {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || process.env.STORAGE_PROVIDER || 'supabase', // 'supabase', 'aws', 'google', 'local'
      bucket: config.bucket || process.env.STORAGE_BUCKET || 'dev-hub-resources',
      region: config.region || 'us-east-1',
      ...config
    };
    
    // Initialize Supabase client if using Supabase
    if (this.config.provider === 'supabase') {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration missing:', {
          url: supabaseUrl ? 'present' : 'missing',
          key: supabaseAnonKey ? 'present' : 'missing'
        });
        throw new Error('Supabase configuration missing. Please check your .env.local file.');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Supabase client initialized successfully');
    }
    
    this.providers = {
      supabase: this.supabaseStorage.bind(this),
      aws: this.awsStorage.bind(this),
      google: this.googleStorage.bind(this),
      local: this.localStorage.bind(this)
    };
  }

  // Main upload method
  async uploadFile(file, path, metadata = {}) {
    try {
      const provider = this.providers[this.config.provider];
      if (!provider) {
        throw new Error(`Unsupported storage provider: ${this.config.provider}`);
      }

      const result = await provider.upload(file, path, metadata);
      
      // Store reference in local storage for offline access
      this.storeFileReference(path, result);
      
      return {
        success: true,
        url: result.url,
        path: result.path,
        size: result.size,
        provider: this.config.provider,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Fallback to local storage
      if (this.config.provider !== 'local') {
        console.log('Falling back to local storage...');
        return this.uploadFile(file, path, metadata, 'local');
      }
      
      throw error;
    }
  }

  // Main download method
  async downloadFile(path) {
    try {
      const provider = this.providers[this.config.provider];
      const result = await provider.download(path);
      
      return {
        success: true,
        blob: result.blob,
        url: result.url,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(path) {
    try {
      const provider = this.providers[this.config.provider];
      await provider.delete(path);
      
      // Remove from local references
      this.removeFileReference(path);
      
      return { success: true };
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  // List files in a directory
  async listFiles(prefix = '') {
    try {
      const provider = this.providers[this.config.provider];
      return await provider.list(prefix);
    } catch (error) {
      console.error('List files failed:', error);
      throw error;
    }
  }

  // Supabase Storage Implementation
  async supabaseStorage() {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized. Check your environment variables.');
    }

    return {
      upload: async (file, path, metadata) => {
        try {
          // Upload file to Supabase storage
          const { data, error } = await this.supabase.storage
            .from(this.config.bucket)
            .upload(path, file, {
              cacheControl: '3600',
              upsert: false,
              metadata: metadata
            });
          
          if (error) {
            console.error('Supabase upload error:', error);
            throw error;
          }
          
          // Get public URL for the uploaded file
          const { data: { publicUrl } } = this.supabase.storage
            .from(this.config.bucket)
            .getPublicUrl(path);
          
          return {
            url: publicUrl,
            path: data.path,
            size: file.size,
            metadata: { ...metadata, uploadedAt: new Date().toISOString() }
          };
        } catch (error) {
          console.error('Supabase upload failed:', error);
          throw error;
        }
      },
      
      download: async (path) => {
        try {
          const { data, error } = await this.supabase.storage
            .from(this.config.bucket)
            .download(path);
          
          if (error) {
            console.error('Supabase download error:', error);
            throw error;
          }
          
          return {
            blob: data,
            url: URL.createObjectURL(data),
            metadata: {}
          };
        } catch (error) {
          console.error('Supabase download failed:', error);
          throw error;
        }
      },
      
      delete: async (path) => {
        try {
          const { error } = await this.supabase.storage
            .from(this.config.bucket)
            .remove([path]);
          
          if (error) {
            console.error('Supabase delete error:', error);
            throw error;
          }
          
          return { success: true };
        } catch (error) {
          console.error('Supabase delete failed:', error);
          throw error;
        }
      },
      
      list: async (prefix) => {
        try {
          const { data, error } = await this.supabase.storage
            .from(this.config.bucket)
            .list(prefix, {
              limit: 100,
              offset: 0,
              sortBy: { column: 'name', order: 'asc' }
            });
          
          if (error) {
            console.error('Supabase list error:', error);
            throw error;
          }
          
          // Transform Supabase response to match our format
          const files = data?.map(item => ({
            name: item.name,
            path: prefix ? `${prefix}${item.name}` : item.name,
            size: item.metadata?.size || 0,
            metadata: item.metadata,
            updated_at: item.updated_at,
            created_at: item.created_at
          })) || [];
          
          return {
            files,
            folders: []
          };
        } catch (error) {
          console.error('Supabase list failed:', error);
          throw error;
        }
      }
    };
  }

  // AWS S3 Storage Implementation
  async awsStorage() {
    return {
      upload: async (file, path, metadata) => {
        // Would use AWS SDK
        const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${path}`;
        return {
          url,
          path,
          size: file.size,
          metadata: { ...metadata, uploadedAt: new Date().toISOString() }
        };
      },
      
      download: async (path) => {
        const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${path}`;
        const response = await fetch(url);
        const blob = await response.blob();
        return {
          blob,
          url,
          metadata: {}
        };
      },
      
      delete: async (path) => {
        console.log(`Deleting ${path} from AWS S3`);
        return { success: true };
      },
      
      list: async (prefix) => {
        return {
          files: [],
          folders: []
        };
      }
    };
  }

  // Google Cloud Storage Implementation
  async googleStorage() {
    return {
      upload: async (file, path, metadata) => {
        // Would use Google Cloud Storage SDK
        const url = `https://storage.googleapis.com/${this.config.bucket}/${path}`;
        return {
          url,
          path,
          size: file.size,
          metadata: { ...metadata, uploadedAt: new Date().toISOString() }
        };
      },
      
      download: async (path) => {
        const url = `https://storage.googleapis.com/${this.config.bucket}/${path}`;
        const response = await fetch(url);
        const blob = await response.blob();
        return {
          blob,
          url,
          metadata: {}
        };
      },
      
      delete: async (path) => {
        console.log(`Deleting ${path} from Google Cloud Storage`);
        return { success: true };
      },
      
      list: async (prefix) => {
        return {
          files: [],
          folders: []
        };
      }
    };
  }

  // Local Storage Implementation (fallback)
  async localStorage() {
    return {
      upload: async (file, path, metadata) => {
        // Store in browser's IndexedDB for larger files
        const storedData = await this.storeInIndexedDB(path, file, metadata);
        return {
          url: storedData.url,
          path,
          size: file.size,
          metadata: storedData.metadata
        };
      },
      
      download: async (path) => {
        const data = await this.getFromIndexedDB(path);
        return {
          blob: data.blob,
          url: data.url,
          metadata: data.metadata
        };
      },
      
      delete: async (path) => {
        await this.removeFromIndexedDB(path);
        return { success: true };
      },
      
      list: async (prefix) => {
        const files = await this.listFromIndexedDB(prefix);
        return {
          files,
          folders: []
        };
      }
    };
  }

  // IndexedDB helpers for local storage
  async storeInIndexedDB(path, file, metadata) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DevHubStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        
        const fileData = {
          path,
          blob: file,
          metadata: { ...metadata, uploadedAt: new Date().toISOString() },
          url: URL.createObjectURL(file)
        };
        
        const putRequest = store.put(fileData);
        putRequest.onsuccess = () => resolve(fileData);
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' });
        }
      };
    });
  }

  async getFromIndexedDB(path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DevHubStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const getRequest = store.get(path);
        
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  async removeFromIndexedDB(path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DevHubStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        const deleteRequest = store.delete(path);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  async listFromIndexedDB(prefix) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DevHubStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const files = getAllRequest.result.filter(file => 
            prefix ? file.path.startsWith(prefix) : true
          );
          resolve(files);
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  }

  // Local storage helpers for file references
  storeFileReference(path, result) {
    const references = JSON.parse(localStorage.getItem('fileReferences') || '{}');
    references[path] = {
      url: result.url,
      provider: this.config.provider,
      uploadedAt: new Date().toISOString(),
      size: result.size
    };
    localStorage.setItem('fileReferences', JSON.stringify(references));
  }

  removeFileReference(path) {
    const references = JSON.parse(localStorage.getItem('fileReferences') || '{}');
    delete references[path];
    localStorage.setItem('fileReferences', JSON.stringify(references));
  }

  getFileReference(path) {
    const references = JSON.parse(localStorage.getItem('fileReferences') || '{}');
    return references[path];
  }

  // Utility methods
  generatePath(fileType, fileName, userId = null) {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const userPrefix = userId ? `users/${userId}` : 'shared';
    
    return `${userPrefix}/${fileType}/${timestamp}_${sanitizedFileName}`;
  }

  getFileType(file) {
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'images';
    if (file.type.startsWith('video/')) return 'videos';
    if (file.type.includes('pdf')) return 'documents';
    if (file.type.includes('text') || file.type.includes('code')) return 'documents';
    return 'misc';
  }

  // Batch operations
  async uploadMultiple(files, basePath = '') {
    const results = [];
    for (const file of files) {
      const fileType = this.getFileType(file);
      const path = this.generatePath(fileType, file.name);
      const result = await this.uploadFile(file, path);
      results.push(result);
    }
    return results;
  }

  async deleteMultiple(paths) {
    const results = [];
    for (const path of paths) {
      const result = await this.deleteFile(path);
      results.push(result);
    }
    return results;
  }

  // Supabase-specific methods
  async getStorageStats() {
    if (this.config.provider !== 'supabase') {
      throw new Error('Storage stats only available for Supabase');
    }

    try {
      const { data, error } = await this.supabase.storage
        .from(this.config.bucket)
        .list('', {
          limit: 1000,
          offset: 0
        });

      if (error) throw error;

      const stats = {
        totalFiles: data?.length || 0,
        totalSize: data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0,
        byType: {},
        byUser: {}
      };

      data?.forEach(file => {
        // Count by file type
        const fileType = this.getFileType({ type: file.metadata?.mimetype || 'unknown' });
        stats.byType[fileType] = (stats.byType[fileType] || 0) + 1;

        // Count by user (extract from path)
        const pathParts = file.name.split('/');
        if (pathParts.length > 1 && pathParts[0] === 'users') {
          const userId = pathParts[1];
          stats.byUser[userId] = (stats.byUser[userId] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }

  // Check if Supabase is properly configured
  isSupabaseConfigured() {
    return !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY);
  }
}

// Export singleton instance
const storageService = new StorageService();

export default storageService;
export { StorageService };
