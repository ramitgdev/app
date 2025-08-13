# 🗄️ External Storage Setup Guide

This guide will help you set up external storage for your Dev Hub project to store resource files outside of browser cache.

## 🎯 **Why External Storage?**

### **Problems with Browser Cache:**
- ❌ **Limited storage space** (usually 5-50MB)
- ❌ **Data lost when browser cache is cleared**
- ❌ **Not shared across devices**
- ❌ **No backup or versioning**
- ❌ **Poor performance for large files**

### **Benefits of External Storage:**
- ✅ **Unlimited storage capacity**
- ✅ **Persistent across sessions**
- ✅ **Accessible from any device**
- ✅ **Automatic backups and versioning**
- ✅ **CDN for fast global access**
- ✅ **User-specific access control**

## 🚀 **Quick Start (Recommended: Supabase)**

Since you're already using Supabase, this is the easiest option:

### **1. Enable Supabase Storage**

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Click **Create a new bucket**
4. Name it `dev-hub-resources`
5. Set privacy to **Private** (for user files)
6. Create another bucket called `dev-hub-public` for shared files

### **2. Set Environment Variables**

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Storage Configuration
STORAGE_PROVIDER=supabase
STORAGE_BUCKET=dev-hub-resources
```

### **3. Install Dependencies**

```bash
npm install @supabase/supabase-js
```

### **4. Update Storage Service**

Replace the mock implementation in `storage-service.js` with actual Supabase code:

```javascript
// In supabaseStorage() method
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(config.url, config.anonKey);

