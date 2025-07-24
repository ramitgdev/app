import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, Typography, Button, Box, Stack, IconButton, Slider, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import WaveformIcon from '@mui/icons-material/GraphicEq';
import { uploadAudioComment, fetchAudioComments } from './audioCommentsApi';

// Simple waveform visualization component
function WaveformVisualizer({ audioData, isPlaying, currentTime, duration }) {
  const canvasRef = useRef();
  
  useEffect(() => {
    if (!audioData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw waveform
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const sliceWidth = width / audioData.length;
    let x = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const v = audioData[i] / 128.0;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
    
    // Draw progress indicator
    if (isPlaying && duration > 0) {
      const progressX = (currentTime / duration) * width;
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
    }
  }, [audioData, isPlaying, currentTime, duration]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={80} 
      style={{ 
        border: '1px solid #ddd', 
        borderRadius: 4, 
        background: '#f9f9f9',
        width: '100%',
        maxWidth: 400
      }} 
    />
  );
}

// Individual audio comment component
function AudioComment({ comment, currentUser, onReply, onDelete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef();
  
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };
  
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card sx={{ p: 2, mb: 2, bgcolor: '#f8fafc' }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {comment.user_email?.[0]?.toUpperCase() || '?'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              {comment.user_email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(comment.created_at).toLocaleString()}
            </Typography>
          </Stack>
          
          <Box sx={{ mb: 2 }}>
            <audio
              ref={audioRef}
              src={comment.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              style={{ display: 'none' }}
            />
            
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <IconButton 
                onClick={togglePlay} 
                color="primary"
                sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              
              <Box sx={{ flex: 1 }}>
                <Slider
                  value={currentTime}
                  max={duration || 100}
                  onChange={(_, value) => {
                    audioRef.current.currentTime = value;
                    setCurrentTime(value);
                  }}
                  size="small"
                />
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Stack>
            
            <WaveformVisualizer 
              audioData={comment.waveform_data || []} 
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
            />
          </Box>
          
          {comment.transcript && (
            <Box sx={{ mb: 1, p: 1, bgcolor: '#fff', borderRadius: 1, border: '1px solid #eee' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Transcript:
              </Typography>
              <Typography variant="body2">{comment.transcript}</Typography>
            </Box>
          )}
          
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              startIcon={<ReplyIcon />} 
              onClick={() => onReply(comment)}
            >
              Reply
            </Button>
            {currentUser?.id === comment.user_id && (
              <Button 
                size="small" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(comment.id)}
              >
                Delete
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

export default function EnhancedAudioRecorder({ resourceId, currentUser, workspaceId }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyDialog, setReplyDialog] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [waveformData, setWaveformData] = useState([]);
  const audioRef = useRef();
  const analyserRef = useRef();
  
  // Load existing comments
  useEffect(() => {
    if (resourceId) {
      loadComments();
    }
  }, [resourceId]);
  
  const loadComments = async () => {
    try {
      const data = await fetchAudioComments(resourceId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };
  
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for waveform
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const recorder = new window.MediaRecorder(stream);
      let chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start waveform visualization
      const updateWaveform = () => {
        if (!analyserRef.current || !recording) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        setWaveformData([...dataArray]);
        requestAnimationFrame(updateWaveform);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      updateWaveform();
      
    } catch (err) {
      setError('Microphone access denied or not available.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };
  
  const handleUpload = async () => {
    if (!audioBlob) return;
    
    setLoading(true);
    try {
      await uploadAudioComment(audioBlob, resourceId, currentUser);
      setAudioBlob(null);
      setAudioUrl(null);
      setWaveformData([]);
      await loadComments();
    } catch (err) {
      setError('Failed to upload audio comment: ' + err.message);
    }
    setLoading(false);
  };
  
  const handleReply = (comment) => {
    setReplyDialog(comment);
  };
  
  const submitReply = async () => {
    if (!replyText.trim()) return;
    
    // For now, just add as a text comment - could be enhanced to support audio replies
    try {
      // This would need a separate API for text replies
      console.log('Reply to comment:', replyDialog.id, 'Text:', replyText);
      setReplyDialog(null);
      setReplyText('');
    } catch (err) {
      setError('Failed to submit reply: ' + err.message);
    }
  };
  
  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this audio comment?')) return;
    
    try {
      // This would need a delete API
      console.log('Delete comment:', commentId);
      await loadComments();
    } catch (err) {
      setError('Failed to delete comment: ' + err.message);
    }
  };
  
  return (
    <Card sx={{ p: 3, mt: 2, bgcolor: '#f7fafd', border: '1px solid #e3f2fd' }}>
      <Typography variant="h6" fontWeight={700} mb={2} color="primary">
        <WaveformIcon sx={{ mr: 1 }} />
        Audio Comments
      </Typography>
      
      {/* Recording Controls */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          {!recording ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MicIcon />}
              onClick={startRecording}
              size="large"
            >
              Record Audio Comment
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopRecording}
              size="large"
            >
              Stop Recording
            </Button>
          )}
          
          {recording && (
            <Chip 
              label="Recording..." 
              color="error" 
              variant="outlined"
              sx={{ animation: 'pulse 1.5s infinite' }}
            />
          )}
        </Stack>
        
        {/* Live waveform during recording */}
        {recording && waveformData.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" mb={1} display="block">
              Live Audio Visualization:
            </Typography>
            <WaveformVisualizer 
              audioData={waveformData} 
              isPlaying={recording}
              currentTime={0}
              duration={0}
            />
          </Box>
        )}
        
        {/* Preview recorded audio */}
        {audioUrl && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={1}>Preview:</Typography>
            <audio ref={audioRef} src={audioUrl} controls style={{ width: '100%', marginBottom: 8 }} />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Post Comment'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setAudioUrl(null);
                  setAudioBlob(null);
                  setWaveformData([]);
                }}
              >
                Discard
              </Button>
            </Stack>
          </Box>
        )}
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
      
      {/* Comments List */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Comments ({comments.length})
        </Typography>
        
        {comments.length === 0 ? (
          <Typography color="text.secondary" fontStyle="italic">
            No audio comments yet. Be the first to leave one!
          </Typography>
        ) : (
          comments.map(comment => (
            <AudioComment
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        )}
      </Box>
      
      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onClose={() => setReplyDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Audio Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your reply"
            multiline
            rows={3}
            fullWidth
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(null)}>Cancel</Button>
          <Button onClick={submitReply} variant="contained">Reply</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
