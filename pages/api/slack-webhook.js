// Slack Webhook Handler API Route
import { handleSlackWebhook } from '../../dev-hub/src/slack-integration';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle Slack webhook
    const result = await handleSlackWebhook(req.body);

    // If it's a URL verification challenge, return the challenge
    if (result.challenge) {
      return res.status(200).json({ challenge: result.challenge });
    }

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Slack webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
