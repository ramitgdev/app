import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, IconButton, Button, 
  CircularProgress, Tooltip, Badge, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText, ListItemIcon,
  TextField, Chip, Fade, Slide, Grow,
  Menu, MenuItem as MenuItemComponent,
  Divider
} from '@mui/material';
import APIProxy from './api-proxy';
import {
  Code as CodeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  Android as SmartToyIcon,
  FlashOn as AutoFixHighIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  SmartToy as AIIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

class RealAICopilotService {
  constructor() {
    this.isEnabled = false;
    this.settings = {
      autoComplete: true,
      inlineSuggestions: true,
      codeActions: true,
      contextAware: true,
      languageSpecific: true,
      aiProvider: 'groq',
      model: 'llama3-8b-8192',
      temperature: 0.3,
      maxTokens: 1000
    };
    
    this.apiKeys = {
      openai: process.env.REACT_APP_OPENAI_API_KEY,
      groq: process.env.REACT_APP_GROQ_API_KEY,
      claude: process.env.REACT_APP_CLAUDE_API_KEY
    };
    
    this.apiProxy = new APIProxy();
  }

  async initialize() {
    this.isEnabled = true;
    
    const availableProviders = [];
    for (const [provider, key] of Object.entries(this.apiKeys)) {
      if (key && key.trim() !== '') {
        availableProviders.push(provider);
      }
    }
    
    return {
      success: availableProviders.length > 0,
      availableProviders,
      message: availableProviders.length > 0 
        ? `Connected to: ${availableProviders.join(', ')}`
        : 'No AI providers configured'
    };
  }

  async getInlineCompletion(code, language, cursorPosition, context = {}) {
    if (!this.isEnabled || !this.settings.autoComplete) {
      return null;
    }

    try {
      const prompt = this.buildCompletionPrompt(code, language, cursorPosition, context);
      const response = await this.callAI(prompt);
      
      if (response) {
        return this.extractCompletion(response, code, cursorPosition);
      }
    } catch (error) {
      console.error('Error getting inline completion:', error);
    }
    
    return null;
  }

  async generateCode(prompt, language, context = {}) {
    if (!this.isEnabled) return null;

    try {
      const fullPrompt = this.buildGenerationPrompt(prompt, language, context);
      const response = await this.callAI(fullPrompt);
      
      if (response) {
        return this.extractCode(response, language);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
    
    return null;
  }

  async explainCode(code, language, context = {}) {
    if (!this.isEnabled) return null;

    try {
      const prompt = this.buildExplanationPrompt(code, language, context);
      const response = await this.callAI(prompt);
      
      if (response) {
        return this.extractExplanation(response);
      }
    } catch (error) {
      console.error('Error explaining code:', error);
    }
    
    return null;
  }

  async refactorCode(code, language, context = {}) {
    if (!this.isEnabled) return null;

    try {
      const prompt = this.buildRefactorPrompt(code, language, context);
      const response = await this.callAI(prompt);
      
      if (response) {
        return this.extractCode(response, language);
      }
    } catch (error) {
      console.error('Error refactoring code:', error);
    }
    
    return null;
  }

  async callAI(prompt) {
    const provider = this.settings.aiProvider;
    const key = this.apiKeys[provider];
    
    if (!key) {
      throw new Error(`No API key for ${provider}`);
    }

    switch (provider) {
      case 'openai':
        return await this.callOpenAI(prompt, key);
      case 'groq':
        return await this.callGroq(prompt, key);
      case 'claude':
        return await this.callClaude(prompt, key);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async callOpenAI(prompt, key) {
    return await this.apiProxy.callOpenAI(prompt, key);
  }

  async callGroq(prompt, key) {
    return await this.apiProxy.callGroq(prompt, key);
  }

  async callClaude(prompt, key) {
    return await this.apiProxy.callClaude(prompt, key);
  }

  buildCompletionPrompt(code, language, cursorPosition, context) {
    const lines = code.split('\n');
    const currentLine = lines[cursorPosition.lineNumber - 1] || '';
    const beforeCursor = currentLine.substring(0, cursorPosition.column - 1);
    
    return `You are an AI coding assistant. Complete the code at the cursor position.

Language: ${language}
Context: ${context.description || 'No specific context'}

Code before cursor:
${code}

Current line: "${currentLine}"
Cursor position: ${cursorPosition.column}
Text before cursor: "${beforeCursor}"

Provide ONLY the completion text that should be inserted at the cursor position. Do not include any explanations or markdown formatting.`;
  }

  buildGenerationPrompt(prompt, language, context) {
    return `You are an AI coding assistant. Generate code based on the user's request.

Language: ${language}
Context: ${context.description || 'No specific context'}

User Request: ${prompt}

Generate clean, well-structured code that matches the user's request. Include appropriate comments and follow best practices for ${language}.`;
  }

  buildExplanationPrompt(code, language, context) {
    return `You are an AI coding assistant. Explain the provided code.

Language: ${language}
Context: ${context.description || 'No specific context'}

Code to explain:
${code}

Provide a clear, concise explanation of what this code does, how it works, and any important concepts or patterns used.`;
  }

  buildRefactorPrompt(code, language, context) {
    return `You are an AI coding assistant. Refactor the provided code to improve it.

Language: ${language}
Context: ${context.description || 'No specific context'}

Code to refactor:
${code}

Refactor this code to improve:
- Readability and maintainability
- Performance (where applicable)
- Code structure and organization
- Error handling
- Best practices

Provide the refactored code with explanations of the improvements made.`;
  }

  extractCompletion(response, code, cursorPosition) {
    // Extract just the completion text, removing any markdown or explanations
    const lines = response.split('\n');
    const completion = lines[0].trim();
    
    // Remove any markdown code blocks
    return completion.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  }

  extractCode(response, language) {
    // Extract code from markdown code blocks
    const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'i');
    const match = response.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }
    
    // If no code block, return the response as-is
    return response.trim();
  }

  extractExplanation(response) {
    // Remove any markdown formatting and return the explanation
    return response.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();
  }

  getStatus() {
    return {
      isEnabled: this.isEnabled,
      availableProviders: Object.entries(this.apiKeys)
        .filter(([_, key]) => key && key.trim() !== '')
        .map(([provider, _]) => provider),
      settings: this.settings
    };
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

// Make service globally available for debugging
window.RealAICopilotService = RealAICopilotService;

// Export the service class for use in other files
export { RealAICopilotService };

export function RealAICopilotIntegration({ 
  code, 
  language, 
  onCodeChange, 
  editorRef,
  context = {} 
}) {
  const [copilotService] = useState(() => new RealAICopilotService());
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [inlineCompletion, setInlineCompletion] = useState('');
  const [showInlineCompletion, setShowInlineCompletion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [settings, setSettings] = useState(copilotService.settings);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [cursorPosition, setCursorPosition] = useState(null);

  const completionTimeoutRef = useRef(null);

  useEffect(() => {
    const initCopilot = async () => {
      const result = await copilotService.initialize();
      setIsConnected(result.success);
      setStatus(result);
    };
    
    initCopilot();
  }, [copilotService]);

  // Listen for custom events to open AI panel
  useEffect(() => {
    const handleOpenAIPanel = () => {
      setShowAIPanel(true);
    };

    const handleKeyPress = (event) => {
      // Ctrl+Shift+A to open AI panel
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAIPanel(true);
      }
      // Escape to close AI panel
      if (event.key === 'Escape' && showAIPanel) {
        setShowAIPanel(false);
      }
    };

    window.addEventListener('openAIPanel', handleOpenAIPanel);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('openAIPanel', handleOpenAIPanel);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showAIPanel]);

  // Monitor cursor position and selected text
  useEffect(() => {
    if (editorRef.current) {
      const updatePosition = () => {
        const position = editorRef.current.getPosition();
        setCursorPosition(position);
        
        const selection = editorRef.current.getSelection();
        if (selection && selection.startLineNumber !== selection.endLineNumber) {
          const selectedText = editorRef.current.getModel().getValueInRange(selection);
          setSelectedCode(selectedText);
        } else {
          setSelectedCode('');
        }
      };

      // Update on editor changes
      const disposable = editorRef.current.onDidChangeCursorPosition(updatePosition);
      const selectionDisposable = editorRef.current.onDidChangeCursorSelection(updatePosition);
      
      return () => {
        disposable.dispose();
        selectionDisposable.dispose();
      };
    }
  }, [editorRef]);

  // Auto-completion on typing
  useEffect(() => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }

    if (!isConnected || !editorRef.current || !settings.autoComplete) return;

    completionTimeoutRef.current = setTimeout(async () => {
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        const completion = await copilotService.getInlineCompletion(
          code, 
          language, 
          position, 
          context
        );
        
        if (completion && completion.length > 3) {
          setInlineCompletion(completion);
          setShowInlineCompletion(true);
        }
      }
    }, 1000);

    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [code, language, isConnected, settings.autoComplete, context, editorRef]);

  const applyInlineCompletion = () => {
    if (inlineCompletion && editorRef.current) {
      const position = editorRef.current.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };
      
      editorRef.current.executeEdits('ai-completion', [{
        range: range,
        text: inlineCompletion
      }]);
      
      setShowInlineCompletion(false);
      setInlineCompletion('');
    }
  };

  const generateCode = async (prompt) => {
    console.log('generateCode called with prompt:', prompt);
    console.log('isConnected:', isConnected);
    console.log('language:', language);
    console.log('context:', context);
    
    if (!isConnected) {
      console.log('Not connected to AI service');
      return;
    }

    setIsLoading(true);
    setAiResponse('');
    
    try {
      console.log('Calling copilotService.generateCode...');
      const generatedCode = await copilotService.generateCode(prompt, language, context);
      console.log('Generated code received:', generatedCode);
      
      if (generatedCode) {
        setAiResponse(generatedCode);
        
        setGenerationHistory(prev => [{
          id: Date.now(),
          prompt,
          code: generatedCode,
          language,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]);
      } else {
        console.log('No code generated');
        setAiResponse('No code was generated. Please try a different prompt.');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const explainCode = async () => {
    if (!isConnected || !selectedCode) return;

    setIsLoading(true);
    setAiResponse('');
    
    try {
      const explanation = await copilotService.explainCode(selectedCode, language, context);
      if (explanation) {
        setAiResponse(explanation);
      }
    } catch (error) {
      console.error('Error explaining code:', error);
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const refactorCode = async () => {
    if (!isConnected || !selectedCode) return;

    setIsLoading(true);
    setAiResponse('');
    
    try {
      const refactoredCode = await copilotService.refactorCode(selectedCode, language, context);
      if (refactoredCode) {
        setAiResponse(refactoredCode);
      }
    } catch (error) {
      console.error('Error refactoring code:', error);
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const insertCode = () => {
    if (aiResponse && editorRef.current) {
      const position = editorRef.current.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };
      
      // Insert the AI-generated code at the cursor position
      editorRef.current.executeEdits('ai-insert', [{
        range: range,
        text: '\n' + aiResponse
      }]);
      
      // Also update the parent component's code state
      if (onCodeChange) {
        const currentCode = editorRef.current.getValue();
        const newCode = currentCode.slice(0, editorRef.current.getModel().getOffsetAt(position)) + 
                       '\n' + aiResponse + 
                       currentCode.slice(editorRef.current.getModel().getOffsetAt(position));
        onCodeChange(newCode);
      }
      
      setAiResponse('');
    }
  };

  const replaceSelectedCode = () => {
    if (aiResponse && editorRef.current && selectedCode) {
      const selection = editorRef.current.getSelection();
      editorRef.current.executeEdits('ai-replace', [{
        range: selection,
        text: aiResponse
      }]);
      
      setAiResponse('');
      setSelectedCode('');
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleContextMenuClose = () => {
    setAnchorEl(null);
  };

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    copilotService.updateSettings(updatedSettings);
  };

  const toggleCopilot = () => {
    const enabled = copilotService.toggle();
    setIsConnected(enabled);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* AI Copilot Status Bar */}
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}
      >
        <Badge
          color={isConnected ? 'success' : 'error'}
          variant="dot"
          sx={{ '& .MuiBadge-dot': { width: 8, height: 8 } }}
        >
          <AIIcon sx={{ fontSize: 20, color: isConnected ? 'success.main' : 'error.main' }} />
        </Badge>
        
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          AI Copilot {isConnected ? 'Active' : 'Inactive'}
        </Typography>

        {status.availableProviders && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {status.availableProviders.map(provider => (
              <Chip 
                key={provider} 
                label={provider} 
                size="small" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.6rem' }}
              />
            ))}
          </Box>
        )}

        <Tooltip title="Toggle AI Copilot">
          <IconButton size="small" onClick={toggleCopilot}>
            <SmartToyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="AI Assistant Panel">
          <IconButton 
            size="small" 
            onClick={() => setShowAIPanel(!showAIPanel)}
            color={showAIPanel ? 'primary' : 'default'}
          >
            <LightbulbIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton size="small" onClick={() => setShowSettings(true)}>
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="About AI Copilot">
          <IconButton size="small" onClick={() => setShowInfo(true)}>
            <InfoIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Info Alert */}
      <Alert 
        severity="info" 
        sx={{ 
          position: 'absolute', 
          top: 60, 
          left: 10, 
          zIndex: 1000,
          maxWidth: 400,
          display: showInfo ? 'block' : 'none'
        }}
        onClose={() => setShowInfo(false)}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          🤖 Real AI-Powered Code Assistant
        </Typography>
        <Typography variant="caption">
          This integration uses <strong>real AI services</strong> (OpenAI, Groq, Claude) to provide intelligent code suggestions, completions, and generation. Configure your API keys in the settings.
        </Typography>
      </Alert>

      {/* Inline Completion Display */}
      {showInlineCompletion && inlineCompletion && (
        <Paper
          sx={{
            position: 'absolute',
            top: showInfo ? 120 : 50,
            left: 10,
            zIndex: 1000,
            p: 1,
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            AI Suggestion:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
            {inlineCompletion}
          </Typography>
          <IconButton size="small" onClick={applyInlineCompletion}>
            <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
          </IconButton>
          <IconButton size="small" onClick={() => setShowInlineCompletion(false)}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Paper>
      )}

      {/* AI Assistant Panel */}
      <Slide direction="left" in={showAIPanel} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 350,
            maxHeight: 'calc(100vh - 40px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 2,
            overflow: 'hidden',
            pointerEvents: 'auto'
          }}
        >
          {/* Panel Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                🤖 AI Assistant
              </Typography>
              <IconButton size="small" onClick={() => setShowAIPanel(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {isConnected ? `Connected to ${status.availableProviders?.join(', ')}` : 'Not connected'}
            </Typography>
          </Box>

          {/* Panel Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* Quick Actions */}
            {selectedCode && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Selected Code Actions:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={explainCode}
                    disabled={isLoading}
                    startIcon={<InfoIcon />}
                  >
                    Explain
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={refactorCode}
                    disabled={isLoading}
                    startIcon={<AutoFixHighIcon />}
                  >
                    Refactor
                  </Button>
                </Box>
              </Box>
            )}

                         {/* Quick Examples */}
             <Box sx={{ mb: 2 }}>
               <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                 Quick Examples:
               </Typography>
               <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                 <Button
                   size="small"
                   variant="outlined"
                   onClick={() => {
                     console.log('React Todo button clicked');
                     setAiPrompt('Create a React component for a todo list');
                   }}
                   sx={{ fontSize: '0.7rem' }}
                 >
                   React Todo
                 </Button>
                 <Button
                   size="small"
                   variant="outlined"
                   onClick={() => {
                     console.log('Email Validator button clicked');
                     setAiPrompt('Write a function to validate email addresses');
                   }}
                   sx={{ fontSize: '0.7rem' }}
                 >
                   Email Validator
                 </Button>
                 <Button
                   size="small"
                   variant="outlined"
                   onClick={() => {
                     console.log('CSS Animation button clicked');
                     setAiPrompt('Create a CSS animation for a loading spinner');
                   }}
                   sx={{ fontSize: '0.7rem' }}
                 >
                   CSS Animation
                 </Button>
                 <Button
                   size="small"
                   variant="contained"
                   color="secondary"
                   onClick={() => {
                     console.log('Test button clicked');
                     const testPrompt = 'console.log("Hello World");';
                     setAiPrompt(testPrompt);
                     // Direct test without API call first
                     setAiResponse('// Test response\nconsole.log("Hello World");\nconsole.log("AI is working!");');
                   }}
                   sx={{ fontSize: '0.7rem' }}
                 >
                   Test UI
                 </Button>
               </Box>
             </Box>

             {/* AI Prompt Input */}
             <Box sx={{ mb: 2 }}>
               <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                 Generate Code:
               </Typography>
               <TextField
                 fullWidth
                 size="small"
                 placeholder="Describe what you want to create... (e.g., 'Create a function to sort an array')"
                 value={aiPrompt}
                 onChange={(e) => {
                   console.log('AI Prompt changed:', e.target.value);
                   setAiPrompt(e.target.value);
                 }}
                 multiline
                 rows={2}
                 sx={{ mb: 1 }}
                 onKeyPress={(e) => {
                   console.log('Key pressed:', e.key);
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     console.log('Generating code for prompt:', aiPrompt);
                     generateCode(aiPrompt);
                   }
                 }}
                 onFocus={() => console.log('TextField focused')}
                 onBlur={() => console.log('TextField blurred')}
               />
               <Button
                 fullWidth
                 variant="contained"
                 onClick={() => generateCode(aiPrompt)}
                 disabled={!isConnected || isLoading || !aiPrompt.trim()}
                 startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
               >
                 {isLoading ? 'Generating...' : 'Generate Code (Enter)'}
               </Button>
             </Box>

            {/* AI Response */}
            {aiResponse && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  AI Response:
                </Typography>
                <Paper
                  sx={{
                    p: 1.5,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  {aiResponse}
                </Paper>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={insertCode}
                    startIcon={<CodeIcon />}
                  >
                    Insert
                  </Button>
                  {selectedCode && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={replaceSelectedCode}
                      startIcon={<AutoFixHighIcon />}
                    >
                      Replace
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard.writeText(aiResponse)}
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Generation History */}
            {generationHistory.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Recent Generations:
                  </Typography>
                  <IconButton size="small" onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </IconButton>
                </Box>
                
                <Grow in={showHistory}>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {generationHistory.map((item) => (
                      <ListItem key={item.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={item.prompt}
                          secondary={item.timestamp.toLocaleTimeString()}
                          primaryTypographyProps={{ fontSize: '0.75rem' }}
                          secondaryTypographyProps={{ fontSize: '0.7rem' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setAiResponse(item.code)}
                        >
                          <CodeIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Grow>
              </Box>
            )}
          </Box>
        </Paper>
      </Slide>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Copilot Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>AI Provider</InputLabel>
            <Select
              value={settings.aiProvider}
              onChange={(e) => updateSettings({ aiProvider: e.target.value })}
            >
              <MenuItem value="claude">Claude</MenuItem>
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="groq">Groq</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={settings.model}
              onChange={(e) => updateSettings({ model: e.target.value })}
            >
              <MenuItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</MenuItem>
              <MenuItem value="gpt-4">GPT-4</MenuItem>
              <MenuItem value="llama3-8b-8192">Llama 3.1 8B</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu for Code Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleContextMenuClose}
        onClick={handleContextMenuClose}
      >
        <MenuItemComponent onClick={explainCode} disabled={!selectedCode}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          Explain Code
        </MenuItemComponent>
        <MenuItemComponent onClick={refactorCode} disabled={!selectedCode}>
          <ListItemIcon>
            <AutoFixHighIcon fontSize="small" />
          </ListItemIcon>
          Refactor Code
        </MenuItemComponent>
        <Divider />
        <MenuItemComponent onClick={() => setShowAIPanel(true)}>
          <ListItemIcon>
            <LightbulbIcon fontSize="small" />
          </ListItemIcon>
          Open AI Assistant
        </MenuItemComponent>
      </Menu>
    </Box>
  );
}
