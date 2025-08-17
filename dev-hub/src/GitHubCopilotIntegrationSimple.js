import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, IconButton, Button, 
  CircularProgress, Tooltip, Badge, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  Code as CodeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  Android as SmartToyIcon,
  FlashOn as AutoFixHighIcon,
  History as HistoryIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import GitHubCopilotMockAPI from './GitHubCopilotMockAPI';

class GitHubCopilotService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GITHUB_COPILOT_API_KEY;
    this.suggestions = [];
    this.isEnabled = false;
    this.settings = {
      autoComplete: true,
      inlineSuggestions: true,
      codeActions: true,
      contextAware: true,
      languageSpecific: true
    };
    
    // Note: This is a mock implementation since GitHub Copilot doesn't provide a public API
    this.mockAPI = new GitHubCopilotMockAPI();
  }

  async initialize(token) {
    try {
      this.apiKey = token;
      this.isEnabled = true;
      const response = await this.mockAPI.initialize();
      return response.success;
    } catch (error) {
      console.error('Failed to initialize GitHub Copilot:', error);
      return false;
    }
  }

  async getSuggestions(code, language, cursorPosition, context = {}) {
    if (!this.isEnabled || !this.settings.inlineSuggestions) {
      return [];
    }

    try {
      const suggestions = await this.mockAPI.getSuggestions(code, language, cursorPosition, context);
      this.suggestions = suggestions;
      return suggestions;
    } catch (error) {
      console.error('Error getting Copilot suggestions:', error);
      return [];
    }
  }

  async getInlineCompletion(code, language, cursorPosition, context = {}) {
    if (!this.isEnabled || !this.settings.autoComplete) {
      return null;
    }

    try {
      const completion = await this.mockAPI.getInlineCompletion(code, language, cursorPosition, context);
      return completion;
    } catch (error) {
      console.error('Error getting inline completion:', error);
    }
    
    return null;
  }

  async generateCode(prompt, language, context = {}) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const code = await this.mockAPI.generateCode(prompt, language, context);
      return code;
    } catch (error) {
      console.error('Error generating code:', error);
    }
    
    return null;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings() {
    return { ...this.settings };
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      connected: true,
      settings: this.settings
    };
  }
}

