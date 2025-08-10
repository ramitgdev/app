import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Button, Stack, Chip, 
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  IconButton, Alert, CircularProgress, Divider, TextField
} from '@mui/material';
import {
  Google, Cloud, Folder, InsertDriveFile, Search, Refresh,
  Create, Visibility, Download, Share, Star, StarBorder, OpenInNew
} from '@mui/icons-material';

// Google Drive Picker Component
function GoogleDrivePicker({ googleToken, onFileSelect, setGlobalSnackbar }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [driveFiles, setDriveFiles] = useState([]);

  // Your Google Cloud credentials
  const CLIENT_ID = '946277888643-821lvkhan6jmpi6ngi8l93b45kuhm71e.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyBzq3IXRJ918muozJOq02BAYTBCBdFahLE';

  // Load Google Drive files
  const loadDriveFiles = useCallback(async () => {
    if (!googleToken) return;

    setLoading(true);
    setError('');

    try {
      // For now, let's create a simple interface that shows sample files
      // In a real implementation, you would call the Google Drive API here
      setTimeout(() => {
        const sampleFiles = [
          {
            id: 'doc1',
            name: 'Project Proposal',
            mimeType: 'application/vnd.google-apps.document',
            sizeBytes: 15000,
            downloadUrl: 'https://docs.google.com/document/d/doc1/edit',
            createdTime: new Date().toISOString()
          },
          {
            id: 'sheet1',
            name: 'Budget Spreadsheet',
            mimeType: 'application/vnd.google-apps.spreadsheet',
            sizeBytes: 25000,
            downloadUrl: 'https://docs.google.com/spreadsheets/d/sheet1/edit',
            createdTime: new Date().toISOString()
          },
          {
            id: 'slides1',
            name: 'Presentation Deck',
            mimeType: 'application/vnd.google-apps.presentation',
            sizeBytes: 18000,
            downloadUrl: 'https://docs.google.com/presentation/d/slides1/edit',
            createdTime: new Date().toISOString()
          },
          {
            id: 'folder1',
            name: 'Work Documents',
            mimeType: 'application/vnd.google-apps.folder',
            sizeBytes: 0,
            createdTime: new Date().toISOString()
          }
        ];

        setDriveFiles(sampleFiles);
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error('Error loading Drive files:', err);
      setError('Failed to load Google Drive files. Please try again.');
      setLoading(false);
    }
  }, [googleToken]);

  // Load files when component mounts or token changes
  useEffect(() => {
    if (googleToken) {
      loadDriveFiles();
    }
  }, [googleToken, loadDriveFiles]);

  // Handle opening Google Drive in new tab
  const handleOpenDriveInNewTab = () => {
    window.open('https://drive.google.com', '_blank');
    setGlobalSnackbar({
      open: true,
      message: 'Opening Google Drive in new tab',
      severity: 'info'
    });
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setDriveFiles(driveFiles); // Reset to all files
      return;
    }

    const filteredFiles = driveFiles.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDriveFiles(filteredFiles);
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType) => {
    if (mimeType.includes('folder')) return <Folder />;
    if (mimeType.includes('document')) return <InsertDriveFile />;
    if (mimeType.includes('spreadsheet')) return <InsertDriveFile />;
    if (mimeType.includes('presentation')) return <InsertDriveFile />;
    if (mimeType.includes('image')) return <InsertDriveFile />;
    if (mimeType.includes('video')) return <InsertDriveFile />;
    if (mimeType.includes('audio')) return <InsertDriveFile />;
    return <InsertDriveFile />;
  };

  // Get file type label
  const getFileTypeLabel = (mimeType) => {
    if (mimeType.includes('folder')) return 'Folder';
    if (mimeType.includes('document')) return 'Google Doc';
    if (mimeType.includes('spreadsheet')) return 'Google Sheet';
    if (mimeType.includes('presentation')) return 'Google Slides';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('video')) return 'Video';
    if (mimeType.includes('audio')) return 'Audio';
    return 'File';
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
            Google Drive Picker
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadDriveFiles}
            disabled={loading}
          >
            Refresh
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

      {/* Info Card */}
      <Card sx={{ p: 3, mb: 3, bgcolor: '#f0f8ff' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          <Cloud sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          Google Drive Integration
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Browse and manage your Google Drive files directly in your workspace. You can view, open, and organize 
          your files with full integration to Google Workspace applications.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="📁 Browse Files" size="small" color="primary" variant="outlined" />
          <Chip label="👀 Preview Files" size="small" color="primary" variant="outlined" />
          <Chip label="🔍 Search Files" size="small" color="primary" variant="outlined" />
          <Chip label="📋 File Management" size="small" color="primary" variant="outlined" />
        </Stack>
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
          {error}
        </Alert>
      )}

      {/* Google Drive Files */}
      {driveFiles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" fontWeight={600}>
              Google Drive Files ({driveFiles.length})
            </Typography>
          </Box>
          <List>
            {driveFiles.map((file, index) => (
              <ListItem
                key={file.id || index}
                button
                onClick={() => handleFileSelect(file)}
                sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
              >
                <ListItemIcon>
                  {getFileIcon(file.mimeType)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${getFileTypeLabel(file.mimeType)} • Size: ${file.sizeBytes ? `${Math.round(file.sizeBytes / 1024)} KB` : 'Unknown'} • Created: ${new Date(file.createdTime).toLocaleDateString()}`}
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
                    {file.downloadUrl && (
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.downloadUrl, '_blank');
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
      {driveFiles.length === 0 && !loading && (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Cloud sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            No files found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Your Google Drive files will appear here once loaded
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