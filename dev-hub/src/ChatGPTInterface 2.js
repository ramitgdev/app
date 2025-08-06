import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, TextField, IconButton, Typography, Avatar, 
  CircularProgress, Divider, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { llmIntegration } from './llm-integration';

const ChatGPTInterface = ({ 
  onEditGoogleDoc, 
  onGenerateCode, 
  onExecuteCode,
  googleToken,
  currentDocId 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI assistant powered by OpenAI. I can help you edit Google Docs, generate code, review code, and provide technical guidance. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [configurationStatus, setConfigurationStatus] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check OpenAI configuration on component mount
  useEffect(() => {
    const status = llmIntegration.getConfigurationStatus();
    setConfigurationStatus(status);
    
    if (!status.configured) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: `⚠️ ${status.message}\n\nI'll still provide helpful responses, but for full AI capabilities, please configure your OpenAI API key.`,
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({ role: msg.role, content: msg.content }))
        .slice(-10); // Keep last 10 messages for context

      // Use real OpenAI integration
      const response = await llmIntegration.chatWithAI(input, conversationHistory);
      
      // Check for specific actions based on response content
      const actions = [];
      const lowerResponse = response.toLowerCase();
      
      if (lowerResponse.includes('code') || lowerResponse.includes('generate') || lowerResponse.includes('function')) {
        actions.push('generate_code');
      }
      
      if (lowerResponse.includes('edit') || lowerResponse.includes('document') || lowerResponse.includes('doc')) {
        actions.push('edit_doc');
      }
      
      if (lowerResponse.includes('review') || lowerResponse.includes('analyze')) {
        actions.push('review_code');
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        actions: actions.length > 0 ? actions : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again or check your OpenAI API configuration.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action, messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    switch (action) {
      case 'edit_doc':
        if (onEditGoogleDoc && currentDocId) {
          await onEditGoogleDoc(message.content);
        }
        break;
      case 'generate_code':
        try {
          const codeResponse = await llmIntegration.generateCodeFromDesignDoc(
            { description: message.content },
            ['JavaScript', 'React'],
            'web-app'
          );
          setGeneratedCode(codeResponse.files?.[0]?.content || '// Generated code will appear here');
          setShowCodeDialog(true);
        } catch (error) {
          console.error('Error generating code:', error);
          setGeneratedCode('// Error generating code. Please try again.');
          setShowCodeDialog(true);
        }
        break;
      case 'review_code':
        // This would typically review the current code in the editor
        const reviewResponse = await llmIntegration.reviewCode(
          '// Sample code for review\nfunction example() {\n  console.log("Hello");\n}',
          'Code review request'
        );
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'assistant',
          content: reviewResponse,
          timestamp: new Date()
        }]);
        break;
      case 'execute_code':
        if (onExecuteCode) {
          await onExecuteCode(generatedCode);
        }
        break;
      default:
        break;
    }
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

  const renderMessage = (message) => {
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
          <Avatar
            sx={{
              bgcolor: isUser ? 'primary.main' : 'secondary.main',
              width: 32,
              height: 32
            }}
          >
            {isUser ? <PersonIcon /> : <SmartToyIcon />}
          </Avatar>
          
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
            
            {message.actions && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {message.actions.map((action, index) => (
                  <Chip
                    key={index}
                    label={action.replace('_', ' ').toUpperCase()}
                    size="small"
                    onClick={() => handleAction(action, message.id)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
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
            
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
                fontSize: '0.75rem'
              }}
            >
              {message.timestamp.toLocaleTimeString()}
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          AI Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Powered by OpenAI GPT-4 - Edit docs, generate code, and more
        </Typography>
        
        {configurationStatus && !configurationStatus.configured && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {configurationStatus.message}
          </Alert>
        )}
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map(renderMessage)}
        
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              AI is thinking...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to edit your Google Doc, generate code, review code, or help with anything..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            color="primary"
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Code Generation Dialog */}
      <Dialog open={showCodeDialog} onClose={() => setShowCodeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon />
            Generated Code
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Language"
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            sx={{ mb: 2, minWidth: 120 }}
          >
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="html">HTML</MenuItem>
            <MenuItem value="css">CSS</MenuItem>
          </TextField>
          
          <TextField
            multiline
            rows={10}
            fullWidth
            value={generatedCode}
            onChange={(e) => setGeneratedCode(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '14px'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCodeDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleAction('execute_code');
              setShowCodeDialog(false);
            }}
            variant="contained"
            startIcon={<CodeIcon />}
          >
            Execute Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatGPTInterface; 