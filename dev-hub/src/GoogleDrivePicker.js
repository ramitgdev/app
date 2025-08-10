import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Button, Stack, Chip, 
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  IconButton, Alert, CircularProgress, Divider, TextField, Breadcrumbs, Link
} from '@mui/material';
import {
  Google, Cloud, Folder, InsertDriveFile, Search, Refresh,
  Create, Visibility, Download, Share, Star, StarBorder, OpenInNew,
  Home, NavigateNext, Image, VideoFile, AudioFile, PictureAsPdf,
  Description, TableChart, Slideshow, Archive, Code
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
        `fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink),nextPageToken&` +
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
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadDriveFiles(currentFolder)}
            disabled={loading}
          >
            Refresh
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
                onClick={() => file.mimeType === 'application/vnd.google-apps.folder' 
                  ? handleFolderClick(file) 
                  : handleFileSelect(file)
                }
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
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileSelect(file);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    {file.webViewLink && (
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.webViewLink, '_blank');
                        }}
                      >
                        <OpenInNew />
                      </IconButton>
                    )}
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
    </Box>
  );
}

export default GoogleDrivePicker; 