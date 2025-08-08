import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  Container, Card, CardContent, Typography, Button, Box, 
  Alert, CircularProgress, Avatar, Stack, Chip
} from '@mui/material';
import {
  CheckCircleIcon, ErrorIcon, PersonIcon, GroupIcon
} from '@mui/icons-material';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function InviteAcceptance() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [user, setUser] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function checkInvite() {
      try {
        // Get current user session
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          setError('Please sign in to accept this invitation');
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Check if user is already a member
        const { data: membership, error: membershipError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('user_email', currentUser.email)
          .single();

        if (membershipError && membershipError.code !== 'PGRST116') {
          setError('Failed to check membership status');
          setLoading(false);
          return;
        }

        if (membership && membership.accepted_at) {
          setAccepted(true);
          setLoading(false);
          return;
        }

        // Get workspace details
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('name, description, owner_id, users!workspaces_owner_id_fkey(full_name, email)')
          .eq('id', workspaceId)
          .single();

        if (workspaceError) {
          setError('Workspace not found');
          setLoading(false);
          return;
        }

        setWorkspace(workspaceData);
        setLoading(false);

      } catch (err) {
        setError('Failed to load invitation details');
        setLoading(false);
      }
    }

    checkInvite();
  }, [workspaceId]);

  const handleAcceptInvite = async () => {
    if (!user || !workspace) return;

    setAccepting(true);
    try {
      const response = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          user_email: user.email,
          user_id: user.id
        }),
      });

      const result = await response.json();
      
      if (result.ok) {
        setAccepted(true);
        // Redirect to workspace after a short delay
        setTimeout(() => {
          navigate(`/workspace/${workspaceId}`);
        }, 2000);
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">Loading invitation...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (accepted) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              Welcome to {workspace.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You've successfully joined the workspace. Redirecting you now...
            </Typography>
            <CircularProgress size={24} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
              <GroupIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              Workspace Invitation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You've been invited to join a workspace
            </Typography>
          </Box>

          {workspace && (
            <Box sx={{ mb: 4 }}>
              <Card variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {workspace.name}
                    </Typography>
                    {workspace.description && (
                      <Typography variant="body2" color="text.secondary">
                        {workspace.description}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Owner: {workspace.users?.full_name || workspace.users?.email}
                    </Typography>
                  </Box>

                  <Chip 
                    label="Pending Acceptance" 
                    color="warning" 
                    size="small"
                  />
                </Stack>
              </Card>
            </Box>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              By accepting this invitation, you'll be able to:
            </Typography>
            
            <Stack spacing={1} sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                Access all workspace resources and files
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                Collaborate with team members in real-time
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                Use all workspace tools and features
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="outlined" 
                onClick={() => navigate('/')}
                disabled={accepting}
              >
                Decline
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAcceptInvite}
                disabled={accepting}
                startIcon={accepting ? <CircularProgress size={16} /> : null}
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 