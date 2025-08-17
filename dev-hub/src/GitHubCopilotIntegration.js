import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, IconButton, Button, Chip, 
  Alert, CircularProgress, Tooltip, Collapse, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import {
  CodeIcon, CheckIcon,
  RefreshIcon, HistoryIcon, StarIcon
} from '@mui/icons-material';
import AutoFixHighIcon from '@mui/icons-material/FlashOn';
import SmartToyIcon from '@mui/icons-material/Android';
import SettingsIcon from '@mui/icons-material/Settings';
import GitHubIcon from '@mui/icons-material/Code';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpeedIcon from '@mui/icons-material/Speed';
import CloseIcon from '@mui/icons-material/Close';
import GitHubCopilotMockAPI from './GitHubCopilotMockAPI';

class GitHubCopilotService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GITHUB_COPILOT_API_KEY;
    this.baseUrl = 'https://api.github.com/copilot';
    this.suggestions = [];
    this.isEnabled = false;
    this.settings = {
      autoComplete: true,
      inlineSuggestions: true,
      codeActions: true,
      contextAware: true,
      languageSpecific: true
    };
    
    // Use mock API for demonstration
    this.mockAPI = new GitHubCopilotMockAPI();
  }

  // Initialize Copilot with authentication
  async initialize(token) {
    try {
      this.apiKey = token;
      this.isEnabled = true;
      
      // Use mock API for demonstration
      const response = await this.mockAPI.initialize();
      return response.success;
    } catch (error) {
      console.error('Failed to initialize GitHub Copilot:', error);
      return false;
    }
  }

  // Test Copilot API connection
  async testConnection() {
    try {
      // Use mock API for demonstration
      const response = await this.mockAPI.testConnection();
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get code suggestions based on context
  async getSuggestions(code, language, cursorPosition, context = {}) {
    if (!this.isEnabled || !this.settings.inlineSuggestions) {
      return [];
    }

    try {
      // Use mock API for demonstration
      const suggestions = await this.mockAPI.getSuggestions(code, language, cursorPosition, context);
      this.suggestions = suggestions;
      return suggestions;
    } catch (error) {
      console.error('Error getting Copilot suggestions:', error);
      return [];
    }
  }

  // Get inline completion for current cursor position
  async getInlineCompletion(code, language, cursorPosition, context = {}) {
    if (!this.isEnabled || !this.settings.autoComplete) {
      return null;
    }

    try {
      // Use mock API for demonstration
      const completion = await this.mockAPI.getInlineCompletion(code, language, cursorPosition, context);
      return completion;
    } catch (error) {
      console.error('Error getting inline completion:', error);
    }
    
    return null;
  }

  // Generate code based on natural language description
  async generateCode(prompt, language, context = {}) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      // Use mock API for demonstration
      const code = await this.mockAPI.generateCode(prompt, language, context);
      return code;
    } catch (error) {
      console.error('Error generating code:', error);
    }
    
    return null;
  }

  // Get code explanations
  async explainCode(code, language) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      // Use mock API for demonstration
      const explanation = await this.mockAPI.explainCode(code, language);
      return explanation;
    } catch (error) {
      console.error('Error explaining code:', error);
    }
    
    return null;
  }

  // Get code refactoring suggestions
  async refactorCode(code, language, refactorType = 'general') {
    if (!this.isEnabled) {
      return null;
    }

    try {
      // Use mock API for demonstration
      const refactoredCode = await this.mockAPI.refactorCode(code, language, refactorType);
      return refactoredCode;
    } catch (error) {
      console.error('Error refactoring code:', error);
    }
    
    return null;
  }

  // Update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Toggle Copilot on/off
  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  // Get status
  getStatus() {
    return {
      enabled: this.isEnabled,
      connected: this.apiKey !== null,
      settings: this.settings
    };
  }
}

// React component for Copilot integration
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
  const [settings, setSettings] = useState(copilotService.getSettings());
  const [inlineCompletion, setInlineCompletion] = useState('');
  const [showInlineCompletion, setShowInlineCompletion] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);
  
  const completionTimeoutRef = useRef(null);

  // Initialize Copilot on mount
  useEffect(() => {
    const initializeCopilot = async () => {
      const token = process.env.REACT_APP_GITHUB_COPILOT_API_KEY;
      if (token) {
        const success = await copilotService.initialize(token);
        setIsConnected(success);
      }
    };

    initializeCopilot();
  }, [copilotService]);

  // Handle code changes and trigger suggestions
  useEffect(() => {
    if (!isConnected || !copilotService.getSettings().inlineSuggestions) {
      return;
    }

    // Debounce suggestions
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

  // Handle inline completion
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

  // Apply inline completion
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

  // Generate code from prompt
  const generateCode = async (prompt) => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const generatedCode = await copilotService.generateCode(prompt, language, context);
      if (generatedCode) {
        onCodeChange(generatedCode);
        
        // Add to history
        setGenerationHistory(prev => [{
          id: Date.now(),
          prompt,
          code: generatedCode,
          language,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]); // Keep last 10
      }
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Explain selected code
  const explainCode = async (selectedCode) => {
    if (!isConnected || !selectedCode) return;

    setIsLoading(true);
    try {
      const explanation = await copilotService.explainCode(selectedCode, language);
      if (explanation) {
        // You can show this in a dialog or chat
        console.log('Code explanation:', explanation);
      }
    } catch (error) {
      console.error('Error explaining code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refactor selected code
  const refactorCode = async (selectedCode, refactorType) => {
    if (!isConnected || !selectedCode) return;

    setIsLoading(true);
    try {
      const refactoredCode = await copilotService.refactorCode(selectedCode, language, refactorType);
      if (refactoredCode) {
        onCodeChange(refactoredCode);
      }
    } catch (error) {
      console.error('Error refactoring code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update settings
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    copilotService.updateSettings(updatedSettings);
  };

  // Toggle Copilot
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
          <GitHubIcon sx={{ fontSize: 20, color: isConnected ? 'success.main' : 'error.main' }} />
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
      </Paper>

      {/* Inline Completion Display */}
      {showInlineCompletion && inlineCompletion && (
        <Paper
          sx={{
            position: 'absolute',
            top: 50,
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
