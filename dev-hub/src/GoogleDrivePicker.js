import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, Button, Stack, Chip, 
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  IconButton, Alert, CircularProgress, Divider, TextField, Breadcrumbs, Link,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Google, Cloud, Folder, InsertDriveFile, Search, Refresh,
  Create, Visibility, Download, Share, Star, StarBorder, OpenInNew,
  Home, NavigateNext, Image, VideoFile, AudioFile, PictureAsPdf,
  Description, TableChart, Slideshow, Archive, Code, CloudUpload, Edit
} from '@mui/icons-material';

// Google Drive Picker Component
function GoogleDrivePicker({ googleToken, onFileSelect, setGlobalSnackbar, setGoogleToken, loginWithGoogle }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('root');
  const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'My Drive' }]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const fileInputRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [useStandardViewer, setUseStandardViewer] = useState(false);
  const [standardViewerUrl, setStandardViewerUrl] = useState('');
  const [standardViewerLoading, setStandardViewerLoading] = useState(false);
  const [standardViewerError, setStandardViewerError] = useState('');

  // Your Google Cloud credentials
  const CLIENT_ID = '946277888643-821lvkhan6jmpi6ngi8l93b45kuhm71e.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyBzq3IXRJ918muozJOq02BAYTBCBdFahLE';

  // Load Google Drive files using the Drive API
  const loadDriveFiles = useCallback(async (folderId = 'root', pageToken = null) => {
    if (!googleToken) return;

    setLoading(true);
    setError('');

    try {
      // Build the query for files in the current folder
      let query = `'${folderId}' in parents and trashed=false`;
      
      // Add search query if provided
      if (searchQuery.trim()) {
        query = `name contains '${searchQuery}' and trashed=false`;
      }

      console.log('Making Google Drive API request with token:', googleToken.substring(0, 20) + '...');
      console.log('Query:', query);

      // Make API call to Google Drive
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?` +
        `q=${encodeURIComponent(query)}&` +
        `fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink,iconLink,webContentLink),nextPageToken&` +
        `orderBy=name&` +
        `pageSize=50&` +
        `${pageToken ? `pageToken=${pageToken}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 403) {
          throw new Error(`Access denied (403). Please check your Google Cloud Console setup:\n\n1. Enable Google Drive API: https://console.cloud.google.com/apis/library/drive.googleapis.com\n2. Add your email as a test user in OAuth consent screen\n3. Ensure the app is in "Testing" mode\n4. Wait 5-10 minutes for changes to take effect`);
        } else if (response.status === 401) {
          throw new Error(`Authentication failed (401). Please sign in again.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (pageToken) {
        // Append to existing files for pagination
        setFiles(prevFiles => [...prevFiles, ...data.files]);
      } else {
        // Replace files for new folder or search
        setFiles(data.files || []);
      }
      
      setNextPageToken(data.nextPageToken || null);
      setHasMore(!!data.nextPageToken);
      setLoading(false);

    } catch (err) {
      console.error('Error loading Drive files:', err);
      
              // If it's a 403 error, show sample data as fallback
        if (err.message.includes('403')) {
          // Try to get user email from various sources
          let userEmail = 'your email';
          try {
            // Check if we can get email from Google token info
            const tokenInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
              headers: {
                'Authorization': `Bearer ${googleToken}`,
              },
            });
            if (tokenInfoResponse.ok) {
              const userInfo = await tokenInfoResponse.json();
              userEmail = userInfo.email;
            }
          } catch (emailError) {
            console.log('Could not fetch user email:', emailError);
          }
          
          setError(`Google Drive API access denied. Showing sample data. To fix this:\n\n1. Go to Google Cloud Console\n2. Enable Google Drive API\n3. Add your email (${userEmail}) as a test user\n4. Wait 5-10 minutes for changes to take effect\n\nDebug info: Token length: ${googleToken ? googleToken.length : 0} characters`);
        
        // Show sample data as fallback
        const sampleFiles = [
          {
            id: 'doc1',
            name: 'Project Proposal',
            mimeType: 'application/vnd.google-apps.document',
            size: '15 KB',
            modifiedTime: new Date().toISOString(),
            webViewLink: 'https://docs.google.com/document/d/doc1/edit'
          },
          {
            id: 'sheet1',
            name: 'Budget Spreadsheet',
            mimeType: 'application/vnd.google-apps.spreadsheet',
            size: '24 KB',
            modifiedTime: new Date().toISOString(),
            webViewLink: 'https://docs.google.com/spreadsheets/d/sheet1/edit'
          },
          {
            id: 'slides1',
            name: 'Presentation Deck',
            mimeType: 'application/vnd.google-apps.presentation',
            size: '18 KB',
            modifiedTime: new Date().toISOString(),
            webViewLink: 'https://docs.google.com/presentation/d/slides1/edit'
          },
          {
            id: 'folder1',
            name: 'Work Documents',
            mimeType: 'application/vnd.google-apps.folder',
            size: null,
            modifiedTime: new Date().toISOString()
          }
        ];
        
        setFiles(sampleFiles);
        setLoading(false);
      } else {
        setError(`Failed to load Google Drive files: ${err.message}`);
        setLoading(false);
      }
    }
  }, [googleToken, searchQuery]);

  // Load files when component mounts or token changes
  useEffect(() => {
    if (googleToken) {
      loadDriveFiles(currentFolder);
    }
  }, [googleToken, currentFolder, loadDriveFiles]);

  // Handle folder navigation
  const handleFolderClick = (folder) => {
    setCurrentFolder(folder.id);
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
    setFiles([]); // Clear current files
    setNextPageToken(null);
    setHasMore(true);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    const targetFolder = newPath[newPath.length - 1];
    setCurrentFolder(targetFolder.id);
    setFiles([]);
    setNextPageToken(null);
    setHasMore(true);
  };

  // Handle search
  const handleSearch = () => {
    setCurrentFolder('root');
    setFolderPath([{ id: 'root', name: 'My Drive' }]);
    loadDriveFiles('root');
  };

  // Load more files (pagination)
  const loadMoreFiles = () => {
    if (nextPageToken && hasMore) {
      loadDriveFiles(currentFolder, nextPageToken);
    }
  };

  // Upload files to the current folder (two-step: create metadata, then upload content)
  const uploadFileToDrive = async (file) => {
    try {
      // 1) Create file metadata
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name,
          parents: [currentFolder || 'root'],
        }),
      });

      if (!createRes.ok) {
        const txt = await createRes.text();
        throw new Error(`Create metadata failed (${createRes.status}): ${txt}`);
      }
      const created = await createRes.json();
      const fileId = created.id;

      // 2) Upload media content
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        const txt = await uploadRes.text();
        throw new Error(`Upload content failed (${uploadRes.status}): ${txt}`);
      }

      setGlobalSnackbar && setGlobalSnackbar({
        open: true,
        message: `Uploaded ${file.name} to Google Drive`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Upload error:', err);
      setGlobalSnackbar && setGlobalSnackbar({
        open: true,
        message: `Upload failed: ${err.message}`,
        severity: 'error',
      });
      throw err;
    }
  };

  const handleClickUpload = () => {
    if (!googleToken) return;
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e) => {
    const selected = Array.from(e.target.files || []);
    // Reset input so the same file can be selected again later
    e.target.value = '';
    if (selected.length === 0) return;

    setLoading(true);
    setError('');
    try {
      for (const f of selected) {
        await uploadFileToDrive(f);
      }
      // Refresh listing after uploads
      await loadDriveFiles(currentFolder);
    } catch (_) {
      // error already surfaced via snackbar
    } finally {
      setLoading(false);
    }
  };

  // Rename file or folder in Google Drive
  const renameDriveItem = async (fileId, newName) => {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}` , {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Rename failed (${res.status}): ${txt}`);
      }

      setGlobalSnackbar && setGlobalSnackbar({
        open: true,
        message: 'Item renamed',
        severity: 'success',
      });
    } catch (err) {
      console.error('Rename error:', err);
      setGlobalSnackbar && setGlobalSnackbar({
        open: true,
        message: `Rename failed: ${err.message}`,
        severity: 'error',
      });
      throw err;
    }
  };

  const getDrivePreviewUrl = (file) => {
    if (!file || !file.id) return '';
    return `https://drive.google.com/file/d/${file.id}/preview`;
  };

  const getGoogleEditorUrl = (file) => {
    if (!file || !file.id || !file.mimeType) return '';
    const { id, mimeType } = file;
    if (mimeType === 'application/vnd.google-apps.document') {
      return `https://docs.google.com/document/d/${id}/edit`;
    }
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      return `https://docs.google.com/spreadsheets/d/${id}/edit`;
    }
    if (mimeType === 'application/vnd.google-apps.presentation') {
      return `https://docs.google.com/presentation/d/${id}/edit`;
    }
    if (mimeType === 'application/vnd.google-apps.drawing') {
      return `https://docs.google.com/drawings/d/${id}/edit`;
    }
    if (mimeType === 'application/vnd.google-apps.form') {
      return `https://docs.google.com/forms/d/${id}/edit`;
    }
    return '';
  };

  const openPreview = (file) => {
    setPreviewFile(file);
    setUseStandardViewer(false);
    setStandardViewerUrl('');
    setStandardViewerError('');
  };

  const closePreview = () => {
    setPreviewFile(null);
    setUseStandardViewer(false);
    if (standardViewerUrl) {
      URL.revokeObjectURL(standardViewerUrl);
      setStandardViewerUrl('');
    }
    setStandardViewerError('');
    setStandardViewerLoading(false);
  };

  const fetchStandardPreview = async (file) => {
    if (!file) return;
    try {
      setStandardViewerLoading(true);
      setStandardViewerError('');
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${googleToken}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Fetch failed (${res.status}): ${txt}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setStandardViewerUrl(url);
    } catch (err) {
      console.error('Standard viewer fetch error:', err);
      setStandardViewerError(err.message || 'Failed to load preview');
    } finally {
      setStandardViewerLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.folder') return <Folder />;
    if (mimeType === 'application/vnd.google-apps.document') return <Description />;
    if (mimeType === 'application/vnd.google-apps.spreadsheet') return <TableChart />;
    if (mimeType === 'application/vnd.google-apps.presentation') return <Slideshow />;
    if (mimeType === 'application/vnd.google-apps.drawing') return <Image />;
    if (mimeType === 'application/vnd.google-apps.form') return <Description />;
    if (mimeType === 'application/vnd.google-apps.script') return <Code />;
    if (mimeType === 'application/vnd.google-apps.site') return <Description />;
    if (mimeType.includes('image/')) return <Image />;
    if (mimeType.includes('video/')) return <VideoFile />;
    if (mimeType.includes('audio/')) return <AudioFile />;
    if (mimeType === 'application/pdf') return <PictureAsPdf />;
    if (mimeType.includes('text/')) return <Description />;
    if (mimeType.includes('application/zip') || mimeType.includes('application/x-rar')) return <Archive />;
    return <InsertDriveFile />;
  };

  // Get file type label
  const getFileTypeLabel = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.folder') return 'Folder';
    if (mimeType === 'application/vnd.google-apps.document') return 'Google Doc';
    if (mimeType === 'application/vnd.google-apps.spreadsheet') return 'Google Sheet';
    if (mimeType === 'application/vnd.google-apps.presentation') return 'Google Slides';
    if (mimeType === 'application/vnd.google-apps.drawing') return 'Google Drawing';
    if (mimeType === 'application/vnd.google-apps.form') return 'Google Form';
    if (mimeType === 'application/vnd.google-apps.script') return 'Google Apps Script';
    if (mimeType === 'application/vnd.google-apps.site') return 'Google Site';
    if (mimeType.includes('image/')) return 'Image';
    if (mimeType.includes('video/')) return 'Video';
    if (mimeType.includes('audio/')) return 'Audio';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('text/')) return 'Text';
    if (mimeType.includes('application/zip') || mimeType.includes('application/x-rar')) return 'Archive';
    return 'File';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle opening Google Drive in new tab
  const handleOpenDriveInNewTab = () => {
    window.open('https://drive.google.com', '_blank');
    setGlobalSnackbar({
      open: true,
      message: 'Opening Google Drive in new tab',
      severity: 'info'
    });
  };

  // Handle re-authentication
  const handleReAuthenticate = () => {
    // Clear all Google-related tokens
    setGoogleToken(null);
    localStorage.removeItem('google_oauth_token');
    sessionStorage.removeItem('google_oauth_token');
    
    // Clear any other potential token storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('google') || key.includes('oauth')) {
        localStorage.removeItem(key);
      }
    });
    
    setError('');
    setGlobalSnackbar({
      open: true,
      message: 'Starting Google re-authentication...',
      severity: 'info'
    });
    
    // Trigger the Google login flow
    if (loginWithGoogle) {
      loginWithGoogle();
    }
  };

  if (!googleToken) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
        <Google sx={{ fontSize: 48, color: '#4285f4', mb: 2 }} />
        <Typography variant="h6" fontWeight={600} mb={2}>
          Connect to Google Drive
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in with Google to access and manage your Google Drive files directly in your workspace.
        </Typography>
        <Chip 
          label="Google Drive Access Required" 
          color="warning" 
          variant="outlined"
          icon={<Cloud />}
        />
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Google sx={{ fontSize: 32, color: '#4285f4' }} />
          <Typography variant="h5" fontWeight={700}>
            Google Drive
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFilesSelected}
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadDriveFiles(currentFolder)}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleClickUpload}
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #34a853 30%, #4285f4 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2e7d32 30%, #3367d6 90%)'
              }
            }}
          >
            Upload
          </Button>
          
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Google />}
            onClick={handleReAuthenticate}
          >
            Re-authenticate
          </Button>
          
          <Button
            variant="contained"
            startIcon={<OpenInNew />}
            onClick={handleOpenDriveInNewTab}
            sx={{ 
              background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3367d6 30%, #2e7d32 90%)'
              }
            }}
          >
            Open Drive in New Tab
          </Button>
        </Stack>
      </Box>

      {/* Breadcrumb Navigation */}
      <Card sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          {folderPath.map((folder, index) => (
            <Link
              key={folder.id}
              color={index === folderPath.length - 1 ? 'text.primary' : 'inherit'}
              underline="hover"
              onClick={() => handleBreadcrumbClick(index)}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {index === 0 ? <Home sx={{ mr: 0.5, fontSize: 16 }} /> : null}
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Card>

      {/* Search Bar */}
      <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search files in Google Drive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            startIcon={<Search />}
          >
            Search
          </Button>
        </Stack>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {error}
          </Typography>
          {error.includes('403') && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.open('https://console.cloud.google.com/apis/library/drive.googleapis.com', '_blank')}
                startIcon={<OpenInNew />}
              >
                Open Google Cloud Console
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setError('');
                  loadDriveFiles(currentFolder);
                }}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => {
                  // Clear token and force re-auth
                  setGoogleToken(null);
                  setError('');
                  setGlobalSnackbar({
                    open: true,
                    message: 'Please sign in with Google again',
                    severity: 'info'
                  });
                }}
                startIcon={<Google />}
              >
                Re-authenticate
              </Button>
              <Button
                variant="outlined"
                color="info"
                size="small"
                onClick={async () => {
                  try {
                    // Test the token directly
                    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
                      headers: {
                        'Authorization': `Bearer ${googleToken}`,
                      },
                    });
                    const userInfo = await response.json();
                    console.log('Token test - User info:', userInfo);
                    
                    // Test Drive API directly
                    const driveResponse = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=1', {
                      headers: {
                        'Authorization': `Bearer ${googleToken}`,
                      },
                    });
                    console.log('Token test - Drive API status:', driveResponse.status);
                    if (!driveResponse.ok) {
                      const errorText = await driveResponse.text();
                      console.log('Token test - Drive API error:', errorText);
                    }
                    
                    setGlobalSnackbar({
                      open: true,
                      message: `Token test complete. Check console for details.`,
                      severity: 'info'
                    });
                  } catch (err) {
                    console.error('Token test error:', err);
                    setGlobalSnackbar({
                      open: true,
                      message: `Token test failed: ${err.message}`,
                      severity: 'error'
                    });
                  }
                }}
                startIcon={<Search />}
              >
                Test Token
              </Button>
            </Box>
          )}
        </Alert>
      )}

      {/* Google Drive Files */}
      {files.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {searchQuery ? `Search Results (${files.length})` : `Files (${files.length})`}
            </Typography>
            {hasMore && (
              <Button
                size="small"
                onClick={loadMoreFiles}
                disabled={loading}
                startIcon={<Refresh />}
              >
                Load More
              </Button>
            )}
          </Box>
              <List>
                {files.map((file, index) => (
                  <ListItem
                    key={file.id}
                    button
                  onClick={() => {
                    if (file.mimeType === 'application/vnd.google-apps.folder') {
                      handleFolderClick(file);
                      return;
                    }
                    if (file.mimeType === 'application/vnd.google-apps.document' && onFileSelect) {
                      onFileSelect(file);
                      return;
                    }
                    openPreview(file);
                  }}
                    sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
                  >
                <ListItemIcon>
                  {getFileIcon(file.mimeType)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${getFileTypeLabel(file.mimeType)} • ${formatFileSize(file.size)} • Modified: ${new Date(file.modifiedTime).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Preview">
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(file);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {file.webViewLink && (
                      <Tooltip title="Open in Drive">
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.webViewLink, '_blank');
                          }}
                        >
                          <OpenInNew />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Rename">
                      <IconButton
                        edge="end"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const proposed = window.prompt('Rename to:', file.name);
                          if (!proposed || proposed.trim() === '' || proposed.trim() === file.name) return;
                          try {
                            await renameDriveItem(file.id, proposed.trim());
                            await loadDriveFiles(currentFolder);
                          } catch (_) {
                            // error surfaced via snackbar
                          }
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Empty State */}
      {files.length === 0 && !loading && !error && (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Cloud sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            {searchQuery ? 'No files found' : 'No files in this folder'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchQuery 
              ? `No files match your search for "${searchQuery}"`
              : 'This folder is empty. Upload files to get started.'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<OpenInNew />}
            onClick={handleOpenDriveInNewTab}
            sx={{ 
              background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3367d6 30%, #2e7d32 90%)'
              }
            }}
          >
            Open Google Drive
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Preview Dialog */}
      {previewFile && (
        <Dialog open onClose={closePreview} maxWidth="lg" fullWidth>
          <DialogTitle>
            {previewFile.name}
          </DialogTitle>
          <DialogContent dividers sx={{ minHeight: 420 }}>
            {!useStandardViewer && (
              <Box sx={{ position: 'relative', pt: '56.25%' }}>
                <iframe
                  title="Drive Preview"
                  src={getDrivePreviewUrl(previewFile)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                  onError={() => {
                    // Fallback to standard viewer if embedded preview fails
                    setUseStandardViewer(true);
                    fetchStandardPreview(previewFile);
                  }}
                />
              </Box>
            )}

            {useStandardViewer && (
              <Box>
                {standardViewerLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                {!standardViewerLoading && standardViewerError && (
                  <Alert severity="error">{standardViewerError}</Alert>
                )}
                {!standardViewerLoading && !standardViewerError && standardViewerUrl && (
                  <Box>
                    {previewFile.mimeType.startsWith('image/') && (
                      <img src={standardViewerUrl} alt={previewFile.name} style={{ maxWidth: '100%' }} />
                    )}
                    {previewFile.mimeType.startsWith('video/') && (
                      <video src={standardViewerUrl} controls style={{ width: '100%' }} />
                    )}
                    {previewFile.mimeType.startsWith('audio/') && (
                      <audio src={standardViewerUrl} controls style={{ width: '100%' }} />
                    )}
                    {previewFile.mimeType === 'application/pdf' && (
                      <iframe title="PDF" src={standardViewerUrl} style={{ width: '100%', height: 600, border: 0 }} />
                    )}
                    {!previewFile.mimeType.startsWith('image/') &&
                     !previewFile.mimeType.startsWith('video/') &&
                     !previewFile.mimeType.startsWith('audio/') &&
                     previewFile.mimeType !== 'application/pdf' && (
                      <Alert severity="info">
                        This file type is not directly previewable. You can download and open it locally.
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closePreview}>Close</Button>
            {previewFile?.webViewLink && (
              <Button onClick={() => window.open(previewFile.webViewLink, '_blank')} startIcon={<OpenInNew />}>
                Open in Drive
              </Button>
            )}
            {previewFile?.mimeType === 'application/vnd.google-apps.document' && (
              <Button
                onClick={() => {
                  if (onFileSelect) {
                    onFileSelect(previewFile);
                  }
                  closePreview();
                }}
                startIcon={<OpenInNew />}
              >
                Open in Google Editor
              </Button>
            )}
            <Button
              onClick={() => {
                setUseStandardViewer(true);
                fetchStandardPreview(previewFile);
              }}
              disabled={useStandardViewer}
            >
              Use Standard Viewer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default GoogleDrivePicker; 