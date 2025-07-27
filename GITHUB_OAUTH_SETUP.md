# GitHub OAuth Setup Guide

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" in the left sidebar
3. Click "New OAuth App"
4. Fill in the form:
   - **Application name**: `DevHub Workspace`
   - **Homepage URL**: `http://localhost:3001`
   - **Application description**: `Developer workspace with GitHub integration`
   - **Authorization callback URL**: `http://localhost:3001/github-callback.html`
5. Click "Register application"
6. Copy the **Client ID** and **Client Secret**

## Step 2: Update OAuth Configuration

1. Open `dev-hub/src/github-oauth.js`
2. Replace the placeholder values:
   ```javascript
   export const GITHUB_CONFIG = {
     clientId: 'your-actual-client-id-here',
     clientSecret: 'your-actual-client-secret-here',
     redirectUri: 'http://localhost:3001/github-callback.html',
     scope: 'repo'
   };
   ```

## Step 3: Test the Integration

1. Start your development server: `npm start`
2. Go to the GitHub Editor tab
3. Click "Connect GitHub"
4. Authorize the application in the popup
5. You should see "GitHub Connected" when successful

## Troubleshooting

- **"Invalid client" error**: Check that your Client ID is correct
- **"Redirect URI mismatch"**: Make sure the callback URL matches exactly
- **Popup blocked**: Allow popups for localhost:3001
- **CORS errors**: Make sure you're running on localhost:3001

## Security Notes

- Never commit your Client Secret to version control
- For production, use environment variables
- The Client Secret should be kept secure 