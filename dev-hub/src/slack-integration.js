// Slack Integration Service for Enhanced Chat System
import { supabase } from './supabaseClient';

// Slack OAuth Configuration
const SLACK_CLIENT_ID = process.env.REACT_APP_SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.REACT_APP_SLACK_CLIENT_SECRET;
const SLACK_REDIRECT_URI = process.env.REACT_APP_SLACK_REDIRECT_URI || 'http://localhost:3000/slack-callback';

// Slack API endpoints
const SLACK_API_BASE = 'https://slack.com/api';

// ============================================
// SLACK OAUTH FLOW
// ============================================

export const initiateSlackOAuth = (workspaceId) => {
  const state = btoa(JSON.stringify({ workspaceId, timestamp: Date.now() }));
  const scope = 'chat:write,channels:read,channels:history,users:read,files:read';
  
  const authUrl = `${SLACK_API_BASE}/oauth.v2.authorize?` +
    `client_id=${SLACK_CLIENT_ID}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `redirect_uri=${encodeURIComponent(SLACK_REDIRECT_URI)}&` +
    `state=${encodeURIComponent(state)}`;

  // Store state in localStorage for verification
  localStorage.setItem('slack_oauth_state', state);
  
  return authUrl;
};

export const handleSlackCallback = async (code, state) => {
  try {
    // Verify state
    const storedState = localStorage.getItem('slack_oauth_state');
    if (!storedState || storedState !== state) {
      throw new Error('Invalid OAuth state');
    }

    const stateData = JSON.parse(atob(state));
    const { workspaceId } = stateData;

    // Exchange code for access token
    const tokenResponse = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: SLACK_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.ok) {
      throw new Error(tokenData.error || 'Failed to get access token');
    }

    // Get workspace info
    const workspaceInfo = await getSlackWorkspaceInfo(tokenData.access_token);

    // Store integration in database
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: integration, error } = await supabase
      .from('slack_integrations')
      .insert([{
        workspace_id: workspaceId,
        slack_workspace_id: tokenData.team.id,
        slack_workspace_name: workspaceInfo.name,
        access_token: tokenData.access_token,
        bot_user_id: tokenData.bot_user_id,
        connected_by: user.user.id,
        settings: {
          sync_messages: true,
          sync_files: true,
          default_channel: null
        }
      }])
      .select()
      .single();

    if (error) throw error;

    // Fetch and store channels
    await syncSlackChannels(integration.id, tokenData.access_token);

    localStorage.removeItem('slack_oauth_state');
    
    return { success: true, integration };
  } catch (error) {
    console.error('Slack OAuth error:', error);
    localStorage.removeItem('slack_oauth_state');
    throw error;
  }
};

// ============================================
// SLACK API HELPERS
// ============================================

export const getSlackWorkspaceInfo = async (accessToken) => {
  const response = await fetch(`${SLACK_API_BASE}/team.info`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  const data = await response.json();
  if (!data.ok) throw new Error(data.error);
  
  return data.team;
};

export const getSlackChannels = async (accessToken) => {
  const response = await fetch(`${SLACK_API_BASE}/conversations.list?types=public_channel,private_channel`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  const data = await response.json();
  if (!data.ok) throw new Error(data.error);
  
  return data.channels;
};

export const sendSlackMessage = async (accessToken, channelId, message, attachments = []) => {
  const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: channelId,
      text: message,
      attachments,
    }),
  });
  
  const data = await response.json();
  if (!data.ok) throw new Error(data.error);
  
  return data;
};

export const uploadSlackFile = async (accessToken, channelId, file, title = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('channels', channelId);
  if (title) formData.append('title', title);

  const response = await fetch(`${SLACK_API_BASE}/files.upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  if (!data.ok) throw new Error(data.error);
  
  return data;
};

// ============================================
// DATABASE OPERATIONS
// ============================================

export const syncSlackChannels = async (integrationId, accessToken) => {
  try {
    const channels = await getSlackChannels(accessToken);
    
    // Clear existing channels
    await supabase
      .from('slack_channels')
      .delete()
      .eq('slack_integration_id', integrationId);

    // Insert new channels
    const channelData = channels.map(channel => ({
      slack_integration_id: integrationId,
      slack_channel_id: channel.id,
      slack_channel_name: channel.name,
      is_private: channel.is_private,
      is_archived: channel.is_archived
    }));

    const { error } = await supabase
      .from('slack_channels')
      .insert(channelData);

    if (error) throw error;
    
    return channels;
  } catch (error) {
    console.error('Error syncing Slack channels:', error);
    throw error;
  }
};

