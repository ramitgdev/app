import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).end();

  const { to } = req.body;
  
  console.log('=== TESTING EMAIL CONFIGURATION ===');
  console.log('Environment variables:');
  console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Missing');

  try {
    // Test Resend
    if (process.env.RESEND_API_KEY) {
      console.log('Testing Resend...');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
          to: [to || 'test@example.com'],
          subject: 'Test Email from DevHub',
          html: '<h1>Test Email</h1><p>This is a test email to verify your email configuration.</p>',
          text: 'Test Email\n\nThis is a test email to verify your email configuration.'
        }),
      });

      if (response.ok) {
        console.log('✅ Resend test successful');
        return res.status(200).json({ 
          ok: true, 
          provider: 'Resend',
          msg: 'Test email sent successfully via Resend' 
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Resend test failed:', response.status, errorText);
        return res.status(400).json({ 
          ok: false, 
          provider: 'Resend',
          error: `Resend API error: ${response.status} - ${errorText}` 
        });
      }
    }
    // Test SendGrid
    else if (process.env.SENDGRID_API_KEY) {
      console.log('Testing SendGrid...');
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to || 'test@example.com' }] }],
          from: { email: process.env.FROM_EMAIL || 'noreply@yourdomain.com' },
          subject: 'Test Email from DevHub',
          content: [
            { type: 'text/html', value: '<h1>Test Email</h1><p>This is a test email to verify your email configuration.</p>' },
            { type: 'text/plain', value: 'Test Email\n\nThis is a test email to verify your email configuration.' }
          ]
        }),
      });

      if (response.ok) {
        console.log('✅ SendGrid test successful');
        return res.status(200).json({ 
          ok: true, 
          provider: 'SendGrid',
          msg: 'Test email sent successfully via SendGrid' 
        });
      } else {
        const errorText = await response.text();
        console.error('❌ SendGrid test failed:', response.status, errorText);
        return res.status(400).json({ 
          ok: false, 
          provider: 'SendGrid',
          error: `SendGrid API error: ${response.status} - ${errorText}` 
        });
      }
    }
    else {
      console.log('❌ No email provider configured');
      return res.status(400).json({ 
        ok: false, 
        error: 'No email provider configured. Please set RESEND_API_KEY or SENDGRID_API_KEY.' 
      });
    }
  } catch (error) {
    console.error('❌ Email test error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Email test failed',
      details: error.message 
    });
  }
}
