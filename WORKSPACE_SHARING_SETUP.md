# Workspace Sharing System Setup Guide

This guide will help you set up the complete workspace sharing system with email invites and workspace access management.

## Features Implemented

✅ **Enhanced Workspace Sharing UI**
- Beautiful Material-UI interface for inviting users
- Member management with status tracking
- Personal message support for invitations

✅ **Email Invitation System**
- Professional HTML email templates
- Support for multiple email providers (Resend, SendGrid, Mailgun)
- Fallback logging for development

✅ **Invite Acceptance Flow**
- Dedicated invite acceptance page
- User authentication integration
- Automatic workspace access upon acceptance

✅ **Database Integration**
- Proper workspace membership tracking
- Invite status management (pending/accepted)
- User role management

## Setup Instructions

### 1. Database Setup

First, ensure your Supabase database has the required tables. Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor:

```sql
-- The tables are already defined in supabase-setup.sql
-- This includes: workspaces, workspace_members, users, etc.
```

### 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Provider (choose one)
# Option 1: Resend (recommended)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Option 2: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Option 3: Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
```

### 3. Email Provider Setup

#### Option A: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY` to your environment variables
4. Set up domain verification in Resend dashboard

#### Option B: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key in your SendGrid dashboard
3. Add `SENDGRID_API_KEY` to your environment variables
4. Verify your sender domain

#### Option C: Mailgun
1. Sign up at [mailgun.com](https://mailgun.com)
2. Get your API key and domain from the dashboard
3. Add `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` to your environment variables

### 4. API Routes

The following API routes are now available:

- `POST /api/invite` - Send workspace invitations
- `POST /api/accept-invite` - Accept workspace invitations
- `POST /api/send-email` - Email service endpoint

### 5. Frontend Components

#### Enhanced WorkspaceShare Component
The `WorkspaceShare` component now includes:
- Email input with validation
- Personal message field
- Member management interface
- Invite status tracking
- Member removal functionality

#### InviteAcceptance Component
A new component for handling invite acceptance:
- Professional UI for invite acceptance
- User authentication checks
- Automatic workspace access
- Error handling and loading states

### 6. Usage

#### Sending Invites
1. Navigate to any workspace
2. Click the "Share" button
3. Enter the recipient's email address
4. Optionally add a personal message
5. Click "Send Invite"

#### Accepting Invites
1. Recipients receive a professional email
2. Click the "Join Workspace" button in the email
3. Sign in or create an account
4. Automatically gain access to the workspace

#### Managing Members
- View all invited members in the sharing dialog
- See their acceptance status (Pending/Active)
- Remove members if needed
- Track invitation dates

### 7. Email Templates

The system includes professional HTML email templates with:
- Responsive design
- Branded styling
- Clear call-to-action buttons
- Fallback text version
- Workspace details and personal messages

### 8. Security Features

- Row Level Security (RLS) policies in Supabase
- User authentication required for invite acceptance
- Proper error handling and validation
- Secure API endpoints with proper authorization

### 9. Development vs Production

#### Development
- Emails are logged to console instead of being sent
- No email provider required for testing
- All functionality works without email setup

#### Production
- Configure an email provider (Resend recommended)
- Set up proper domain verification
- Test email delivery thoroughly

### 10. Testing the System

1. **Create a workspace** in your application
2. **Invite a test user** using the share dialog
3. **Check the console** for email logs (development)
4. **Sign in as the invited user** in a different browser/incognito
5. **Navigate to the invite URL** or workspace
6. **Verify access** to the shared workspace

### 11. Troubleshooting

#### Common Issues

**Emails not sending:**
- Check email provider configuration
- Verify API keys are correct
- Check console for error messages

**Invite acceptance not working:**
- Ensure user is authenticated
- Check database permissions
- Verify workspace exists

**Member management issues:**
- Check RLS policies in Supabase
- Verify user permissions
- Check database constraints

### 12. Customization

#### Email Templates
Modify the HTML template in `pages/api/invite.js` to match your branding.

#### UI Components
The Material-UI components can be customized by modifying the theme in `ModernTheme.js`.

#### Database Schema
Additional fields can be added to the `workspace_members` table for enhanced functionality.

### 13. Next Steps

Consider implementing these additional features:
- Bulk invite functionality
- Invite expiration dates
- Role-based permissions
- Workspace templates
- Advanced member management
- Invite analytics and tracking

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with a simple email provider setup
4. Check Supabase logs for database issues

The system is now ready for production use with proper email provider configuration! 