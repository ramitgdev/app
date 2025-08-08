// pages/api/send-email.js
import { createClient } from '@supabase/supabase-js';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { to, subject, html, text } = req.body;

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
          to: [to],
          subject: subject,
          html: html,
          text: text
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`);
      }

      return res.status(200).json({ ok: true, msg: 'Email sent via Resend' });
    }

    // Option 2: Using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.FROM_EMAIL || 'noreply@yourdomain.com' },
          subject: subject,
          content: [
            { type: 'text/html', value: html },
            { type: 'text/plain', value: text }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      return res.status(200).json({ ok: true, msg: 'Email sent via SendGrid' });
    }

    // Option 3: Using Mailgun
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      const formData = new URLSearchParams();
      formData.append('from', process.env.FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', html);
      formData.append('text', text);

      const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Mailgun API error: ${response.statusText}`);
      }

      return res.status(200).json({ ok: true, msg: 'Email sent via Mailgun' });
    }

    // Option 4: Using Supabase Edge Functions (if you have one set up)
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text
        }),
      });

      if (!response.ok) {
        throw new Error(`Supabase Edge Function error: ${response.statusText}`);
      }

      return res.status(200).json({ ok: true, msg: 'Email sent via Supabase Edge Function' });
    }

    // Fallback: Log email details for development
    console.log('Email would be sent:', {
      to,
      subject,
      html,
      text,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      ok: true, 
      msg: 'Email logged (no email provider configured)',
      development: true
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
} 