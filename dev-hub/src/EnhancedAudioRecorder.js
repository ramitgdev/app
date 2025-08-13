import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Button, IconButton, Typography, LinearProgress,
  Alert, Chip, Stack, Card, CardContent, Tooltip
} from '@mui/material';
import {
  Mic, Stop, PlayArrow, Pause, Delete, CloudUpload,
  Download, VolumeUp, Timer, Storage
} from '@mui/icons-material';
import storageService from './storage-service.js';

export default function EnhancedAudioRecorder({
  onUpload,
  resourceId,
  currentUser,
  workspaceId = null,
  showStorageInfo = true
}) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [storedFiles, setStoredFiles] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);

  const audioRef = useRef();
  const recordingTimerRef = useRef();
  const streamRef = useRef();

  // Load stored audio files for this resource
  useEffect(() => {
    if (resourceId) {
      loadStoredFiles();
    }
  }, [resourceId]);

  // Load storage information
  useEffect(() => {
    if (showStorageInfo) {
      loadStorageInfo();
    }
  }, [showStorageInfo]);

  const loadStoredFiles = async () => {
    try {
      const files = await storageService.listFiles(`audio/${resourceId}/`);
      setStoredFiles(files.files || []);
    } catch (error) {
      console.error('Failed to load stored files:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      // This would show storage usage information
      setStorageInfo({
        provider: storageService.config.provider,
        used: '2.5 GB',
        total: '10 GB',
        files: storedFiles.length
      });
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const startRecording = async () => {
    setError(null);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      const recorder = new window.MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Microphone access denied or not available. Please check your browser permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setRecording(false);

      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `audio_${timestamp}.webm`;
      const filePath = `audio/${resourceId || 'general'}/${fileName}`;

      // Create file object
      const file = new File([audioBlob], fileName, { type: 'audio/webm' });

      // Upload to external storage
      const result = await storageService.uploadFile(file, filePath, {
        resourceId,
        workspaceId,
        userId: currentUser?.id,
        recordingTime,
        uploadedAt: new Date().toISOString()
      });

      // Call the original onUpload callback if provided
      if (onUpload) {
        await onUpload(audioBlob, resourceId, currentUser, result);
      }

      // Clear local state
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);

      // Reload stored files
      await loadStoredFiles();

      // Show success message
      console.log('Audio uploaded successfully:', result);

    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload audio. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleDelete = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setError(null);
  };

  const downloadStoredFile = async (file) => {
    try {
      const result = await storageService.downloadFile(file.path);
      const url = URL.createObjectURL(result.blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'audio.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file.');
    }
  };

  const deleteStoredFile = async (file) => {
    try {
      await storageService.deleteFile(file.path);
      await loadStoredFiles();
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete file.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      {/* Storage Information */}
      {showStorageInfo && storageInfo && (
        <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Storage color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Storage: {storageInfo.provider}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {storageInfo.files} files • {storageInfo.used} / {storageInfo.total}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Recording Controls */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button
              variant={recording ? "contained" : "outlined"}
              color={recording ? "error" : "primary"}
              startIcon={recording ? <Stop /> : <Mic />}
              onClick={recording ? stopRecording : startRecording}
              disabled={uploading}
              sx={{ minWidth: 120 }}
            >
              {recording ? 'Stop' : 'Record'}
            </Button>

            {recordingTime > 0 && (
              <Chip
                icon={<Timer />}
                label={formatTime(recordingTime)}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Recording Progress */}
          {recording && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="indeterminate"
                color="error"
                sx={{ height: 4, borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Recording... {formatTime(recordingTime)}
              </Typography>
            </Box>
          )}

          {/* Audio Preview */}
          {audioUrl && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IconButton onClick={handlePlayPause} color="primary">
                  {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                <Typography variant="body2">
                  Preview ({formatFileSize(audioBlob?.size || 0)})
                </Typography>
                <IconButton onClick={handleDelete} color="error" size="small">
                  <Delete />
                </IconButton>
              </Stack>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setPlaying(false)}
                style={{ width: '100%' }}
              />

              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleUpload}
                disabled={uploading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {uploading ? 'Uploading...' : 'Upload to Cloud Storage'}
              </Button>

              {uploading && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stored Files */}
      {storedFiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Stored Audio Files
            </Typography>

            <Stack spacing={1}>
              {storedFiles.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <VolumeUp color="primary" />
                    <Box>
                      <Typography variant="body2">
                        {file.name || 'Audio File'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.size || 0)} • {file.metadata?.uploadedAt ?
                          new Date(file.metadata.uploadedAt).toLocaleDateString() : 'Unknown date'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => downloadStoredFile(file)}
                        color="primary"
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => deleteStoredFile(file)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
