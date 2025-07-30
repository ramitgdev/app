import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, Divider
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EnhancedGoogleDocsEditor = ({ docUrl, googleToken, onExit }) => {
  const [docId, setDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docContent, setDocContent] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI writing assistant. I can help you edit, improve, and enhance your Google Doc. What would you like me to help you with?",
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editSuggestion, setEditSuggestion] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!docUrl || !googleToken) return;
    
    setLoading(true);
    setError('');
    
    // Extract document ID from URL
    const match = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Doc URL');
      setLoading(false);
      return;
    }
    
    setDocId(match[1]);
    loadDocumentContent(match[1]);
  }, [docUrl, googleToken]);

  const loadDocumentContent = async (documentId) => {
    try {
      // Simulate loading document content
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDocContent(`# Sample Document

This is a sample Google Doc that you can edit with AI assistance.

## Current Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Key Points

1. This is a collaborative document
2. AI can help improve the content
3. Real-time editing capabilities

## Next Steps

- Review the content
- Make improvements
- Share with team members

The document is ready for AI-powered editing!`);
      setLoading(false);
    } catch (error) {
      setError('Failed to load document content');
      setLoading(false);
    }
  };

  const handleAISend = async () => {
    if (!aiInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const response = await simulateAIEditResponse(aiInput);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content,
        editSuggestion: response.editSuggestion,
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, assistantMessage]);
      
      // Auto-apply edits if requested
      if (response.editSuggestion && response.autoApply) {
        setDocContent(response.editSuggestion);
        setAlertMessage('Document edited automatically!');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const simulateAIEditResponse = async (userInput) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerInput = userInput.toLowerCase();
    
    // Improve writing requests
    if (lowerInput.includes('improve') || lowerInput.includes('enhance')) {
      return {
        content: "I'll help you improve the writing. Here's an enhanced version:",
        editSuggestion: `# Enhanced Document

This is an improved version of your Google Doc with better clarity and structure.

## Current Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### Key Points

1. **This is a collaborative document** - Multiple users can work together
2. **AI can help improve the content** - Get suggestions and enhancements
3. **Real-time editing capabilities** - See changes as they happen

## Next Steps

- ✅ Review the content thoroughly
- ✅ Make improvements based on AI suggestions
- ✅ Share with team members for feedback
- ✅ Implement final revisions

The document is now optimized for better readability and impact!`,
        autoApply: true
      };
    }

    // Grammar and spelling fixes
    if (lowerInput.includes('grammar') || lowerInput.includes('spelling') || lowerInput.includes('fix')) {
      return {
        content: "I'll fix the grammar and spelling issues. Here's the corrected version:",
        editSuggestion: `# Sample Document

This is a sample Google Doc that you can edit with AI assistance.

## Current Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Key Points

1. This is a collaborative document.
2. AI can help improve the content.
3. Real-time editing capabilities are available.

## Next Steps

- Review the content carefully.
- Make improvements as needed.
- Share with team members for collaboration.

The document is ready for AI-powered editing!`,
        autoApply: true
      };
    }

    // Add new content
    if (lowerInput.includes('add') || lowerInput.includes('insert')) {
      return {
        content: "I'll add new content to your document. Here's the enhanced version:",
        editSuggestion: `# Sample Document

This is a sample Google Doc that you can edit with AI assistance.

## Current Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Key Points

1. This is a collaborative document
2. AI can help improve the content
3. Real-time editing capabilities

## New Section: AI Features

### Document Analysis
- **Smart Suggestions**: Get real-time writing improvements
- **Style Consistency**: Maintain professional tone throughout
- **Content Enhancement**: Expand ideas with AI assistance

### Collaboration Tools
- **Real-time Editing**: Multiple users can edit simultaneously
- **Version Control**: Track changes and revisions
- **Comment System**: Add feedback and suggestions

## Next Steps

- Review the content
- Make improvements
- Share with team members
- Utilize AI features for better results

The document is ready for AI-powered editing!`,
        autoApply: true
      };
    }

    // Summarize content
    if (lowerInput.includes('summarize') || lowerInput.includes('summary')) {
      return {
        content: "Here's a summary of your document:",
        editSuggestion: `# Document Summary

## Overview
This document outlines a collaborative editing platform with AI assistance capabilities.

## Main Points
- **Collaborative Editing**: Multiple users can work together
- **AI Integration**: Smart suggestions and improvements
- **Real-time Features**: Live editing and feedback

## Key Features
1. Google Docs integration
2. AI-powered content enhancement
3. Real-time collaboration tools

## Action Items
- Review and improve content
- Share with team members
- Utilize AI features for optimization

*Summary generated by AI assistant*`,
        autoApply: false
      };
    }

    // Default response
    return {
      content: "I can help you improve your document by enhancing writing, fixing grammar, adding content, or summarizing. What specific editing task would you like me to help with?",
      editSuggestion: null,
      autoApply: false
    };
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderAIMessage = (message) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          mb: 2,
          justifyContent: isUser ? 'flex-end' : 'flex-start'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            maxWidth: '80%',
            flexDirection: isUser ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: isUser ? 'primary.main' : 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            {isUser ? <PersonIcon /> : <SmartToyIcon />}
          </Box>
          
          <Paper
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.main' : 'grey.100',
              color: isUser ? 'white' : 'text.primary',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            
            {message.editSuggestion && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Document Suggestion:
                </Typography>
                <Paper
                  sx={{
                    p: 1,
                    mt: 1,
                    bgcolor: 'grey.900',
                    color: 'white',
                    fontSize: '12px',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.editSuggestion}</pre>
                </Paper>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setEditSuggestion(message.editSuggestion);
                    setShowEditDialog(true);
                  }}
                  sx={{ mt: 1 }}
                >
                  Apply Edit
                </Button>
              </Box>
            )}
            
            {isAssistant && (
              <IconButton
                size="small"
                onClick={() => copyToClipboard(message.content, message.id)}
                sx={{ position: 'absolute', top: 4, right: 4 }}
              >
                {copiedMessageId === message.id ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            )}
          </Paper>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Google Docs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!docId) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Please provide a valid Google Doc URL</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      {/* Document Editor */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon color="primary" />
              Google Docs Editor
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SmartToyIcon />}
                onClick={() => setShowAI(!showAI)}
                color={showAI ? 'primary' : 'default'}
              >
                AI Assistant
              </Button>
              
              <IconButton onClick={onExit}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Document Content */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Paper sx={{ p: 3, minHeight: '100%' }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0
            }}>
              {docContent}
            </pre>
          </Paper>
        </Box>
      </Box>

      {/* AI Assistant Sidebar */}
      {showAI && (
        <Box sx={{ width: 400, borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {/* AI Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon color="primary" />
              AI Writing Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask me to improve, edit, or enhance your document
            </Typography>
          </Box>

          {/* AI Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {aiMessages.map(renderAIMessage)}
            
            {isAiLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            )}
          </Box>

          {/* AI Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask me to improve your document..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAISend();
                  }
                }}
                disabled={isAiLoading}
              />
              <IconButton
                onClick={handleAISend}
                disabled={!aiInput.trim() || isAiLoading}
                color="primary"
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Apply AI Edit</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Review the AI's suggested changes before applying:
          </Typography>
          <TextField
            multiline
            rows={15}
            fullWidth
            value={editSuggestion}
            onChange={(e) => setEditSuggestion(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '14px'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setDocContent(editSuggestion);
              setShowEditDialog(false);
              setAlertMessage('Document updated successfully!');
              setShowAlert(true);
              setTimeout(() => setShowAlert(false), 3000);
            }} 
            variant="contained"
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
      {showAlert && (
        <Alert
          severity="success"
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999
          }}
          onClose={() => setShowAlert(false)}
        >
          {alertMessage}
        </Alert>
      )}
    </Box>
  );
};

export default EnhancedGoogleDocsEditor; 