export const getWorkspaceSlackIntegration = async (workspaceId) => {
  try {
    const { data, error } = await supabase
      .from('slack_integrations')
      .select(`
        *,
        slack_channels(*)
      `)
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting Slack integration:', error);
    return null;
  }
};

export const disconnectSlackIntegration = async (integrationId) => {
  try {
    const { error } = await supabase
      .from('slack_integrations')
      .update({ is_active: false })
      .eq('id', integrationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Slack integration:', error);
    throw error;
  }
};

// ============================================
// MESSAGE SYNCING
// ============================================

export const syncMessageToSlack = async (workspaceId, message, channelId = null) => {
  try {
    const integration = await getWorkspaceSlackIntegration(workspaceId);
    if (!integration) return { success: false, error: 'No Slack integration found' };

    // Get default channel if none specified
    const targetChannel = channelId || integration.settings?.default_channel;
    if (!targetChannel) return { success: false, error: 'No target channel specified' };

    // Get sender info
    const { data: sender } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', message.sender_id)
      .single();

    const senderName = sender?.full_name || sender?.email || 'Unknown User';

    // Prepare Slack message
    let slackMessage = `*${senderName}*: ${message.message}`;
    let attachments = [];

    // Handle file messages
    if (message.message_type === 'file') {
      slackMessage = `*${senderName}* shared a file: ${message.file_name}`;
      attachments.push({
        title: message.file_name,
        title_link: message.file_url,
        text: `File size: ${(message.file_size / 1024).toFixed(1)} KB`,
        color: '#36a64f'
      });
    }

    // Send to Slack
    await sendSlackMessage(
      integration.access_token,
      targetChannel,
      slackMessage,
      attachments
    );

    return { success: true };
  } catch (error) {
    console.error('Error syncing message to Slack:', error);
    return { success: false, error: error.message };
  }
};

export const syncSlackMessageToWorkspace = async (workspaceId, slackMessage) => {
  try {
    // Get user by Slack user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('slack_user_id', slackMessage.user)
      .single();

    if (!user) {
      console.warn('Slack user not found in workspace:', slackMessage.user);
      return { success: false, error: 'User not found' };
    }

    // Insert message into workspace group chat
    const { error } = await supabase
      .from('workspace_group_chats')
      .insert([{
        workspace_id: workspaceId,
        sender_id: user.id,
        message: slackMessage.text,
        message_type: 'text',
        slack_message_id: slackMessage.ts,
        slack_channel_id: slackMessage.channel
      }]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error syncing Slack message to workspace:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// WEBHOOK HANDLING
// ============================================

export const handleSlackWebhook = async (payload) => {
  try {
    // Verify webhook signature (implement if needed)
    
    const { type, team_id, event } = payload;
    
    if (type === 'url_verification') {
      return { challenge: payload.challenge };
    }

    if (type === 'event_callback') {
      const { type: eventType, user, text, channel, ts } = event;
      
      if (eventType === 'message' && user && text) {
        // Find workspace by Slack team ID
        const { data: integration } = await supabase
          .from('slack_integrations')
          .select('workspace_id')
          .eq('slack_workspace_id', team_id)
          .eq('is_active', true)
          .single();

        if (integration) {
          await syncSlackMessageToWorkspace(integration.workspace_id, {
            user,
            text,
            channel,
            ts
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling Slack webhook:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatSlackMessage = (message, senderName) => {
  // Convert markdown-like syntax to Slack format
  let formatted = message
    .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold
    .replace(/\*(.*?)\*/g, '_$1_')     // Italic
    .replace(/`(.*?)`/g, '`$1`')       // Code
    .replace(/```([\s\S]*?)```/g, '```$1```'); // Code blocks

  return `*${senderName}*: ${formatted}`;
};

export const createSlackAttachment = (title, text, color = '#36a64f', fields = []) => {
  return {
    title,
    text,
    color,
    fields,
    footer: 'DevHub Workspace',
    ts: Math.floor(Date.now() / 1000)
  };
};

// ============================================
// NOTIFICATION HELPERS
// ============================================

export const sendSlackNotification = async (workspaceId, notification) => {
  try {
    const integration = await getWorkspaceSlackIntegration(workspaceId);
    if (!integration) return { success: false, error: 'No Slack integration found' };

    const defaultChannel = integration.settings?.default_channel;
    if (!defaultChannel) return { success: false, error: 'No default channel set' };

    const message = `🔔 *${notification.title}*\n${notification.message}`;
    
    await sendSlackMessage(
      integration.access_token,
      defaultChannel,
      message
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return { success: false, error: error.message };
  }
};
