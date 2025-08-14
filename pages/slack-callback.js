import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { handleSlackCallback } from '../dev-hub/src/slack-integration';
import {
  Box, Card, CardContent, Typography, CircularProgress, Alert, Button
} from '@mui/material';
import { CheckCircle, Error, ArrowBack } from '@mui/icons-material';

export default function SlackCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  useEffect(() => {
    const { code, state, error } = router.query;

    if (error) {
      setStatus('error');
      setMessage('Slack authorization was denied or failed.');
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Missing authorization parameters.');
      return;
    }

    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Connecting to Slack...');

        const result = await handleSlackCallback(code, state);
        
        if (result.success) {
          setStatus('success');
          setMessage('Successfully connected to Slack! Your workspace is now integrated.');
          
          // Extract workspace ID from state
          try {
            const stateData = JSON.parse(atob(state));
            setWorkspaceId(stateData.workspaceId);
          } catch (e) {
            console.warn('Could not parse workspace ID from state');
          }
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Slack callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to connect to Slack. Please try again.');
      }
    };

    handleCallback();
  }, [router.query]);

  const handleBackToWorkspace = () => {
    if (workspaceId) {
      router.push(`/workspace/${workspaceId}`);
    } else {
      router.push('/');
    }
  };

  const handleRetry = () => {
    router.reload();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          {status === 'loading' && (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Connecting to Slack
              </Typography>
              <Typography color="text.secondary">
                {message}
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom color="success.main">
                Successfully Connected!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={handleBackToWorkspace}
                size="large"
              >
                Back to Workspace
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom color="error.main">
                Connection Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {message}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBackToWorkspace}
                >
                  Back to Workspace
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRetry}
                >
                  Try Again
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
