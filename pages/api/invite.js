// pages/api/invite.js
import { createClient } from '@supabase/supabase-js';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, workspace_id, inviter_id } = req.body;

  // Step 1: Send the Auth invite email
  const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
  if (inviteError && !inviteError.message.includes("User already registered")) {
    return res.status(400).json({ error: inviteError.message });
  }

  // Step 2: Add user to workspace_members
  const { error: memberError } = await supabaseAdmin
    .from('workspace_members')
    .upsert([{ workspace_id, user_email: email, invited_by: inviter_id }]);
  if (memberError) return res.status(400).json({ error: memberError.message });

  return res.status(200).json({ ok: true, msg: "Invite sent" });
}

