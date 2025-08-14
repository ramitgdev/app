import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Badge, Divider, Paper, Stack, Tooltip, Menu, MenuItem,
  Alert, Snackbar, CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Send as SendIcon, AttachFile as AttachFileIcon, Code as CodeIcon,
  Group as GroupIcon, Person as PersonIcon, Settings as SettingsIcon,
  Notifications as NotificationsIcon, NotificationsOff as NotificationsOffIcon,
  MoreVert as MoreVertIcon, Chat as ChatIcon, ContentCopy as CopyIcon,
  CheckCircle as CheckIcon, InsertDriveFile as FileIcon, Image as ImageIcon,
  ExpandMore as ExpandMoreIcon
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
  
  const messagesEndRef = useRef(null);
  const groupMessagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const scrollToBottom = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
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

  const renderMessage = (message, isGroup = false) => {
    const isOwnMessage = message.sender_id === currentUserId;
    const isFile = message.message_type === 'file';
    const isCode = message.message.includes('```');

    return (
      <ListItem
        key={message.id}
        sx={{
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          mb: 1
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: isOwnMessage ? 'primary.main' : 'secondary.main',
              width: 32,
              height: 32
            }}
          >
            {isOwnMessage ? 'Me' : (message.sender?.full_name?.[0] || 'U')}
          </Avatar>
        </ListItemAvatar>
        
        <Box sx={{ maxWidth: '70%' }}>
          <Paper
            sx={{
              p: 1.5,
              backgroundColor: isOwnMessage ? 'primary.light' : 'grey.100',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            {!isOwnMessage && isGroup && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                {message.sender?.full_name || message.sender?.email}
              </Typography>
            )}
            
            {isFile ? (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FileIcon color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {message.file_name}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {(message.file_size / 1024).toFixed(1)} KB
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
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
                  backgroundColor: isCode ? 'grey.200' : 'transparent',
                  p: isCode ? 1 : 0,
                  borderRadius: isCode ? 1 : 0
                }}
              >
                {message.message}
              </Typography>
            )}
            
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              {new Date(message.created_at).toLocaleTimeString()}
            </Typography>
          </Paper>
          
          <IconButton
            size="small"
            onClick={() => copyMessage(message.message, message.id)}
            sx={{ mt: 0.5 }}
          >
            {copiedMessageId === message.id ? <CheckIcon color="success" /> : <CopyIcon />}
          </IconButton>
        </Box>
      </ListItem>
    );
  };

  const renderSlackIntegration = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ChatIcon color="primary" />
          <Typography>External Integrations</Typography>
          <Chip
            label="Coming Soon"
            color="default"
            size="small"
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            External integrations like Slack, Discord, and Microsoft Teams will be available soon.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            For now, enjoy the enhanced group chat and direct messaging features!
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Header */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Team Chat
          </Typography>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab
              icon={<GroupIcon />}
              label={`Group (${groupMessages.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<PersonIcon />}
              label="Direct Messages"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 0 ? (
            // Group Chat
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <List>
                  {groupMessages.map(msg => renderMessage(msg, true))}
                  {groupMessages.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Typography color="text.secondary" align="center">
                            No messages yet. Start the conversation!
                          </Typography>
                        } 
                      />
                    </ListItem>
                  )}
                  <div ref={groupMessagesEndRef} />
                </List>
              </Box>
              
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <AttachFileIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={groupInput}
                    onChange={(e) => setGroupInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendGroupMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    variant="contained"
                    onClick={sendGroupMessage}
                    disabled={!groupInput.trim() || isLoading}
                  >
                    {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            // Direct Messages
            <>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Select collaborator"
                  value={selectedRecipient?.user_id || ''}
                  onChange={(e) => {
                    const recipient = collaborators.find(c => c.user_id === e.target.value);
                    setSelectedRecipient(recipient);
                  }}
                >
                  {collaborators
                    .filter(c => c.user_id && c.user_id !== currentUserId)
                    .map(c => (
                      <MenuItem key={c.user_id} value={c.user_id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {c.full_name?.[0] || c.email?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {c.full_name || c.email}
                            </Typography>
                            <Chip
                              label={onlineUsers.has(c.user_id) ? 'Online' : 'Offline'}
                              color={onlineUsers.has(c.user_id) ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))}
                </TextField>
              </Box>

              {selectedRecipient ? (
                <>
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    <List>
                      {messages.map(msg => renderMessage(msg, false))}
                      {messages.length === 0 && (
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Typography color="text.secondary" align="center">
                                No messages yet. Start the conversation!
                              </Typography>
                            } 
                          />
                        </ListItem>
                      )}
                      <div ref={messagesEndRef} />
                    </List>
                  </Box>
                  
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <AttachFileIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendDirectMessage()}
                        disabled={isLoading}
                      />
                      <Button
                        variant="contained"
                        onClick={sendDirectMessage}
                        disabled={!input.trim() || isLoading}
                      >
                        {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                      </Button>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Select a collaborator to start chatting
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Integrations */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {renderSlackIntegration()}
        </Box>
      </CardContent>

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
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
