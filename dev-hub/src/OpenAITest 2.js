import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Card } from '@mui/material';
import { llmIntegration } from './llm-integration';

const OpenAITest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testOpenAI = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test the configuration
      const configStatus = llmIntegration.getConfigurationStatus();
      console.log('Configuration Status:', configStatus);

      // Test a simple API call
      const response = await llmIntegration.chatWithAI('Hello, can you respond with "OpenAI is working!"');
      
      setTestResult({
        success: true,
        configStatus,
        response
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        configStatus: llmIntegration.getConfigurationStatus()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        OpenAI Integration Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testOpenAI} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test OpenAI Integration'}
      </Button>

      {testResult && (
        <Box sx={{ mt: 2 }}>
          {testResult.success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="h6">✅ OpenAI Integration Working!</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Configuration: {testResult.configStatus.message}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Response: {testResult.response}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6">❌ OpenAI Integration Failed</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Error: {testResult.error}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Configuration: {testResult.configStatus.message}
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Environment Check:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • API Key exists: {!!process.env.REACT_APP_OPENAI_API_KEY ? '✅' : '❌'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • API Key starts with sk-: {process.env.REACT_APP_OPENAI_API_KEY?.startsWith('sk-') ? '✅' : '❌'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • API Key length: {process.env.REACT_APP_OPENAI_API_KEY?.length || 0}
        </Typography>
      </Box>
    </Card>
  );
};

export default OpenAITest; 