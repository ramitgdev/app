import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use the SAME connection method as your main app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://itxnrnohdagesykzalzl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5ybm9oZGFnZXN5a3phbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzE1MTgsImV4cCI6MjA2ODU0NzUxOH0.5tmd_k9Fn0qscrSpZL0bLjs_dT_IsfBlN-iT5D_noyg';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Set CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') return res.status(405).end();
  
  console.log('=== INVITE API CALLED ===');
  console.log('Request body:', req.body);
  console.log('Environment check:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
  
  const { email, workspace_id, inviter_id, message } = req.body;

  // Check if environment variables are set
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log('Creating Supabase client...');
    // Use the SAME client as your main app (ANON key, not service role)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client created successfully');
    console.log('🔍 Using Supabase URL:', supabaseUrl);
    console.log('🔍 Using ANON key (same as main app)');

    // Get workspace and inviter details for the email
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('name, description')
      .eq('id', workspace_id)
      .single();
    
    const { data: inviter } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', inviter_id)
      .single();

    console.log('Attempting to invite user by email...');
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    
    // Handle the case where user already exists
    if (inviteError) {
      if (inviteError.message.includes("User already registered") || inviteError.code === 'email_exists') {
        console.log('User already registered, continuing with workspace invitation...');
      } else {
        console.error('Invite error:', inviteError);
        return res.status(400).json({ error: inviteError.message });
      }
    } else {
      console.log('User invite sent successfully');
    }

    console.log('Adding user to workspace members...');
    console.log('🔍 Insert data:', { workspace_id, user_email: email, invited_by: inviter_id });
    
    // First, check if the member already exists
    const { data: existingMember, error: checkError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('user_email', email);
    
    if (checkError) {
      console.error('❌ Error checking existing member:', checkError);
    } else {
      console.log('🔍 Existing members found:', existingMember);
    }
    
    // Try the insert with proper invite data
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .upsert([{ 
        workspace_id, 
        user_email: email, 
        invited_by: inviter_id,
        role: 'member',
        invited_at: new Date().toISOString(),
        accepted_at: null
      }])
      .select();

    if (memberError) {
      console.error('❌ Member insert error:', memberError);
      console.error('❌ Error code:', memberError.code);
      console.error('❌ Error message:', memberError.message);
      console.error('❌ Error details:', memberError.details);
      console.error('❌ Error hint:', memberError.hint);
      return res.status(400).json({ error: memberError.message });
    }
    
    console.log('✅ User added to workspace members successfully');
    console.log('✅ Member data inserted:', memberData);
    
    // Verify the insertion actually worked
    const { data: verifyMember, error: verifyError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('user_email', email)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed - member not found:', verifyError);
      console.error('❌ Verification error code:', verifyError.code);
      console.error('❌ Verification error message:', verifyError.message);
    } else {
      console.log('✅ Verification successful - member found:', verifyMember);
    }

    // Send email notification using the real email service
    console.log('Sending email notification...');
    try {
      const emailSubject = `You've been invited to join "${workspace?.name || 'a workspace'}"`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Workspace Invitation</h2>
          <p>Hello!</p>
          <p><strong>${inviter?.full_name || inviter?.email || 'Someone'}</strong> has invited you to join their workspace:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #007bff;">${workspace?.name || 'Workspace'}</h3>
            ${workspace?.description ? `<p style="color: #666;">${workspace.description}</p>` : ''}
          </div>
          
          ${message ? `<p><strong>Message from ${inviter?.full_name || inviter?.email}:</strong><br><em>${message}</em></p>` : ''}
          
          <p>You can now access this workspace in your DevHub account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3001" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access DevHub</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>If you have any questions, please contact ${inviter?.email}</p>
            <p>This invitation was sent from DevHub Workspace</p>
          </div>
        </div>
      `;
      
      const emailText = `
Workspace Invitation

Hello!

${inviter?.full_name || inviter?.email || 'Someone'} has invited you to join their workspace: ${workspace?.name || 'Workspace'}

${workspace?.description ? `Description: ${workspace.description}` : ''}

${message ? `Message from ${inviter?.full_name || inviter?.email}: ${message}` : ''}

You can now access this workspace in your DevHub account.

Visit: http://localhost:3001

If you have any questions, please contact ${inviter?.email}

This invitation was sent from DevHub Workspace
      `.trim();

      // Send email directly using the email service logic
      console.log('Sending email directly...');
      
      try {
        // Option 1: Using Resend (recommended for production)
        if (process.env.RESEND_API_KEY) {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
              to: [email],
              subject: emailSubject,
              html: emailHtml,
              text: emailText
            }),
          });

          if (response.ok) {
            console.log('✅ Email sent successfully via Resend');
          } else {
            console.error('❌ Resend API error:', response.statusText);
          }
        }
        // Option 2: Using SendGrid
        else if (process.env.SENDGRID_API_KEY) {
          const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: email }] }],
              from: { email: process.env.FROM_EMAIL || 'noreply@yourdomain.com' },
              subject: emailSubject,
              content: [
                { type: 'text/html', value: emailHtml },
                { type: 'text/plain', value: emailText }
              ]
            }),
          });

          if (response.ok) {
            console.log('✅ Email sent successfully via SendGrid');
          } else {
            console.error('❌ SendGrid API error:', response.statusText);
          }
        }
        // Fallback: Log email details for development
        else {
          console.log('📧 EMAIL WOULD BE SENT:');
          console.log('To:', email);
          console.log('Subject:', emailSubject);
          console.log('HTML:', emailHtml);
          console.log('Text:', emailText);
          console.log('📧 END EMAIL');
          console.log('💡 To send real emails, configure RESEND_API_KEY or SENDGRID_API_KEY in your .env.local');
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
    }

    console.log('=== INVITE API SUCCESS ===');
    return res.status(200).json({ ok: true, msg: "Invite sent" });
  } catch (error) {
    console.error('Unexpected error in invite API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

