import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, TextField, Stack, Chip, 
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  IconButton, Breadcrumbs, Link, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Divider, Paper, Grid, Avatar, MenuItem
} from '@mui/material';
import {
  Folder, InsertDriveFile, Search, Refresh,
  Create, CloudUpload, Download, Delete, Share,
  Star, StarBorder, Visibility, Edit,
  Cloud, Google, Home, NavigateNext,
  Slideshow, Image, Videocam, Audiotrack
} from '@mui/icons-material';

// Google Drive Interface Component
function GoogleDriveInterface({ googleToken, onFileSelect, onFolderOpen }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState({ id: 'root', name: 'My Drive' });
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'My Drive' }]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedItems, setSelectedItems] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newItemType, setNewItemType] = useState('folder');
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');

  // Load files and folders when component mounts or current folder changes
  useEffect(() => {
    if (googleToken && currentFolder) {
      loadDriveContents();
    }
  }, [googleToken, currentFolder]);

  // Load Google Drive contents
  const loadDriveContents = async () => {
    if (!googleToken) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Load folders
      const foldersResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${currentFolder.id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false&orderBy=name&key=${process.env.REACT_APP_GOOGLE_API_KEY || ''}`,
        {
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Load files
      const filesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${currentFolder.id}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false&orderBy=name&key=${process.env.REACT_APP_GOOGLE_API_KEY || ''}`,
        {
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (foldersResponse.ok && filesResponse.ok) {
        const foldersData = await foldersResponse.json();
        const filesData = await filesResponse.json();
        
        setFolders(foldersData.files || []);
        setFiles(filesData.files || []);
      } else {
        throw new Error('Failed to load Drive contents');
      }
    } catch (err) {
      console.error('Error loading Drive contents:', err);
      setError('Failed to load Drive contents. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to a folder
  const openFolder = (folder) => {
    const newBreadcrumbs = [...breadcrumbs, { id: folder.id, name: folder.name }];
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(folder);
    setSelectedItems([]);
  };

  // Navigate back using breadcrumbs
  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1]);
    setSelectedItems([]);
  };

  // Search files and folders
  const handleSearch = async () => {
    if (!searchQuery.trim() || !googleToken) return;
    
    setLoading(true);
    setError('');
    
    try {
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name contains '${searchQuery}' and trashed=false&key=${process.env.REACT_APP_GOOGLE_API_KEY || ''}`,
        {
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const searchResults = searchData.files || [];
        
        // Separate folders and files
        const searchFolders = searchResults.filter(item => 
          item.mimeType === 'application/vnd.google-apps.folder'
        );
        const searchFiles = searchResults.filter(item => 
          item.mimeType !== 'application/vnd.google-apps.folder'
        );
        
        setFolders(searchFolders);
        setFiles(searchFiles);
        
        // Update breadcrumbs to show search results
        setBreadcrumbs([{ id: 'search', name: `Search: "${searchQuery}"` }]);
        setCurrentFolder({ id: 'search', name: `Search: "${searchQuery}"` });
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create new folder or file
  const createNewItem = async () => {
    if (!newItemName.trim() || !googleToken) return;
    
    setLoading(true);
    setError('');
    
    try {
      let metadata = {
        name: newItemName,
        parents: [currentFolder.id]
      };

      if (newItemType === 'folder') {
        metadata.mimeType = 'application/vnd.google-apps.folder';
      } else if (newItemType === 'document') {
        metadata.mimeType = 'application/vnd.google-apps.document';
      } else if (newItemType === 'spreadsheet') {
        metadata.mimeType = 'application/vnd.google-apps.spreadsheet';
      } else if (newItemType === 'presentation') {
        metadata.mimeType = 'application/vnd.google-apps.presentation';
      }

      const createResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metadata)
        }
      );

      if (createResponse.ok) {
        const newItem = await createResponse.json();
        
        if (newItemType === 'folder') {
          setFolders(prev => [...prev, newItem]);
        } else {
          setFiles(prev => [...prev, newItem]);
        }
        
        setShowCreateDialog(false);
        setNewItemName('');
        setNewItemType('folder');
        
        // Refresh contents
        loadDriveContents();
      } else {
        throw new Error('Failed to create item');
      }
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType) => {
    if (mimeType.includes('folder')) return <Folder />;
    if (mimeType.includes('document')) return <Edit />;
    if (mimeType.includes('spreadsheet')) return <Create />;
    if (mimeType.includes('presentation')) return <Slideshow />;
    if (mimeType.includes('image')) return <Image />;
    if (mimeType.includes('video')) return <Videocam />;
    if (mimeType.includes('audio')) return <Audiotrack />;
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

  // Handle file selection
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Handle item selection for bulk operations
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Delete selected items
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0 || !googleToken) return;
    
    setLoading(true);
    setError('');
    
    try {
      for (const itemId of selectedItems) {
        await fetch(
          `https://www.googleapis.com/drive/v3/files/${itemId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${googleToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      setSelectedItems([]);
      loadDriveContents(); // Refresh contents
    } catch (err) {
      console.error('Error deleting items:', err);
      setError('Failed to delete some items. Please try again.');
    } finally {
      setLoading(false);
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
            onClick={loadDriveContents}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Create />}
            onClick={() => setShowCreateDialog(true)}
            sx={{ 
              background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3367d6 30%, #2e7d32 90%)'
              }
            }}
          >
            Create New
          </Button>
        </Stack>
      </Box>

      {/* Search Bar */}
      <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search files and folders..."
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

      {/* Breadcrumbs */}
      <Card sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={crumb.id}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              underline="hover"
              onClick={() => navigateToBreadcrumb(index)}
              sx={{ cursor: 'pointer' }}
            >
              {index === 0 ? <Home sx={{ mr: 0.5, fontSize: 16 }} /> : null}
              {crumb.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card sx={{ p: 2, mb: 3, bgcolor: '#fff3e0' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              {selectedItems.length} item(s) selected
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Delete />}
              onClick={deleteSelectedItems}
              color="error"
            >
              Delete Selected
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSelectedItems([])}
            >
              Clear Selection
            </Button>
          </Stack>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!loading && (
        <Box>
          {/* Folders */}
          {folders.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" fontWeight={600}>
                  Folders ({folders.length})
                </Typography>
              </Box>
              <List>
                {folders.map((folder) => (
                  <ListItem
                    key={folder.id}
                    button
                    onClick={() => openFolder(folder)}
                    sx={{ 
                      '&:hover': { bgcolor: '#f5f5f5' },
                      bgcolor: selectedItems.includes(folder.id) ? '#e3f2fd' : 'transparent'
                    }}
                  >
                                         <ListItemIcon>
                       <Folder sx={{ color: '#ffa000' }} />
                     </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={`Created: ${new Date(folder.createdTime).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                                             <IconButton
                         edge="end"
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleItemSelection(folder.id);
                         }}
                       >
                         {selectedItems.includes(folder.id) ? <Star color="primary" /> : <StarBorder />}
                       </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Card>
          )}

          {/* Files */}
          {files.length > 0 && (
            <Card>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" fontWeight={600}>
                  Files ({files.length})
                </Typography>
              </Box>
              <List>
                {files.map((file) => (
                  <ListItem
                    key={file.id}
                    button
                    onClick={() => handleFileSelect(file)}
                    sx={{ 
                      '&:hover': { bgcolor: '#f5f5f5' },
                      bgcolor: selectedItems.includes(file.id) ? '#e3f2fd' : 'transparent'
                    }}
                  >
                    <ListItemIcon>
                      {getFileIcon(file.mimeType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${getFileTypeLabel(file.mimeType)} • Modified: ${new Date(file.modifiedTime).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                                                 <Tooltip title="View">
                           <IconButton
                             edge="end"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleFileSelect(file);
                             }}
                           >
                             <Visibility />
                           </IconButton>
                         </Tooltip>
                         <IconButton
                           edge="end"
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleItemSelection(file.id);
                           }}
                         >
                           {selectedItems.includes(file.id) ? <Star color="primary" /> : <StarBorder />}
                         </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Card>
          )}

          {/* Empty State */}
          {folders.length === 0 && files.length === 0 && !searchQuery && (
                         <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
               <Cloud sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" mb={1}>
                 {currentFolder.id === 'root' ? 'Your Drive is empty' : 'This folder is empty'}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 Start by creating a new folder or uploading files
               </Typography>
             </Card>
          )}

          {/* Search Results Empty */}
          {folders.length === 0 && files.length === 0 && searchQuery && (
                         <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
               <Search sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" mb={1}>
                 No results found
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 Try adjusting your search terms or browse your Drive
               </Typography>
             </Card>
          )}
        </Box>
      )}

      {/* Create New Item Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter name..."
              fullWidth
            />
            
            <TextField
              select
              label="Type"
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value)}
              fullWidth
            >
              <MenuItem value="folder">Folder</MenuItem>
              <MenuItem value="document">Google Document</MenuItem>
              <MenuItem value="spreadsheet">Google Spreadsheet</MenuItem>
              <MenuItem value="presentation">Google Presentation</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={createNewItem} 
            variant="contained"
            disabled={!newItemName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GoogleDriveInterface; 