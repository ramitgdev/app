import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, Divider, Grid, Card,
  CardContent, CardActions, List, ListItem, ListItemText,
  ListItemIcon, Accordion, AccordionSummary, AccordionDetails,
  Tabs, Tab, Switch, FormControlLabel, Slider, Select,
  MenuItem, InputLabel, FormControl, AlertTitle, Fab,
  SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip,
  Badge, Avatar, AvatarGroup, LinearProgress
} from '@mui/material';
import {
  SmartToyIcon, EditIcon, SendIcon, PersonIcon, ContentCopyIcon,
  CheckIcon, CloseIcon, Star, CodeIcon, Build,
  CloudUpload, CloudIcon, ExpandMoreIcon,
  CheckCircle, Error, Warning, Info, RefreshIcon,
  SaveIcon, DownloadIcon, UploadIcon, SettingsIcon, PlayArrowIcon,
  PauseIcon, StopIcon, RecordVoiceOverIcon, TranslateIcon,
  FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon,
  FormatListBulletedIcon, FormatListNumberedIcon, InsertLinkIcon,
  ImageIcon, TableChartIcon, FunctionsIcon, DataObjectIcon
} from '@mui/icons-material';
import { llmIntegration } from './llm-integration';

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
      content: "Hello! I'm your AI writing assistant. I can help you edit, improve, and enhance your Google Doc. I can also generate code based on your specifications and implement cross-platform features. What would you like me to help you with?",
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
  const [activeTab, setActiveTab] = useState(0);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'JD', online: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: 'JS', online: false },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', avatar: 'BW', online: true }
  ]);
  const [aiFeatures, setAiFeatures] = useState({
    autoComplete: true,
    grammarCheck: true,
    styleImprovement: true,
    codeGeneration: true,
    crossPlatform: true,
    realTimeSuggestions: true
  });
  const [generatedCode, setGeneratedCode] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

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
      setDocContent(`# AI-Enhanced Document Editor

This is a sample Google Doc that you can edit with advanced AI assistance.

## Current Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Key Features

1. **Real-time AI assistance** - Get instant suggestions and improvements
2. **Cross-platform code generation** - Generate code for web, mobile, and desktop
3. **Collaborative editing** - Work together with team members
4. **Advanced formatting** - Rich text editing with AI-powered enhancements

## Technical Requirements

- Create a React web application
- Implement user authentication
- Add real-time collaboration features
- Include responsive design
- Deploy to cloud platform

## Next Steps

- Review the content
- Make improvements with AI
- Generate implementation code
- Share with team members

The document is ready for AI-powered editing and code generation!`);
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
      
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const simulateAIEditResponse = async (userInput) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('improve') || lowerInput.includes('enhance')) {
      return `I've analyzed your document and here are some improvements:

**Content Enhancements:**
- Added more specific technical details
- Improved clarity and flow
- Enhanced formatting for better readability

**Suggested Edits:**
1. Replace "Lorem ipsum" with more specific content
2. Add concrete examples and use cases
3. Include implementation timelines
4. Add code snippets for technical requirements

**Code Generation Ready:**
Your document contains clear technical specifications that I can use to generate:
- React/Next.js web application
- Mobile app with React Native
- Backend API with Node.js
- Database schema and migrations

Would you like me to generate the implementation code based on your requirements?`;
    } else if (lowerInput.includes('code') || lowerInput.includes('generate')) {
      return `Perfect! I'll generate cross-platform code based on your document specifications.

**Detected Requirements:**
- React web application with authentication
- Real-time collaboration features
- Responsive design
- Cloud deployment ready

**Generated Code Structure:**
\`\`\`json
{
  "web": {
    "src/App.js": "// Main React application",
    "src/components/": "// Reusable components",
    "src/services/": "// API services",
    "package.json": "// Dependencies"
  },
  "mobile": {
    "App.js": "// React Native app",
    "components/": "// Mobile components"
  },
  "backend": {
    "server.js": "// Express API server",
    "models/Document.js": "// Document model"
  }
}
\`\`\`

I can generate the complete implementation. Would you like me to proceed?`;
    } else if (lowerInput.includes('deploy') || lowerInput.includes('launch')) {
      return `Great! I'll help you deploy your application across multiple platforms.

**Deployment Options:**
1. **Web Application**: Vercel, Netlify, or AWS
2. **Mobile App**: App Store and Google Play
3. **Desktop App**: Electron distribution
4. **Backend API**: Heroku, AWS, or DigitalOcean

**Deployment Checklist:**
- ✅ Code generation complete
- ✅ Security scanning passed
- ✅ Performance optimization applied
- ✅ Environment variables configured
- ✅ CI/CD pipeline ready

Ready to deploy! Which platform would you like to start with?`;
    } else {
      return `I understand you want to: "${userInput}"

I can help you with:
- **Content improvement** and editing suggestions
- **Code generation** based on your specifications
- **Cross-platform deployment** (web, mobile, desktop)
- **Real-time collaboration** features
- **AI-powered formatting** and style improvements

What specific aspect would you like me to focus on?`;
    }
  };

  const generateCodeFromDocument = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate processing steps
      const steps = [
        'Analyzing document content...',
        'Extracting technical requirements...',
        'Generating web application code...',
        'Creating mobile app components...',
        'Building backend API...',
        'Setting up database schema...',
        'Configuring deployment...',
        'Finalizing code generation...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setProcessingProgress((i / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Simulate generated code
      setGeneratedCode({
        web: {
          'src/App.js': '// Main React application with AI features',
          'src/components/AIEditor.js': '// AI-powered editor component',
          'src/services/aiService.js': '// AI integration service',
          'package.json': '// Project dependencies'
        },
        mobile: {
          'App.js': '// React Native mobile app',
          'components/MobileEditor.js': '// Mobile editor component'
        },
        backend: {
          'server.js': '// Express API server',
          'models/Document.js': '// Document model'
        }
      });

      setProcessingProgress(100);
      setShowAlert(true);
      setAlertMessage('Code generation completed successfully!');
    } catch (error) {
      setError('Code generation failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  const renderAIMessage = (message) => {
    const isCodeBlock = message.content.includes('```');
    
    return (
      <Paper key={message.id} sx={{ p: 2, mb: 2, backgroundColor: message.role === 'assistant' ? '#f8f9fa' : '#e3f2fd' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {message.role === 'assistant' ? <SmartToyIcon /> : <PersonIcon />}
          </Avatar>
          <Typography variant="subtitle2">
            {message.role === 'assistant' ? 'AI Assistant' : 'You'}
          </Typography>
          <Typography variant="caption" sx={{ ml: 'auto' }}>
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <IconButton
            size="small"
            onClick={() => copyToClipboard(message.content, message.id)}
          >
            {copiedMessageId === message.id ? <CheckCircle color="success" /> : <ContentCopyIcon />}
          </IconButton>
        </Box>
      </Paper>
    );
  };

  const renderCollaborators = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Collaborators
      </Typography>
      <AvatarGroup max={4}>
        {collaborators.map((collaborator) => (
          <Tooltip key={collaborator.id} title={`${collaborator.name} (${collaborator.online ? 'Online' : 'Offline'})`}>
            <Avatar
              sx={{
                bgcolor: collaborator.online ? 'success.main' : 'grey.400',
                width: 32,
                height: 32
              }}
            >
              {collaborator.avatar}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    </Box>
  );

  const renderAIFeatures = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">AI Features</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {Object.keys(aiFeatures).map((feature) => (
            <Grid item xs={6} key={feature}>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiFeatures[feature]}
                    onChange={(e) => setAiFeatures(prev => ({ ...prev, [feature]: e.target.checked }))}
                  />
                }
                label={feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         <Star sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5">AI-Enhanced Google Docs Editor</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderCollaborators()}
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={onExit}
            >
              Exit
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
        {/* Document Editor */}
        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Document" />
            <Tab label="AI Assistant" />
            <Tab label="Code Generation" />
            <Tab label="Settings" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                variant="outlined"
                placeholder="Start writing your document here..."
                sx={{ height: '100%' }}
              />
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {aiMessages.map(renderAIMessage)}
                {isAiLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask AI for help with editing, code generation, or improvements..."
                  variant="outlined"
                  onKeyPress={(e) => e.key === 'Enter' && handleAISend()}
                />
                <Button
                  variant="contained"
                  onClick={handleAISend}
                  disabled={isAiLoading || !aiInput.trim()}
                  startIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Cross-Platform Code Generation
              </Typography>
              
              {isProcessing && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={processingProgress} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Generating code... {Math.round(processingProgress)}%
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                onClick={generateCodeFromDocument}
                disabled={isProcessing}
                startIcon={<CodeIcon />}
                sx={{ mb: 2 }}
              >
                Generate Code from Document
              </Button>

              {Object.keys(generatedCode).length > 0 && (
                <Grid container spacing={2}>
                  {Object.keys(generatedCode).map((platform) => (
                    <Grid item xs={12} md={4} key={platform}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Object.keys(generatedCode[platform]).length} files generated
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small" startIcon={<DownloadIcon />}>
                            Download
                          </Button>
                                                     <Button size="small" startIcon={<CloudUpload />}>
                            Deploy
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              {renderAIFeatures()}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<CodeIcon />}
          tooltipTitle="Generate Code"
          onClick={generateCodeFromDocument}
        />
                 <SpeedDialAction
           icon={<Star />}
           tooltipTitle="AI Enhance"
           onClick={() => setActiveTab(1)}
         />
        <SpeedDialAction
          icon={<SaveIcon />}
          tooltipTitle="Save Document"
          onClick={() => setShowAlert(true)}
        />
      </SpeedDial>

      {/* Alerts */}
      {showAlert && (
        <Alert
          severity="success"
          onClose={() => setShowAlert(false)}
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
        >
          {alertMessage}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default EnhancedGoogleDocsEditor; 