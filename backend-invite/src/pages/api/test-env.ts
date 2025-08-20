import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  res.status(200).json({
    message: 'Environment check',
    supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
    supabaseServiceKey: supabaseServiceKey ? '✅ Set' : '❌ Missing',
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey
  });
}
