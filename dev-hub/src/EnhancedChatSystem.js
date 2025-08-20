import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Badge, Divider, Paper, Stack, Tooltip, Menu, MenuItem,
  Alert, Snackbar, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  Fade, Zoom, Slide, Fab, CardHeader, CardActions, InputAdornment, ListItemButton,
  ListItemSecondaryAction, Skeleton, LinearProgress, AlertTitle
} from '@mui/material';
import {
  Send as SendIcon, AttachFile as AttachFileIcon, Code as CodeIcon,
  Group as GroupIcon, Person as PersonIcon, Settings as SettingsIcon,
  Notifications as NotificationsIcon, NotificationsOff as NotificationsOffIcon,
  MoreVert as MoreVertIcon, Chat as ChatIcon, ContentCopy as CopyIcon,
  CheckCircle as CheckIcon, InsertDriveFile as FileIcon, Image as ImageIcon,
  ExpandMore as ExpandMoreIcon, EmojiEmotions as EmojiIcon, 
  Mic as MicIcon, Videocam as VideoIcon, ScreenShare as ScreenShareIcon,
  Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon,
  KeyboardArrowDown as ArrowDownIcon, KeyboardArrowUp as ArrowUpIcon,
  Circle as CircleIcon, FiberManualRecord as OnlineIcon,
  Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
  OpenInFull as OpenInFullIcon, Close as CloseIcon
} from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Enhanced Chat System Component
export default function EnhancedChatSystem({ workspaceId, currentUserId, collaborators }) {
  const [activeTab, setActiveTab] = useState(0);
  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [input, setInput] = useState('');
  const [groupInput, setGroupInput] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [fileUpload, setFileUpload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWideMode, setIsWideMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const groupMessagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const groupInputRef = useRef(null);

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when in fullscreen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!workspaceId) return;

    console.log('Setting up real-time subscriptions for workspace:', workspaceId);

    // Subscribe to workspace group messages
    const groupSubscription = supabase
      .channel(`workspace-${workspaceId}-group`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workspace_group_chats',
        filter: `workspace_id=eq.${workspaceId}`
      }, (payload) => {
        console.log('New group message received:', payload.new);
        setGroupMessages(prev => [...prev, payload.new]);
        scrollToBottom(groupMessagesEndRef);
      })
      .subscribe();

    // Subscribe to direct messages
    const directSubscription = supabase
      .channel(`workspace-${workspaceId}-direct`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workspace_chats',
        filter: `workspace_id=eq.${workspaceId}`
      }, (payload) => {
        console.log('New direct message received:', payload.new);
        if (payload.new.sender_id === selectedRecipient?.user_id || 
            payload.new.recipient_id === selectedRecipient?.user_id) {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom(messagesEndRef);
        }
      })
      .subscribe();

    // Subscribe to user presence
    const presenceSubscription = supabase
      .channel(`workspace-${workspaceId}-presence`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceSubscription.presenceState();
        console.log('Presence state:', state);
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions');
      groupSubscription.unsubscribe();
      directSubscription.unsubscribe();
      presenceSubscription.unsubscribe();
    };
  }, [workspaceId, selectedRecipient]);

  // Load initial messages
  useEffect(() => {
    if (workspaceId) {
      console.log('Loading initial messages for workspace:', workspaceId);
      loadGroupMessages();
      if (selectedRecipient) {
        loadDirectMessages();
      }
    }
  }, [workspaceId, selectedRecipient]);

  // Add effect to load direct messages when recipient changes
  useEffect(() => {
    if (selectedRecipient && workspaceId) {
      console.log('Recipient changed, loading direct messages for:', selectedRecipient.user_id);
      loadDirectMessages();
    }
  }, [selectedRecipient?.user_id, workspaceId]);

  const scrollToBottom = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadGroupMessages = async () => {
    try {
      console.log('Loading group messages...');
      const { data, error } = await supabase
        .from('workspace_group_chats')
        .select(`
          *,
          sender:users(full_name, email, avatar_url)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading group messages:', error);
        throw error;
      }
      
      console.log('Group messages loaded:', data);
      setGroupMessages(data || []);
    } catch (error) {
      console.error('Error loading group messages:', error);
      showNotification('Error loading messages: ' + error.message, 'error');
    }
  };

  const loadDirectMessages = async () => {
    if (!selectedRecipient) return;
    
    try {
      console.log('Loading direct messages for recipient:', selectedRecipient.user_id);
      const { data, error } = await supabase
        .from('workspace_chats')
        .select('*')
        .eq('workspace_id', workspaceId)
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedRecipient.user_id}),and(sender_id.eq.${selectedRecipient.user_id},recipient_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading direct messages:', error);
        throw error;
      }
      
      console.log('Direct messages loaded:', data);
      setMessages(data || []);
      scrollToBottom(messagesEndRef);
    } catch (error) {
      console.error('Error loading direct messages:', error);
      showNotification('Error loading messages: ' + error.message, 'error');
    }
  };

  const sendGroupMessage = async () => {
    if (!groupInput.trim()) return;

    try {
      setIsLoading(true);
      console.log('Sending group message:', groupInput);
      
      const { data, error } = await supabase
        .from('workspace_group_chats')
        .insert([{
          workspace_id: workspaceId,
          sender_id: currentUserId,
          message: groupInput,
          message_type: 'text'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error sending group message:', error);
        throw error;
      }

      console.log('Group message sent successfully:', data);
      setGroupInput('');
      showNotification('Message sent!', 'success');
    } catch (error) {
      console.error('Error sending group message:', error);
      showNotification('Error sending message: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendDirectMessage = async () => {
    if (!input.trim() || !selectedRecipient) return;

    try {
      setIsLoading(true);
      console.log('Sending direct message to:', selectedRecipient.user_id);
      
      const { data, error } = await supabase
        .from('workspace_chats')
        .insert([{
          workspace_id: workspaceId,
          sender_id: currentUserId,
          recipient_id: selectedRecipient.user_id,
          message: input,
          message_type: 'text'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error sending direct message:', error);
        throw error;
      }

      console.log('Direct message sent successfully:', data);
      setInput('');
      setMessages(prev => [...prev, data]);
      scrollToBottom(messagesEndRef);
      showNotification('Message sent!', 'success');
    } catch (error) {
      console.error('Error sending direct message:', error);
      showNotification('Error sending message: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `workspace-${workspaceId}/chat-files/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('workspace-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('workspace-files')
        .getPublicUrl(filePath);

      // Send file message
      const messageData = {
        workspace_id: workspaceId,
        sender_id: currentUserId,
        message: `📎 ${file.name}`,
        message_type: 'file',
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size
      };

      if (activeTab === 0) {
        // Group message
        await supabase.from('workspace_group_chats').insert([messageData]);
      } else {
        // Direct message
        messageData.recipient_id = selectedRecipient.user_id;
        await supabase.from('workspace_chats').insert([messageData]);
      }

      showNotification('File uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Error uploading file: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
      setFileUpload(null);
    }
  };

  const copyMessage = async (message, messageId) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      showNotification('Message copied to clipboard', 'success');
    } catch (error) {
      console.error('Error copying message:', error);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = (message, isGroup = false) => {
    const isOwnMessage = message.sender_id === currentUserId;
    const isFile = message.message_type === 'file';
    const isCode = message.message.includes('```');

    return (
      <Fade in={true} timeout={300}>
        <ListItem
          sx={{
            flexDirection: 'column',
            alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
            mb: 2,
            px: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, maxWidth: '80%' }}>
            {!isOwnMessage && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {message.sender?.full_name?.[0] || message.sender?.email?.[0] || 'U'}
              </Avatar>
            )}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
              {!isOwnMessage && isGroup && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    mb: 0.5, 
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                >
                  {message.sender?.full_name || message.sender?.email}
                </Typography>
              )}
              
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  backgroundColor: isOwnMessage ? 'primary.main' : 'background.paper',
                  color: isOwnMessage ? 'white' : 'text.primary',
                  borderRadius: 3,
                  borderTopRightRadius: isOwnMessage ? 1 : 3,
                  borderTopLeftRadius: isOwnMessage ? 3 : 1,
                  maxWidth: '100%',
                  position: 'relative',
                  '&:hover': {
                    elevation: 2,
                    '& .message-actions': {
                      opacity: 1
                    }
                  }
                }}
              >
                {isFile ? (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <FileIcon color={isOwnMessage ? 'inherit' : 'primary'} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {message.file_name}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 1, display: 'block' }}>
                      {(message.file_size / 1024).toFixed(1)} KB
                    </Typography>
                    <Button
                      size="small"
                      variant={isOwnMessage ? 'outlined' : 'contained'}
                      sx={{ 
                        mt: 1,
                        color: isOwnMessage ? 'white' : 'primary',
                        borderColor: isOwnMessage ? 'white' : 'primary',
                        '&:hover': {
                          backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'primary.light'
                        }
                      }}
                      onClick={() => window.open(message.file_url, '_blank')}
                    >
                      Download
                    </Button>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: isCode ? 'monospace' : 'inherit',
                      backgroundColor: isCode ? (isOwnMessage ? 'rgba(255,255,255,0.1)' : 'grey.100') : 'transparent',
                      p: isCode ? 1.5 : 0,
                      borderRadius: isCode ? 1 : 0,
                      fontSize: '0.9rem',
                      lineHeight: 1.5
                    }}
                  >
                    {message.message}
                  </Typography>
                )}
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.7, 
                    mt: 1, 
                    display: 'block',
                    fontSize: '0.7rem'
                  }}
                >
                  {formatTime(message.created_at)}
                </Typography>
              </Paper>
              
              <Box 
                className="message-actions"
                sx={{ 
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  mt: 0.5,
                  display: 'flex',
                  gap: 0.5
                }}
              >
                <Tooltip title="Copy message">
                  <IconButton
                    size="small"
                    onClick={() => copyMessage(message.message, message.id)}
                    sx={{ 
                      width: 24, 
                      height: 24,
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {copiedMessageId === message.id ? 
                      <CheckIcon color="success" fontSize="small" /> : 
                      <CopyIcon fontSize="small" />
                    }
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {isOwnMessage && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                Me
              </Avatar>
            )}
          </Box>
        </ListItem>
      </Fade>
    );
  };

  const renderSlackIntegration = () => (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          backgroundColor: 'grey.50',
          borderRadius: 1,
          '&:hover': { backgroundColor: 'grey.100' }
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ChatIcon color="primary" />
          <Typography variant="body2" fontWeight={500}>External Integrations</Typography>
          <Chip
            label="Coming Soon"
            color="default"
            size="small"
            variant="outlined"
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            External integrations like Slack, Discord, and Microsoft Teams will be available soon.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            For now, enjoy the enhanced group chat and direct messaging features!
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const renderChatHeader = () => (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider', 
      backgroundColor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💬 Team Chat
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
              <IconButton
                size="small"
                onClick={() => setIsWideMode(!isWideMode)}
                sx={{ 
                  color: isWideMode ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                <OpenInFullIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setIsFullscreen(!isFullscreen)}
                sx={{ 
                  color: isFullscreen ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem'
            },
            '& .Mui-selected': {
              fontWeight: 600
            }
          }}
        >
          <Tab
            icon={<GroupIcon />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Group Chat</span>
                <Badge badgeContent={groupMessages.length} color="primary" max={99} />
              </Box>
            }
            iconPosition="start"
          />
          <Tab
            icon={<PersonIcon />}
            label="Direct Messages"
            iconPosition="start"
          />
        </Tabs>
      </Box>
    </Box>
  );

  const renderGroupChat = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        backgroundColor: 'grey.50',
        backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}>
        <List sx={{ py: 1 }}>
          {groupMessages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 200,
              color: 'text.secondary'
            }}>
              <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                Welcome to Group Chat!
              </Typography>
              <Typography variant="body2" align="center">
                Start the conversation with your team members
              </Typography>
            </Box>
          ) : (
            groupMessages.map(msg => renderMessage(msg, true))
          )}
          <div ref={groupMessagesEndRef} />
        </List>
      </Box>
      
      {/* Input Area */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <Tooltip title="Attach file">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
          
          <TextField
            ref={groupInputRef}
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Type your message..."
            value={groupInput}
            onChange={(e) => setGroupInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendGroupMessage();
              }
            }}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Emoji">
                      <IconButton size="small">
                        <EmojiIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            variant="contained"
            onClick={sendGroupMessage}
            disabled={!groupInput.trim() || isLoading}
            sx={{
              minWidth: 48,
              height: 40,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' },
              '&:disabled': { backgroundColor: 'grey.300' }
            }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  const renderDirectMessages = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Recipient Selection */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Select collaborator to chat with"
          value={selectedRecipient?.user_id || ''}
          onChange={(e) => {
            const recipient = collaborators.find(c => c.user_id === e.target.value);
            setSelectedRecipient(recipient);
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        >
          {collaborators
            .filter(c => c.user_id && c.user_id !== currentUserId)
            .map(c => (
              <MenuItem key={c.user_id} value={c.user_id}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {c.full_name?.[0] || c.email?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {c.full_name || c.email}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5 
                      }}>
                        <OnlineIcon 
                          sx={{ 
                            fontSize: 8, 
                            color: onlineUsers.has(c.user_id) ? 'success.main' : 'grey.400' 
                          }} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          {onlineUsers.has(c.user_id) ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </MenuItem>
            ))}
        </TextField>
      </Box>

      {selectedRecipient ? (
        <>
          {/* Messages Area */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            backgroundColor: 'grey.50',
            backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}>
            <List sx={{ py: 1 }}>
              {messages.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: 200,
                  color: 'text.secondary'
                }}>
                  <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                    Start a conversation
                  </Typography>
                  <Typography variant="body2" align="center">
                    Send a message to {selectedRecipient.full_name || selectedRecipient.email}
                  </Typography>
                </Box>
              ) : (
                messages.map(msg => renderMessage(msg, false))
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>
          
          {/* Input Area */}
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Tooltip title="Attach file">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
              
              <TextField
                ref={inputRef}
                fullWidth
                multiline
                maxRows={4}
                size="small"
                placeholder={`Message ${selectedRecipient.full_name || selectedRecipient.email}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendDirectMessage();
                  }
                }}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Emoji">
                          <IconButton size="small">
                            <EmojiIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                variant="contained"
                onClick={sendDirectMessage}
                disabled={!input.trim() || isLoading}
                sx={{
                  minWidth: 48,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '&:disabled': { backgroundColor: 'grey.300' }
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </Button>
            </Stack>
          </Box>
        </>
      ) : (
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'grey.50'
        }}>
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              Select a collaborator
            </Typography>
            <Typography variant="body2">
              Choose someone from the dropdown above to start chatting
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Fullscreen Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              💬 Team Chat - Fullscreen Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
                <IconButton
                  onClick={() => setIsWideMode(!isWideMode)}
                  sx={{ 
                    color: isWideMode ? 'primary.main' : 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Exit fullscreen (ESC)">
                <IconButton
                  onClick={() => setIsFullscreen(false)}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              mt: 1,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem'
              },
              '& .Mui-selected': {
                fontWeight: 600
              }
            }}
          >
            <Tab
              icon={<GroupIcon />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Group Chat</span>
                  <Badge badgeContent={groupMessages.length} color="primary" max={99} />
                </Box>
              }
              iconPosition="start"
            />
            <Tab
              icon={<PersonIcon />}
              label="Direct Messages"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Fullscreen Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeTab === 0 ? renderGroupChat() : renderDirectMessages()}
        </Box>

        {/* Fullscreen Integrations */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
          {renderSlackIntegration()}
        </Box>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={notification.severity} 
            onClose={() => setNotification({ ...notification, open: false })}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Wide mode overlay
  if (isWideMode && !isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          width: '80vw',
          maxWidth: '1200px',
          height: '80vh',
          maxHeight: '800px',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Wide Mode Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              💬 Team Chat - Wide Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Normal width">
                <IconButton
                  onClick={() => setIsWideMode(false)}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen">
                <IconButton
                  onClick={() => setIsFullscreen(true)}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Close wide mode">
                <IconButton
                  onClick={() => setIsWideMode(false)}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              mt: 1,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem'
              },
              '& .Mui-selected': {
                fontWeight: 600
              }
            }}
          >
            <Tab
              icon={<GroupIcon />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Group Chat</span>
                  <Badge badgeContent={groupMessages.length} color="primary" max={99} />
                </Box>
              }
              iconPosition="start"
            />
            <Tab
              icon={<PersonIcon />}
              label="Direct Messages"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Wide Mode Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeTab === 0 ? renderGroupChat() : renderDirectMessages()}
        </Box>

        {/* Wide Mode Integrations */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
          {renderSlackIntegration()}
        </Box>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={notification.severity} 
            onClose={() => setNotification({ ...notification, open: false })}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      {/* Header */}
      {renderChatHeader()}

      {/* Chat Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activeTab === 0 ? renderGroupChat() : renderDirectMessages()}
      </Box>

      {/* Integrations */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
        {renderSlackIntegration()}
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification({ ...notification, open: false })}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
