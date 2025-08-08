// pages/api/invite.js
import { createClient } from '@supabase/supabase-js';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, workspace_id, inviter_id, message } = req.body;

  try {
    // Step 1: Get workspace and inviter details
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('name, description')
      .eq('id', workspace_id)
      .single();
    
    if (workspaceError) {
      return res.status(400).json({ error: 'Workspace not found' });
    }

    const { data: inviter, error: inviterError } = await supabaseAdmin
      .from('users')
      .select('email, full_name')
      .eq('id', inviter_id)
      .single();
    
    if (inviterError) {
      return res.status(400).json({ error: 'Inviter not found' });
    }

    // Step 2: Send the Auth invite email
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        workspace_id: workspace_id,
        workspace_name: workspace.name,
        inviter_name: inviter.full_name || inviter.email
      }
    });
    
    if (inviteError && !inviteError.message.includes("User already registered")) {
      return res.status(400).json({ error: inviteError.message });
    }

    // Step 3: Add user to workspace_members with pending status
    const { error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .upsert([{ 
        workspace_id, 
        user_email: email, 
        invited_by: inviter_id,
        role: 'member',
        accepted_at: null // This will be null until they accept
      }]);
    
    if (memberError) {
      return res.status(400).json({ error: memberError.message });
    }

    // Step 4: Send custom email notification with workspace details
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const workspaceUrl = `${appUrl}/workspace/${workspace_id}`;
    
    const emailSubject = `You've been invited to join "${workspace.name}" workspace`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .workspace-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
          .btn { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Workspace Invitation</h1>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p><strong>${inviter.full_name || inviter.email}</strong> has invited you to join their workspace:</p>
            
            <div class="workspace-card">
              <h3 style="margin-top: 0; color: #007bff;">${workspace.name}</h3>
              ${workspace.description ? `<p style="color: #666;">${workspace.description}</p>` : ''}
            </div>
            
            ${message ? `<p><strong>Message from ${inviter.full_name || inviter.email}:</strong><br><em>${message}</em></p>` : ''}
            
            <p>To accept this invitation and access the workspace:</p>
            <ol>
              <li>Click the button below to sign up or sign in</li>
              <li>You'll be automatically added to the workspace</li>
              <li>Start collaborating with your team!</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${workspaceUrl}" class="btn">Join Workspace</a>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact ${inviter.email}</p>
              <p>This invitation was sent from DevHub Workspace</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const emailText = `
Workspace Invitation

Hello!

${inviter.full_name || inviter.email} has invited you to join their workspace: ${workspace.name}

${workspace.description ? `Description: ${workspace.description}` : ''}

${message ? `Message from ${inviter.full_name || inviter.email}: ${message}` : ''}

To accept this invitation and access the workspace:
1. Visit: ${workspaceUrl}
2. Sign up or sign in
3. You'll be automatically added to the workspace
4. Start collaborating with your team!

If you have any questions, please contact ${inviter.email}

This invitation was sent from DevHub Workspace
    `;

    // Send email using the email service
    try {
      const emailResponse = await fetch(`${req.headers.origin}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText
        }),
      });

      const emailResult = await emailResponse.json();
      if (!emailResult.ok) {
        console.error('Email sending failed:', emailResult);
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
    }

    return res.status(200).json({ 
      ok: true, 
      msg: "Invite sent successfully",
      workspace: workspace.name,
      invitee: email
    });

  } catch (error) {
    console.error('Invite error:', error);
    return res.status(500).json({ error: 'Failed to send invite' });
  }
}

