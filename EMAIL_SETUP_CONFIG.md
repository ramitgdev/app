# Email Setup Configuration

## Your Resend Configuration

I've received your Resend API key and from email. Here's how to set it up:

### Resend API Key
```
re_8aLXA5tb_KKrdhy5dz9gjDVmMaiThVdV2
```

### From Email
```
ramitrgoyal@gmail.com
```

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in your project root with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Email Provider - Resend
RESEND_API_KEY=re_8aLXA5tb_KKrdhy5dz9gjDVmMaiThVdV2
FROM_EMAIL=ramitrgoyal@gmail.com
```

### 2. Verify Resend Setup

1. **Sign in to Resend Dashboard**: Go to [resend.com](https://resend.com)
2. **Verify Domain**: Add and verify your domain in Resend dashboard
3. **Test API Key**: The API key should be active and working

### 3. Test Email Sending

To test if emails are working:

1. **Start your development server**:
   ```bash
   cd dev-hub
   npm start
   ```

2. **Create a workspace** and invite someone
3. **Check the console** for email logs
4. **Check Resend dashboard** for sent emails

### 4. Domain Verification (Important)

For production emails, you need to verify your domain in Resend:

1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add the required DNS records
4. Wait for verification (usually takes a few minutes)

### 5. Alternative: Use Resend's Test Domain

For testing, you can use Resend's test domain:
- Change `FROM_EMAIL` to: `onboarding@resend.dev`
- This allows immediate testing without domain verification

## Testing the System

### Step 1: Test Email Service
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'
```

### Step 2: Test Workspace Invite
1. Create a workspace in your app
2. Click "Share" button
3. Enter an email address
4. Add a personal message
5. Click "Send Invite"
6. Check Resend dashboard for the email

### Step 3: Test Invite Acceptance
1. Open the email link in a new browser/incognito
2. Sign in or create account
3. Verify workspace access

## Troubleshooting

### Emails Not Sending
- Check if Resend API key is correct
- Verify domain is verified in Resend
- Check browser console for errors
- Check server logs for API errors

### Domain Issues
- Use `onboarding@resend.dev` for testing
- Verify your domain in Resend dashboard
- Add proper DNS records

### API Errors
- Ensure environment variables are loaded
- Check if server is running
- Verify API endpoint is accessible

## Next Steps

1. **Test with your email**: Try inviting yourself to test the flow
2. **Verify domain**: Set up proper domain verification in Resend
3. **Test with real users**: Invite actual team members
4. **Monitor delivery**: Check Resend dashboard for delivery status

The system is now configured with your Resend credentials and ready for testing! 