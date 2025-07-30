import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, IconButton, Button, Drawer, 
  TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Divider, Chip, Alert, CircularProgress
} from '@mui/material';
import { llmIntegration } from './llm-integration';
import MonacoEditor from '@monaco-editor/react';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const WebIDE = () => {
  const [code, setCode] = useState(`// Welcome to the Web IDE!
// Start coding here...

function helloWorld() {
  console.log("Hello, World!");
  return "Welcome to DevHub IDE!";
}

// Example: Generate a simple calculator
function calculator(a, b, operation) {
  switch(operation) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default: return "Invalid operation";
  }
}

helloWorld();`);
  
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI coding assistant powered by Groq. I can help you write, debug, and optimize code. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('untitled.js');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [configurationStatus, setConfigurationStatus] = useState(null);

  const editorRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const status = llmIntegration.getConfigurationStatus();
    setConfigurationStatus(status);
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const executeCode = async () => {
    try {
      setOutput('Executing code...\n');
      
      // Create a safe execution environment
      const sandbox = {
        console: {
          log: (...args) => {
            setOutput(prev => prev + args.join(' ') + '\n');
          },
          error: (...args) => {
            setOutput(prev => prev + 'ERROR: ' + args.join(' ') + '\n');
          }
        },
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval
      };

      // Execute the code
      const result = new Function('console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', code);
      result(sandbox.console, sandbox.setTimeout, sandbox.setInterval, sandbox.clearTimeout, sandbox.clearInterval);
      
      setOutput(prev => prev + 'Code executed successfully!\n');
    } catch (error) {
      setOutput(prev => prev + `Error: ${error.message}\n`);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add current user message to history
      conversationHistory.push({
        role: 'user',
        content: chatInput
      });

      // Include the current code in the context for the AI
      const codeContext = `Current code in the editor:\n\`\`\`javascript\n${code}\n\`\`\`\n\nUser request: ${chatInput}`;
      
      const response = await llmIntegration.chatWithAI(codeContext, conversationHistory);
      
      // Check if the response contains code blocks
      const codeBlockRegex = /```(?:javascript|js)?\n([\s\S]*?)```/g;
      const codeMatches = [...response.matchAll(codeBlockRegex)];
      let codeSuggestion = null;
      
      if (codeMatches.length > 0) {
        // Extract the first code block
        codeSuggestion = codeMatches[0][1].trim();
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        codeSuggestion: codeSuggestion,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
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

  const saveFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderChatMessage = (message) => {
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
            
            {message.codeSuggestion && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Code Suggestion:
                </Typography>
                <Paper
                  sx={{
                    p: 1,
                    mt: 1,
                    bgcolor: 'grey.900',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <pre style={{ margin: 0 }}>{message.codeSuggestion}</pre>
                </Paper>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setCode(message.codeSuggestion)}
                  sx={{ mt: 1 }}
                >
                  Apply Code
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon color="primary" />
            Web IDE
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                label="Language"
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setShowSaveDialog(true)}
            >
              Save
            </Button>
            
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={executeCode}
            >
              Run
            </Button>
            
            <IconButton
              onClick={() => setShowChat(!showChat)}
              color={showChat ? 'primary' : 'default'}
            >
              <ChatIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Code Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MonacoEditor
            height="60vh"
            language={language}
            value={code}
            onChange={setCode}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              theme: 'vs-dark'
            }}
          />
          
          {/* Output */}
          <Box sx={{ flex: 1, p: 2, bgcolor: 'grey.900', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Output:</Typography>
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              {output || 'No output yet. Click "Run" to execute your code.'}
            </Box>
          </Box>
        </Box>

        {/* AI Chat Sidebar */}
        {showChat && (
          <Drawer
            anchor="right"
            open={showChat}
            onClose={() => setShowChat(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: 400,
                height: '100%'
              }
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyIcon color="primary" />
                  AI Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ask me to help with coding, debugging, or optimization
                </Typography>
                {configurationStatus && !configurationStatus.isConfigured && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {configurationStatus.message}
                  </Alert>
                )}
              </Box>

              {/* Chat Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {chatMessages.map(renderChatMessage)}
                
                {isChatLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                    <Box sx={{ display: 'flex' }}>
                      <CircularProgress size={20} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      AI is thinking...
                    </Typography>
                  </Box>
                )}
                
                <div ref={chatEndRef} />
              </Box>

              {/* Chat Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me to help with your code..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSend();
                      }
                    }}
                    disabled={isChatLoading}
                  />
                  <IconButton
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || isChatLoading}
                    color="primary"
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Drawer>
        )}
      </Box>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save File</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            saveFile();
            setShowSaveDialog(false);
          }} variant="contained">
            Save
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

export default WebIDE; 