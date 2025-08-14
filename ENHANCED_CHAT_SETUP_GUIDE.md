# Enhanced Chat System Setup Guide

## Overview

This guide will help you set up the enhanced chat system for your DevHub workspace, including real-time messaging, group chats, file sharing, and Slack integration.

## Features

✅ **Real-time messaging** with WebSocket subscriptions  
✅ **Group chat rooms** for workspace-wide communication  
✅ **Direct messaging** between collaborators  
✅ **File sharing** with drag & drop support  
✅ **Slack integration** for cross-platform communication  
✅ **Online presence indicators**  
✅ **Push notifications**  
✅ **Message copying** and code snippet support  

## Setup Steps

### 1. Database Schema Setup

First, run the enhanced chat schema in your Supabase SQL Editor:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the entire `supabase-enhanced-chat-schema.sql` file
4. Click "Run" to execute

This will create:
- `workspace_group_chats` table for group messaging
- Enhanced `workspace_chats` table with file support
- `slack_integrations` table for Slack connections
- `slack_channels` table for channel mapping
- `chat_notifications` table for notifications
- All necessary indexes and RLS policies

### 2. Storage Bucket Setup

Create a storage bucket for chat files:

1. In Supabase dashboard, go to Storage
2. Click "Create a new bucket"
3. Set bucket name: `workspace-files`
4. Make it public: ✅
5. Click "Create bucket"

### 3. Environment Variables

Add these environment variables to your `.env` file:

```env
# Slack Integration
REACT_APP_SLACK_CLIENT_ID=your_slack_client_id
REACT_APP_SLACK_CLIENT_SECRET=your_slack_client_secret
REACT_APP_SLACK_REDIRECT_URI=http://localhost:3000/slack-callback

# Supabase (if not already set)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Slack App Setup

To enable Slack integration:

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "DevHub Integration")
4. Select your workspace
5. Go to "OAuth & Permissions"
6. Add these scopes:
   - `chat:write`
   - `channels:read`
   - `channels:history`
   - `users:read`
   - `files:read`
7. Set redirect URL: `http://localhost:3000/slack-callback`
8. Copy the Client ID and Client Secret to your `.env` file

### 5. Webhook Setup (Optional)

For real-time Slack message syncing:

1. In your Slack app settings, go to "Event Subscriptions"
2. Enable events
3. Set request URL: `https://your-domain.com/api/slack-webhook`
4. Subscribe to these events:
   - `message.channels`
   - `message.groups`
5. Save changes

## Usage

### Basic Chat Features

1. **Group Chat**: All workspace members can participate in group discussions
2. **Direct Messages**: Select a collaborator for private conversations
3. **File Sharing**: Click the attachment icon to share files
4. **Online Status**: See who's currently online in the workspace

### Slack Integration

1. **Connect to Slack**:
   - Click "Connect to Slack" in the chat panel
   - Authorize your Slack workspace
   - Select default channel for syncing

2. **Message Syncing**:
   - Messages sent in DevHub appear in Slack
   - Messages sent in Slack appear in DevHub (if webhook is configured)
   - Files are shared across both platforms

3. **Manage Integration**:
   - Disconnect: Click "Disconnect" in Slack settings
   - Change default channel: Update in integration settings

## API Endpoints

### Chat Endpoints

- `POST /api/slack-webhook` - Handle Slack webhooks
- `GET /slack-callback` - Handle Slack OAuth callback

### Database Tables

```sql
-- Group messages
workspace_group_chats
├── id (UUID)
├── workspace_id (UUID)
├── sender_id (UUID)
├── message (TEXT)
├── message_type (TEXT)
├── file_url (TEXT)
├── file_name (TEXT)
├── file_size (INTEGER)
└── created_at (TIMESTAMP)

-- Direct messages (enhanced)
workspace_chats
├── id (UUID)
├── workspace_id (UUID)
├── sender_id (UUID)
├── recipient_id (UUID)
├── message (TEXT)
├── message_type (TEXT)
├── file_url (TEXT)
├── file_name (TEXT)
├── file_size (INTEGER)
└── created_at (TIMESTAMP)

-- Slack integrations
slack_integrations
├── id (UUID)
├── workspace_id (UUID)
├── slack_workspace_id (TEXT)
├── access_token (TEXT)
├── settings (JSONB)
└── created_at (TIMESTAMP)
```

## Troubleshooting

### Common Issues

1. **Messages not appearing**:
   - Check Supabase real-time subscriptions
   - Verify RLS policies are correct
   - Check browser console for errors

2. **Slack integration not working**:
   - Verify environment variables are set
   - Check Slack app permissions
   - Ensure redirect URI matches exactly

3. **File uploads failing**:
   - Verify storage bucket exists
   - Check storage policies
   - Ensure file size is within limits

4. **Real-time not working**:
   - Check Supabase project settings
   - Verify WebSocket connections
   - Check network connectivity

### Debug Commands

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%chat%';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename LIKE '%chat%';

-- Test message insertion
INSERT INTO workspace_group_chats (workspace_id, sender_id, message)
VALUES ('your-workspace-id', 'your-user-id', 'Test message');
```

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **File Access**: Files are only accessible to workspace members
3. **Slack Tokens**: Stored securely in database with encryption
4. **Webhook Verification**: Implement signature verification for production

## Performance Optimization

1. **Message Limits**: Load only last 50 messages by default
2. **File Size Limits**: Set reasonable limits for file uploads
3. **Indexes**: All necessary database indexes are created
4. **Caching**: Consider implementing Redis for high-traffic workspaces

## Future Enhancements

- [ ] **Discord Integration** - Similar to Slack
- [ ] **Microsoft Teams Integration**
- [ ] **Video/Audio Calls**
- [ ] **Message Reactions**
- [ ] **Threaded Conversations**
- [ ] **Message Search**
- [ ] **Message Encryption**
- [ ] **Custom Emojis**

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Supabase logs
4. Verify all setup steps are completed
5. Test with a simple message first

## Migration from Old Chat

The enhanced chat system is backward compatible. Your existing chat messages will continue to work, and the new features will be available immediately after setup.
