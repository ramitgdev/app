const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ debug: true });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html, text } = req.body;

  // Debug: Log the API key being used
  console.log('Using API key:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');

  try {
    console.log(`Sending email to: ${to} using onboarding@resend.dev`);
    
    const postData = JSON.stringify({
      from: 'noreply@ramitgoyal.com', // Use your verified domain
      to: [to], // Send to the actual recipient
      subject: subject,
      html: html,
      text: text
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          console.log('Email sent successfully:', data);
          res.status(200).json({ ok: true, msg: 'Email sent via Resend' });
        } else {
          console.error('Resend API error:', data);
          res.status(500).json({ 
            error: 'Failed to send email',
            details: data 
          });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Email sending error:', error);
      res.status(500).json({ 
        error: 'Failed to send email',
        details: error.message 
      });
    });

    request.write(postData);
    request.end();

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// Invite endpoint
app.post('/api/invite', async (req, res) => {
  const { email, workspace_id, inviter_id, message } = req.body;

  console.log('Received invite request:', { email, workspace_id, inviter_id, message });

  try {
    // Get workspace details for the email
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('name, description')
      .eq('id', workspace_id)
      .single();

    if (workspaceError) {
      console.error('Error fetching workspace:', workspaceError);
      return res.status(400).json({ error: 'Workspace not found' });
    }

    // Send email notification
    const emailSubject = `You've been invited to join "${workspace.name}" workspace!`;
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
            <p>You've been invited to join a workspace!</p>
            
            <div class="workspace-card">
              <h3 style="margin-top: 0; color: #007bff;">${workspace.name}</h3>
              ${workspace.description ? `<p style="color: #666;">${workspace.description}</p>` : ''}
            </div>
            
            ${message ? `<p><strong>Message from the inviter:</strong><br><em>${message}</em></p>` : ''}
            
            <p>To accept this invitation:</p>
            <ol>
              <li>Click the button below</li>
              <li>Sign up or sign in to the application</li>
              <li>You'll be automatically added to the workspace</li>
              <li>Start collaborating with your team!</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3001/workspace/${workspace_id}" class="btn">Join Workspace</a>
            </div>
            
            <div class="footer">
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

You've been invited to join a workspace!

${message ? `Message from the inviter: ${message}` : ''}

To accept this invitation:
1. Visit: http://localhost:3001
2. Sign up or sign in
3. You'll be automatically added to the workspace
4. Start collaborating with your team!

This invitation was sent from DevHub Workspace
    `;

    // Send email using internal call
    const emailPostData = JSON.stringify({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    });

    const emailOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/send-email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(emailPostData)
      }
    };

    const emailRequest = http.request(emailOptions, (emailResponse) => {
      let emailData = '';
      
      emailResponse.on('data', (chunk) => {
        emailData += chunk;
      });
      
      emailResponse.on('end', () => {
        try {
          const emailResult = JSON.parse(emailData);
          if (!emailResult.ok) {
            console.error('Email sending failed:', emailResult);
          } else {
            console.log('Email sent successfully via internal call');
          }
        } catch (e) {
          console.error('Email response parsing error:', e);
        }
      });
    });

    emailRequest.on('error', (error) => {
      console.error('Email request error:', error);
    });

    emailRequest.write(emailPostData);
    emailRequest.end();

    return res.status(200).json({ 
      ok: true, 
      msg: "Invite sent successfully",
      emailSent: true
    });

  } catch (error) {
    console.error('Invite error:', error);
    return res.status(500).json({ error: 'Failed to send invite' });
  }
});

// Accept invite endpoint
app.post('/api/accept-invite', async (req, res) => {
  const { workspace_id, user_email, user_id } = req.body;

  try {
    // Update the membership to mark as accepted
    const { error: updateError } = await supabase
      .from('workspace_members')
      .update({ 
        accepted_at: new Date().toISOString(),
        user_id: user_id
      })
      .eq('workspace_id', workspace_id)
      .eq('user_email', user_email);

    if (updateError) {
      console.error('Accept invite error:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    console.log('Invite accepted successfully');
    return res.status(200).json({ 
      ok: true, 
      msg: "Successfully joined workspace",
      workspace_id: workspace_id
    });

  } catch (error) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ error: 'Failed to accept invite' });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
}); 