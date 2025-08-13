# 🚀 Quick Supabase Storage Integration

## **Step 1: Set Up Environment Variables**

### Option A: Use the Setup Script
```bash
node setup-storage.js
```

### Option B: Manual Setup
Create a `.env.local` file in your `dev-hub` directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Storage Configuration
STORAGE_PROVIDER=supabase
STORAGE_BUCKET=dev-hub-resources
```

## **Step 2: Create Supabase Storage Bucket**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the sidebar
4. Click **Create a new bucket**
5. Name it `dev-hub-resources`
6. Set privacy to **Private**
7. Click **Create bucket**

## **Step 3: Test the Integration**

### Add StorageTest to your App.js

```javascript
// In your App.js or main component
import StorageTest from './StorageTest';

// Add this to your component tree
<StorageTest />
```

### Or test with the EnhancedAudioRecorder

```javascript
// In your component
import EnhancedAudioRecorder from './EnhancedAudioRecorder';

<EnhancedAudioRecorder
  resourceId="test123"
  currentUser={{ id: 'user123' }}
  workspaceId="workspace456"
  onUpload={(blob, resourceId, user, result) => {
    console.log('Audio uploaded:', result.url);
  }}
/>
```

## **Step 4: Integrate with Existing Components**

### Update your existing file upload handlers:

```javascript
import storageService from './storage-service';

// Replace browser cache storage with external storage
const handleFileUpload = async (file) => {
  try {
    const fileType = storageService.getFileType(file);
    const path = storageService.generatePath(fileType, file.name, currentUser.id);
    
    const result = await storageService.uploadFile(file, path, {
      uploadedBy: currentUser.id,
      workspaceId: currentWorkspace.id
    });
    
    // Store reference in your database
    await saveFileReference({
      url: result.url,
      path: result.path,
      size: result.size,
      type: fileType
    });
    
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## **Step 5: Enable Row Level Security (Optional)**

For user-specific file access, run this SQL in your Supabase SQL Editor:

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

## **🎯 What's Now Available**

✅ **External file storage** - No more browser cache limits  
✅ **Persistent files** - Access from any device  
✅ **User-specific access** - Secure file management  
✅ **Audio recording storage** - EnhancedAudioRecorder integration  
✅ **File organization** - Automatic categorization by type  
✅ **Download/Delete operations** - Full file management  
✅ **Storage analytics** - Track usage and file types  

## **🔧 Troubleshooting**

### Common Issues:

1. **"Supabase not configured" error**
   - Check your `.env.local` file exists
   - Verify environment variables are correct
   - Restart your development server

2. **"Bucket not found" error**
   - Create the `dev-hub-resources` bucket in Supabase
   - Check bucket name matches exactly

3. **CORS errors**
   - Supabase handles CORS automatically
   - If issues persist, check your domain is allowed

4. **File size limits**
   - Supabase free tier: 50MB per file
   - Upgrade for larger files

## **📊 Storage Usage**

Monitor your storage usage in the Supabase dashboard:
- Go to **Storage** → **dev-hub-resources**
- View file count and total size
- Check individual file details

## **🚀 Next Steps**

1. **Test the integration** with StorageTest component
2. **Integrate with your existing components** that handle files
3. **Set up RLS policies** for secure access
4. **Monitor usage** in Supabase dashboard
5. **Scale up** if needed (upgrade Supabase plan)

Your Dev Hub now has enterprise-grade file storage! 🎉 