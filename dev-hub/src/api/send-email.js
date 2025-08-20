// Email service for the main app
import { createClient } from '@supabase/supabase-js';

const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function sendEmail(to, subject, html, text) {
  try {
    // Option 1: Using Resend (recommended for production)
    if (process.env.REACT_APP_RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.REACT_APP_FROM_EMAIL || 'noreply@yourdomain.com',
          to: [to],
          subject: subject,
          html: html,
          text: text
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`);
      }

      return { ok: true, msg: 'Email sent via Resend' };
    }

    // Option 2: Using SendGrid
    if (process.env.REACT_APP_SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.REACT_APP_FROM_EMAIL || 'noreply@yourdomain.com' },
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

      return { ok: true, msg: 'Email sent via SendGrid' };
    }

    // Option 3: Using Mailgun
    if (process.env.REACT_APP_MAILGUN_API_KEY && process.env.REACT_APP_MAILGUN_DOMAIN) {
      const formData = new URLSearchParams();
      formData.append('from', process.env.REACT_APP_FROM_EMAIL || `noreply@${process.env.REACT_APP_MAILGUN_DOMAIN}`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', html);
      formData.append('text', text);

      const response = await fetch(`https://api.mailgun.net/v3/${process.env.REACT_APP_MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${process.env.REACT_APP_MAILGUN_API_KEY}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Mailgun API error: ${response.statusText}`);
      }

      return { ok: true, msg: 'Email sent via Mailgun' };
    }

    // Fallback: Log email details for development
    console.log('Email would be sent:', {
      to,
      subject,
      html,
      text,
      timestamp: new Date().toISOString()
    });

    return { 
      ok: true, 
      msg: 'Email logged (no email provider configured)',
      development: true
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      error: 'Failed to send email',
      details: error.message 
    };
  }
}