const GitHubCopilotIntegration = ({ 
  editorRef, 
  code, 
  language, 
  onCodeChange, 
  context = {} 
}) => {
  const [copilotService] = useState(() => new GitHubCopilotService());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [settings, setSettings] = useState(copilotService.getSettings());
  const [inlineCompletion, setInlineCompletion] = useState('');
  const [showInlineCompletion, setShowInlineCompletion] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);
  
  const completionTimeoutRef = useRef(null);

  useEffect(() => {
    const initializeCopilot = async () => {
      const token = process.env.REACT_APP_GITHUB_COPILOT_API_KEY || 'mock-token';
      const success = await copilotService.initialize(token);
      setIsConnected(success);
    };

    initializeCopilot();
  }, [copilotService]);

  useEffect(() => {
    if (!isConnected || !copilotService.getSettings().inlineSuggestions) {
      return;
    }

    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }

    completionTimeoutRef.current = setTimeout(async () => {
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        const newSuggestions = await copilotService.getSuggestions(
          code, 
          language, 
          position, 
          context
        );
        setSuggestions(newSuggestions);
      }
    }, 500);

    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [code, language, isConnected, copilotService, context, editorRef]);

  const handleInlineCompletion = async () => {
    if (!isConnected || !editorRef.current) return;

    setIsLoading(true);
    try {
      const position = editorRef.current.getPosition();
      const completion = await copilotService.getInlineCompletion(
        code, 
        language, 
        position, 
        context
      );
      
      if (completion) {
        setInlineCompletion(completion);
        setShowInlineCompletion(true);
      }
    } catch (error) {
      console.error('Error getting inline completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyInlineCompletion = () => {
    if (inlineCompletion && editorRef.current) {
      const position = editorRef.current.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };
      
      editorRef.current.executeEdits('copilot-completion', [{
        range: range,
        text: inlineCompletion
      }]);
      
      setShowInlineCompletion(false);
      setInlineCompletion('');
    }
  };

  const generateCode = async (prompt) => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const generatedCode = await copilotService.generateCode(prompt, language, context);
      if (generatedCode) {
        onCodeChange(generatedCode);
        
        setGenerationHistory(prev => [{
          id: Date.now(),
          prompt,
          code: generatedCode,
          language,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
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
      {/* Copilot Status Bar */}
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
          <CodeIcon sx={{ fontSize: 20, color: isConnected ? 'success.main' : 'error.main' }} />
        </Badge>
        
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          Copilot {isConnected ? 'Active' : 'Inactive'}
        </Typography>

        <Tooltip title="Toggle Copilot">
          <IconButton size="small" onClick={toggleCopilot}>
            <SmartToyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Get Suggestions">
          <IconButton 
            size="small" 
            onClick={handleInlineCompletion}
            disabled={!isConnected || isLoading}
          >
            {isLoading ? <CircularProgress size={16} /> : <LightbulbIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton size="small" onClick={() => setShowSettings(true)}>
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="About Copilot Integration">
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
          🤖 GitHub Copilot Integration
        </Typography>
        <Typography variant="caption">
          This is a <strong>mock implementation</strong> demonstrating how GitHub Copilot would integrate with your IDE. 
          GitHub Copilot doesn't currently provide a public API, but this shows the potential user experience.
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
            p: 2,
            maxWidth: 400,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AutoFixHighIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Copilot Suggestion
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setShowInlineCompletion(false)}
              sx={{ ml: 'auto' }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace', 
              background: '#f5f5f5', 
              p: 1, 
              borderRadius: 1,
              mb: 1
            }}
          >
            {inlineCompletion}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              variant="contained" 
              onClick={applyInlineCompletion}
              startIcon={<CheckIcon />}
            >
              Apply
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => setShowInlineCompletion(false)}
            >
              Dismiss
            </Button>
          </Box>
        </Paper>
      )}

      {/* Suggestions Panel */}
      {suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: 50,
            right: 10,
            zIndex: 1000,
            p: 2,
            maxWidth: 350,
            maxHeight: 400,
            overflow: 'auto',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            💡 Copilot Suggestions
          </Typography>
          
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { background: '#f5f5f5' },
                  borderRadius: 1,
                  mb: 0.5
                }}
                onClick={() => {
                  onCodeChange(suggestion.code);
                  setSuggestions([]);
                }}
              >
                <ListItemIcon>
                  <CodeIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={suggestion.description}
                  secondary={suggestion.type}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Settings Dialog */}
      <Dialog 
        open={showSettings} 
        onClose={() => setShowSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            GitHub Copilot Settings
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
              This is a mock implementation. Real GitHub Copilot settings would be managed through your IDE and GitHub account.
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Auto Complete</InputLabel>
              <Select
                value={settings.autoComplete}
                onChange={(e) => updateSettings({ autoComplete: e.target.value })}
                label="Auto Complete"
              >
                <MenuItem value={true}>Enabled</MenuItem>
                <MenuItem value={false}>Disabled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Inline Suggestions</InputLabel>
              <Select
                value={settings.inlineSuggestions}
                onChange={(e) => updateSettings({ inlineSuggestions: e.target.value })}
                label="Inline Suggestions"
              >
                <MenuItem value={true}>Enabled</MenuItem>
                <MenuItem value={false}>Disabled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Code Actions</InputLabel>
              <Select
                value={settings.codeActions}
                onChange={(e) => updateSettings({ codeActions: e.target.value })}
                label="Code Actions"
              >
                <MenuItem value={true}>Enabled</MenuItem>
                <MenuItem value={false}>Disabled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Context Aware</InputLabel>
              <Select
                value={settings.contextAware}
                onChange={(e) => updateSettings({ contextAware: e.target.value })}
                label="Context Aware"
              >
                <MenuItem value={true}>Enabled</MenuItem>
                <MenuItem value={false}>Disabled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Language Specific</InputLabel>
              <Select
                value={settings.languageSpecific}
                onChange={(e) => updateSettings({ languageSpecific: e.target.value })}
                label="Language Specific"
              >
                <MenuItem value={true}>Enabled</MenuItem>
                <MenuItem value={false}>Disabled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            zIndex: 1000,
            p: 2,
            maxWidth: 300,
            maxHeight: 200,
            overflow: 'auto',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            <HistoryIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Recent Generations
          </Typography>
          
          <List dense>
            {generationHistory.slice(0, 3).map((item) => (
              <ListItem key={item.id} sx={{ p: 0.5 }}>
                <ListItemText 
                  primary={item.prompt}
                  secondary={new Date(item.timestamp).toLocaleTimeString()}
                  primaryTypographyProps={{ variant: 'caption' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export { GitHubCopilotService, GitHubCopilotIntegration };
