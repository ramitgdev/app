# Slack Environment Variables Setup

## Required Environment Variables

Add these to your `.env` file in the `dev-hub` directory:

```env
# Slack Integration
REACT_APP_SLACK_CLIENT_ID=xoxb-your-client-id-here
REACT_APP_SLACK_CLIENT_SECRET=your-client-secret-here
REACT_APP_SLACK_REDIRECT_URI=http://localhost:3000/slack-callback
```

## Where to Find These Values

### 1. Client ID
- Go to your Slack app dashboard: https://api.slack.com/apps
- Select your app
- Go to **"Basic Information"**
- Copy the **"Client ID"**

### 2. Client Secret
- In the same **"Basic Information"** section
- Click **"Show"** next to **"Client Secret"**
- Copy the secret

### 3. Redirect URI
- This should be: `http://localhost:3000/slack-callback`
- For production, change to: `https://yourdomain.com/slack-callback`

## Example .env File

```env
# Supabase (if not already set)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Slack Integration
REACT_APP_SLACK_CLIENT_ID=xoxb-1234567890-1234567890-abcdefghijklmnop
REACT_APP_SLACK_CLIENT_SECRET=abcdef1234567890abcdef1234567890
REACT_APP_SLACK_REDIRECT_URI=http://localhost:3000/slack-callback
```

## Verification

After adding the variables:

1. Restart your development server
2. Check that the variables are loaded:
   ```javascript
   console.log('Slack Client ID:', process.env.REACT_APP_SLACK_CLIENT_ID);
   ```
3. The Slack integration should now be available in your chat system
