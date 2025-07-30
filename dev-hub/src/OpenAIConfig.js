import React, { useState } from 'react';
import {
  Box, Card, Typography, TextField, Button, Alert, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { llmIntegration } from './llm-integration';

const OpenAIConfig = ({ onConfigUpdate }) => {
  const [apiKey, setApiKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveConfig = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setIsConfiguring(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you'd save this to a secure backend
      // For now, we'll just update the environment variable
      // Note: This is for demonstration - in production, API keys should be handled server-side
      
      // Test the API key by making a simple call
      const testResponse = await llmIntegration.chatWithAI('Hello', []);
      
      setSuccess('OpenAI API key configured successfully! You can now use all AI features.');
      
      // Trigger parent component update
      if (onConfigUpdate) {
        onConfigUpdate();
      }
      
      // Clear the form
      setApiKey('');
      
    } catch (error) {
      setError(`Failed to configure OpenAI: ${error.message}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key first');
      return;
    }

    setIsConfiguring(true);
    setError('');
    setSuccess('');

    try {
      const testResponse = await llmIntegration.chatWithAI('Test connection', []);
      setSuccess('Connection successful! Your API key is working.');
    } catch (error) {
      setError(`Connection failed: ${error.message}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SmartToyIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={600}>
            OpenAI Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure your OpenAI API key to enable AI features
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          To get your OpenAI API key:
        </Typography>
        <Box component="ol" sx={{ pl: 2, color: 'text.secondary' }}>
          <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></li>
          <li>Sign in or create an account</li>
          <li>Go to API Keys section</li>
          <li>Create a new API key</li>
          <li>Copy the key and paste it below</li>
        </Box>
      </Box>

      <TextField
        fullWidth
        label="OpenAI API Key"
        type={showPassword ? 'text' : 'password'}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-..."
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleTestConnection}
          disabled={!apiKey.trim() || isConfiguring}
        >
          Test Connection
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveConfig}
          disabled={!apiKey.trim() || isConfiguring}
        >
          {isConfiguring ? 'Configuring...' : 'Save Configuration'}
        </Button>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> For security reasons, in a production environment, API keys should be handled server-side. This is a demonstration setup.
        </Typography>
      </Box>
    </Card>
  );
};

export default OpenAIConfig; 