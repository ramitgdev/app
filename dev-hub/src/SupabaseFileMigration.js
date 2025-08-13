import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import supabaseFileStorage from './supabase-file-storage';

const SupabaseFileMigration = ({ 
  open, 
  onClose, 
  workspaceId, 
  localResources = [], 
  onMigrationComplete 
}) => {
  const [migrationState, setMigrationState] = useState('idle'); // idle, analyzing, migrating, complete, error
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [error, setError] = useState(null);

  // Analyze local files when dialog opens
  useEffect(() => {
    if (open && localResources.length > 0 && migrationState === 'idle') {
      analyzeFiles();
    }
  }, [open, localResources, migrationState]);

  const analyzeFiles = () => {
    setMigrationState('analyzing');
    
    // Filter files that have content to migrate
    const filesToMigrate = localResources.filter(resource => 
      resource.notes && resource.notes.trim().length > 0
    );

    setStats({
      total: filesToMigrate.length,
      success: 0,
      failed: 0
    });

    setTimeout(() => {
      setMigrationState('ready');
    }, 1000);
  };

  const startMigration = async () => {
    setMigrationState('migrating');
    setProgress(0);
    setResults([]);
    setError(null);

    const filesToMigrate = localResources.filter(resource => 
      resource.notes && resource.notes.trim().length > 0
    );

    let successCount = 0;
    let failedCount = 0;
    const migrationResults = [];

    for (let i = 0; i < filesToMigrate.length; i++) {
      const resource = filesToMigrate[i];
      
      try {
        // Update progress
        setProgress(((i + 1) / filesToMigrate.length) * 100);

        // Migrate file to Supabase
        const result = await supabaseFileStorage.saveFile(workspaceId, {
          title: resource.title,
          content: resource.notes,
          platform: resource.platform || 'Migrated from Local',
          folder: resource.folder || 0,
          folderName: getFolderName(resource.folder),
          type: 'file'
        });

        if (result.success) {
          successCount++;
          migrationResults.push({
            original: resource,
            status: 'success',
            newFile: result.file,
            message: 'Successfully migrated to Supabase'
          });
        } else {
          failedCount++;
          migrationResults.push({
            original: resource,
            status: 'error',
            error: result.error,
            message: result.error || 'Migration failed'
          });
        }
      } catch (error) {
        failedCount++;
        migrationResults.push({
          original: resource,
          status: 'error',
          error: error.message,
          message: error.message || 'Migration failed'
        });
      }

      // Update stats
      setStats({
        total: filesToMigrate.length,
        success: successCount,
        failed: failedCount
      });

      setResults([...migrationResults]);

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setMigrationState('complete');
    
    // Notify parent component
    if (onMigrationComplete) {
      onMigrationComplete({
        success: successCount,
        failed: failedCount,
        results: migrationResults
      });
    }
  };

  const getFolderName = (folderId) => {
    // This would need to be passed from parent or fetched
    // For now, return a default
    return folderId === 0 ? 'All Resources' : `Folder ${folderId}`;
  };

  const handleClose = () => {
    if (migrationState === 'migrating') {
      // Don't allow closing during migration
      return;
    }
    onClose();
  };

  const renderContent = () => {
    switch (migrationState) {
      case 'analyzing':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <StorageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Analyzing Local Files
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Scanning your workspace for files to migrate...
            </Typography>
            <LinearProgress />
          </Box>
        );

      case 'ready':
        const filesToMigrate = localResources.filter(resource => 
          resource.notes && resource.notes.trim().length > 0
        );
        
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Migration Ready!</strong> We found {filesToMigrate.length} files with content that can be migrated to Supabase Storage.
                This will enable file sharing with your collaborators.
              </Typography>
            </Alert>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Migration Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip 
                    icon={<FileIcon />} 
                    label={`${filesToMigrate.length} Files`} 
                    color="primary" 
                  />
                  <Chip 
                    icon={<StorageIcon />} 
                    label="Supabase Storage" 
                    color="success" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Files will be uploaded to Supabase Storage and linked to your workspace.
                  Your collaborators will be able to see and edit these files.
                </Typography>
              </CardContent>
            </Card>

            {filesToMigrate.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Files to Migrate:
                </Typography>
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {filesToMigrate.slice(0, 10).map((resource, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <FileIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={resource.title}
                        secondary={`${resource.notes?.length || 0} characters`}
                      />
                    </ListItem>
                  ))}
                  {filesToMigrate.length > 10 && (
                    <ListItem>
                      <ListItemText
                        primary={`... and ${filesToMigrate.length - 10} more files`}
                        sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        );

      case 'migrating':
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Migrating Files to Supabase
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please don't close this dialog while migration is in progress...
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Progress: {stats.success + stats.failed} / {stats.total}
                </Typography>
                <Typography variant="body2">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`${stats.success} Success`} 
                color="success" 
                size="small"
              />
              <Chip 
                icon={<ErrorIcon />} 
                label={`${stats.failed} Failed`} 
                color="error" 
                size="small"
              />
            </Box>

            {results.length > 0 && (
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {results.map((result, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {result.status === 'success' ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.original.title}
                      secondary={result.message}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 'complete':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Migration Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your files have been successfully migrated to Supabase Storage.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`${stats.success} Files Migrated`} 
                color="success" 
              />
              {stats.failed > 0 && (
                <Chip 
                  icon={<ErrorIcon />} 
                  label={`${stats.failed} Failed`} 
                  color="error" 
                />
              )}
            </Box>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>What's Next?</strong> Your files are now stored in Supabase and can be shared with collaborators.
                The browser storage quota issue should be resolved!
              </Typography>
            </Alert>

            {stats.failed > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Some files failed to migrate. You can try migrating them again or check the error details above.
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Migration Error
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {error || 'An unexpected error occurred during migration.'}
            </Typography>
            <Alert severity="error">
              <Typography variant="body2">
                Please check your Supabase connection and try again.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={migrationState === 'migrating'}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudUploadIcon color="primary" />
        Migrate Files to Supabase Storage
      </DialogTitle>
      
      <DialogContent sx={{ minHeight: 400 }}>
        {renderContent()}
      </DialogContent>
      
      <DialogActions>
        {migrationState === 'ready' && (
          <>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={startMigration}
              variant="contained"
              startIcon={<CloudUploadIcon />}
              disabled={stats.total === 0}
            >
              Start Migration
            </Button>
          </>
        )}
        
        {migrationState === 'migrating' && (
          <Button disabled>
            Migrating... ({stats.success + stats.failed}/{stats.total})
          </Button>
        )}
        
        {migrationState === 'complete' && (
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        )}
        
        {migrationState === 'error' && (
          <>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={startMigration} variant="contained">
              Try Again
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SupabaseFileMigration;
