# Complete Supabase Setup Guide for DevHub

## 🚨 Current Issues Identified
1. **Email confirmation blocking user registration** (500 error)
2. **Missing database schema** for your application
3. **Authentication configuration** needs optimization

## 📋 Step-by-Step Setup Instructions

### 1. Database Schema Setup

**Run the SQL Schema:**
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the entire content from `database/scripts/supabase-setup.sql`
3. Click "Run" to execute the schema

This will create:
- ✅ Users table (extends auth.users)
- ✅ Workspaces table
- ✅ Workspace members table
- ✅ Workspace chats table
- ✅ User presence table
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for automatic user creation
- ✅ Proper indexes for performance

### 2. Authentication Configuration

**Fix Email Confirmation Issue:**

**Option A: Disable Email Confirmation (Recommended for Development)**
1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll to "Email Confirmation"
3. **Uncheck "Enable email confirmations"**
4. Click "Save"

**Option B: Configure SMTP (For Production)**
1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll to "SMTP Settings"
3. Configure your email provider:
   ```
   SMTP Host: smtp.gmail.com (for Gmail)
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Pass: your-app-password
   SMTP Sender Name: DevHub
   SMTP Sender Email: your-email@gmail.com
   ```
4. Click "Save"

### 3. Environment Variables Check

Your current `.env.local` should have:
```env
REACT_APP_SUPABASE_URL=https://itxnrnohdagesykzalzl.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5ybm9oZGFnZXN5a3phbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzE1MTgsImV4cCI6MjA2ODU0NzUxOH0.5tmd_k9Fn0qscrSpZL0bLjs_dT_IsfBlN-iT5D_noyg
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Google OAuth Setup (Optional)

If you want Google sign-in to work:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy the Client ID to your `.env.local`

### 5. Backend Invite Service Setup

For your `backend-invite` service, ensure these environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://itxnrnohdagesykzalzl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**To get your Service Role Key:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "service_role" key (NOT the anon key)
3. Add it to your backend environment

### 6. Test the Setup

After completing the above steps:

1. **Test User Registration:**
   - Try signing up with a new email
   - Should work without email confirmation errors

2. **Test Database Operations:**
   - Create a workspace
   - Invite members
   - Send messages

3. **Check Database:**
   - Go to Supabase Dashboard → Table Editor
   - Verify tables are created and populated

## 🔧 Troubleshooting Common Issues

### Issue: "Error sending confirmation email"
**Solution:** Disable email confirmation (Step 2, Option A)

### Issue: "relation 'public.users' does not exist"
**Solution:** Run the SQL schema from `database/scripts/supabase-setup.sql`

### Issue: "Row Level Security policy violation"
**Solution:** The SQL schema includes proper RLS policies

### Issue: Google OAuth not working
**Solution:** Configure Google OAuth credentials (Step 4)

### Issue: Invite system not working
**Solution:** Ensure service role key is configured (Step 5)

## 📊 Database Schema Overview

```
auth.users (Supabase managed)
├── public.users (your app data)
├── public.workspaces
├── public.workspace_members
├── public.workspace_chats
└── public.user_presence
```

## 🔐 Security Features Included

- ✅ Row Level Security (RLS) on all tables
- ✅ Users can only see their own data and workspace data
- ✅ Workspace owners have full control
- ✅ Members can only access workspaces they belong to
- ✅ Automatic user profile creation on signup
- ✅ Secure invite system

## 🚀 Next Steps After Setup

1. **Test authentication flow completely**
2. **Create sample workspaces and test functionality**
3. **Configure email templates** (if using email confirmation)
4. **Set up proper error handling** in your React app
5. **Add loading states** for better UX

## 📞 Need Help?

If you encounter any issues:
1. Check Supabase Dashboard → Logs for detailed error messages
2. Verify all environment variables are correct
3. Ensure the SQL schema was executed successfully
4. Test with email confirmation disabled first

---

**Status After Setup:**
- ✅ Database schema configured
- ✅ Authentication working
- ✅ Row Level Security enabled
- ✅ User registration functional
- ✅ Workspace system operational
