// pages/api/accept-invite.js
import { createClient } from '@supabase/supabase-js';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { workspace_id, user_email } = req.body;

  try {
    // Check if the user is already a member
    const { data: existingMember, error: checkError } = await supabaseAdmin
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('user_email', user_email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(400).json({ error: 'Failed to check membership' });
    }

    if (existingMember && existingMember.accepted_at) {
      return res.status(200).json({ 
        ok: true, 
        msg: "Already a member of this workspace",
        workspace_id: workspace_id
      });
    }

    // Update the membership to mark as accepted
    const { error: updateError } = await supabaseAdmin
      .from('workspace_members')
      .update({ 
        accepted_at: new Date().toISOString(),
        user_id: req.body.user_id // If user is logged in
      })
      .eq('workspace_id', workspace_id)
      .eq('user_email', user_email);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Get workspace details for response
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('name, description')
      .eq('id', workspace_id)
      .single();

    if (workspaceError) {
      console.error('Workspace fetch error:', workspaceError);
    }

    return res.status(200).json({ 
      ok: true, 
      msg: "Successfully joined workspace",
      workspace: workspace,
      workspace_id: workspace_id
    });

  } catch (error) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ error: 'Failed to accept invite' });
  }
} 