return {
  upload: async (file, path, metadata) => {
    const { data, error } = await supabase.storage
      .from(this.config.bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: metadata
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(this.config.bucket)
      .getPublicUrl(path);
    
    return {
      url: publicUrl,
      path: data.path,
      size: file.size,
      metadata: metadata
    };
  },
  
  download: async (path) => {
    const { data, error } = await supabase.storage
      .from(this.config.bucket)
      .download(path);
    
    if (error) throw error;
    
    return {
      blob: data,
      url: URL.createObjectURL(data),
      metadata: {}
    };
  },
  
  delete: async (path) => {
    const { error } = await supabase.storage
      .from(this.config.bucket)
      .remove([path]);
    
    if (error) throw error;
    return { success: true };
  },
  
  list: async (prefix) => {
    const { data, error } = await supabase.storage
      .from(this.config.bucket)
      .list(prefix);
    
    if (error) throw error;
    
    return {
      files: data || [],
      folders: []
    };
  }
};
```

## 🔧 **Alternative Storage Options**

### **Option 2: AWS S3**

**Setup Steps:**
1. Create AWS account
2. Create S3 bucket
3. Configure CORS
4. Create IAM user with S3 permissions
5. Add environment variables

**Environment Variables:**
```bash
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

**Install Dependencies:**
```bash
npm install aws-sdk
```

### **Option 3: Google Cloud Storage**

**Setup Steps:**
1. Create Google Cloud project
2. Enable Cloud Storage API
3. Create storage bucket
4. Create service account
5. Download service account key

**Environment Variables:**
```bash
STORAGE_PROVIDER=google
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_CLIENT_EMAIL=your_service_account_email
GOOGLE_CLOUD_PRIVATE_KEY=your_private_key
GOOGLE_CLOUD_BUCKET=your-bucket-name
```

**Install Dependencies:**
```bash
npm install @google-cloud/storage
```

### **Option 4: Local Storage (Development)**

For development/testing, you can use local storage:

```bash
STORAGE_PROVIDER=local
```

This uses IndexedDB and doesn't require external setup.

## 📁 **File Organization**

The storage service organizes files by type and user:

```
dev-hub-resources/
├── users/
│   └── user123/
│       ├── audio/
│       │   ├── 2024-01-15_audio_comment.webm
│       │   └── 2024-01-16_meeting_recording.webm
│       ├── images/
│       │   ├── 2024-01-15_screenshot.png
│       │   └── 2024-01-16_diagram.jpg
│       ├── documents/
│       │   ├── 2024-01-15_notes.txt
│       │   └── 2024-01-16_report.pdf
│       └── videos/
│           └── 2024-01-15_demo.mp4
└── shared/
    ├── workspace123/
    │   ├── project_files/
    │   └── shared_resources/
    └── public/
        └── templates/
```

## 🔐 **Security & Permissions**

### **Supabase RLS (Row Level Security)**

Enable RLS for user-specific access:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for user-specific files
CREATE POLICY "Users can access their own files" ON storage.objects
  FOR ALL USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for shared files
CREATE POLICY "Users can access shared files" ON storage.objects
  FOR ALL USING (
    (storage.foldername(name))[1] = 'shared'
  );
```

### **AWS S3 Bucket Policy**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UserSpecificAccess",
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::YOUR_ACCOUNT:user/YOUR_USER"},
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket/users/${aws:userid}/*"
    }
  ]
}
```

## 🚀 **Integration Examples**

### **1. Audio Recording Integration**

```javascript
import EnhancedAudioRecorder from './EnhancedAudioRecorder';

// In your component
<EnhancedAudioRecorder
  resourceId="project123"
  currentUser={currentUser}
  workspaceId="workspace456"
  onUpload={(blob, resourceId, user, result) => {
    console.log('Audio uploaded:', result.url);
    // Update your database with the file reference
  }}
/>
```

### **2. File Upload Integration**

```javascript
import storageService from './storage-service';

const handleFileUpload = async (file) => {
  try {
    const fileType = storageService.getFileType(file);
    const path = storageService.generatePath(fileType, file.name, currentUser.id);
    
    const result = await storageService.uploadFile(file, path, {
      uploadedBy: currentUser.id,
      workspaceId: currentWorkspace.id,
      description: 'Project file'
    });
    
    // Store reference in your database
    await saveFileReference({
      url: result.url,
      path: result.path,
      size: result.size,
      type: fileType,
      uploadedBy: currentUser.id
    });
    
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### **3. File Download Integration**

```javascript
const handleFileDownload = async (filePath) => {
  try {
    const result = await storageService.downloadFile(filePath);
    
    // Create download link
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filename.ext';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

## 📊 **Storage Analytics**

Track storage usage:

```javascript
const getStorageStats = async () => {
  const files = await storageService.listFiles();
  
  const stats = {
    totalFiles: files.files.length,
    totalSize: files.files.reduce((sum, file) => sum + (file.size || 0), 0),
    byType: files.files.reduce((acc, file) => {
      const type = storageService.getFileType(file);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  };
  
  return stats;
};
```

## 🔄 **Migration from Browser Cache**

If you have existing files in browser cache, migrate them:

```javascript
const migrateFromCache = async () => {
  // Get files from IndexedDB/localStorage
  const cachedFiles = await getCachedFiles();
  
  for (const file of cachedFiles) {
    try {
      // Upload to external storage
      const result = await storageService.uploadFile(file.blob, file.path);
      
      // Update database references
      await updateFileReference(file.id, result.url);
      
      // Remove from cache
      await removeFromCache(file.id);
      
    } catch (error) {
      console.error(`Failed to migrate ${file.name}:`, error);
    }
  }
};
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **CORS Errors**
   - Configure CORS settings in your storage provider
   - Ensure your domain is whitelisted

2. **File Size Limits**
   - Check provider limits (Supabase: 50MB, AWS: 5TB)
   - Implement chunked uploads for large files

3. **Authentication Issues**
   - Verify API keys and permissions
   - Check RLS policies (Supabase)

4. **Performance Issues**
   - Use CDN for public files
   - Implement caching strategies
   - Consider file compression

### **Debug Mode:**

Enable debug logging:

```javascript
// In storage-service.js
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Storage operation:', { operation, path, metadata });
}
```

## 📈 **Performance Optimization**

### **1. File Compression**

```javascript
const compressFile = async (file) => {
  if (file.type.startsWith('image/')) {
    // Compress images
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width * 0.8; // Reduce size
        canvas.height = img.height * 0.8;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
      img.src = URL.createObjectURL(file);
    });
  }
  
  return file;
};
```

### **2. Chunked Uploads**

```javascript
const uploadLargeFile = async (file) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    await storageService.uploadFile(chunk, `${file.name}.part${i}`);
  }
  
  // Combine chunks on server side
  await storageService.combineChunks(file.name, chunks);
};
```

### **3. Lazy Loading**

```javascript
const LazyFileViewer = ({ filePath }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const loadFile = async () => {
    setLoading(true);
    try {
      const result = await storageService.downloadFile(filePath);
      setFile(result);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {!file && !loading && (
        <Button onClick={loadFile}>Load File</Button>
      )}
      {loading && <CircularProgress />}
      {file && <FileViewer file={file} />}
    </div>
  );
};
```

## 🎉 **Next Steps**

1. **Choose your storage provider** (recommend Supabase for your setup)
2. **Set up environment variables**
3. **Update the storage service implementation**
4. **Test with the EnhancedAudioRecorder**
5. **Integrate with your existing file management system**
6. **Set up monitoring and analytics**

Your Dev Hub will now have robust, scalable file storage that persists across sessions and devices! 🚀 