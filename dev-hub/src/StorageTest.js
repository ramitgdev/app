import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Card, CardContent, 
  Alert, CircularProgress, Stack, Chip, Divider
} from '@mui/material';
import {
  CloudUpload, CloudDownload, Delete, Storage,
  CheckCircle, Error, Info
} from '@mui/icons-material';
import storageService from './storage-service.js';

export default function StorageTest() {
  const [testFile, setTestFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    checkConfiguration();
    loadStorageInfo();
  }, []);

  const checkConfiguration = () => {
    const configured = storageService.isSupabaseConfigured();
    setIsConfigured(configured);
    
    if (!configured) {
      setError('Supabase not configured. Please check your environment variables.');
    }
  };

  const loadStorageInfo = async () => {
    try {
      if (storageService.config.provider === 'supabase') {
        const stats = await storageService.getStorageStats();
        setStorageInfo(stats);
      }
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTestFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!testFile) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const path = `test/${Date.now()}_${testFile.name}`;
      const result = await storageService.uploadFile(testFile, path, {
        test: true,
        uploadedAt: new Date().toISOString()
      });

      setUploadedFile(result);
      setSuccess(`File uploaded successfully! URL: ${result.url}`);
      
      // Reload storage info
      await loadStorageInfo();
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!uploadedFile) return;

    setDownloading(true);
    setError(null);

    try {
      const result = await storageService.downloadFile(uploadedFile.path);
      
      // Create download link
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = testFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('File downloaded successfully!');
      
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedFile) return;

    setDeleting(true);
    setError(null);

    try {
      await storageService.deleteFile(uploadedFile.path);
      
      setUploadedFile(null);
      setTestFile(null);
      setSuccess('File deleted successfully!');
      
      // Reload storage info
      await loadStorageInfo();
      
    } catch (error) {
      console.error('Delete failed:', error);
      setError(`Delete failed: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Storage Integration Test
      </Typography>

      {/* Configuration Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Storage color={isConfigured ? "success" : "error"} />
            <Box>
              <Typography variant="h6">
                {isConfigured ? 'Supabase Configured' : 'Supabase Not Configured'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Provider: {storageService.config.provider} | 
                Bucket: {storageService.config.bucket}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Storage Info */}
      {storageInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Storage Statistics
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip 
                label={`${storageInfo.totalFiles} files`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={formatFileSize(storageInfo.totalSize)} 
                color="secondary" 
                variant="outlined" 
              />
            </Stack>
            
            {Object.keys(storageInfo.byType).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Files by Type:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(storageInfo.byType).map(([type, count]) => (
                    <Chip 
                      key={type}
                      label={`${type}: ${count}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Upload Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            File Upload Test
          </Typography>
          
          <Stack spacing={2}>
            {/* File Selection */}
            <Box>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-input">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={!isConfigured}
                >
                  Select Test File
                </Button>
              </label>
              {testFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {testFile.name} ({formatFileSize(testFile.size)})
                </Typography>
              )}
            </Box>

            {/* Upload Button */}
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={handleUpload}
              disabled={!testFile || uploading || !isConfigured}
              fullWidth
            >
              {uploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                'Upload to Supabase'
              )}
            </Button>

            {/* Uploaded File Info */}
            {uploadedFile && (
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Uploaded File:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Path: {uploadedFile.path}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Size: {formatFileSize(uploadedFile.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  URL: {uploadedFile.url}
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={handleDownload}
                    disabled={downloading}
                    size="small"
                  >
                    {downloading ? 'Downloading...' : 'Download'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDelete}
                    disabled={deleting}
                    size="small"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Error sx={{ mr: 1 }} />
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <CheckCircle sx={{ mr: 1 }} />
          {success}
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Setup Instructions
          </Typography>
          <Typography variant="body2" paragraph>
            1. Add your Supabase environment variables to <code>.env.local</code>:
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace' }}>
            NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            2. Create a storage bucket named <code>dev-hub-resources</code> in your Supabase dashboard
          </Typography>
          <Typography variant="body2">
            3. Test the integration by uploading a file above
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 