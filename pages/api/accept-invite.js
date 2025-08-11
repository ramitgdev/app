// pages/api/accept-invite.js
import { createClient } from '@supabase/supabase-js';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { workspace_id, user_email, user_id } = req.body;

  console.log('Accept invite API called:', { workspace_id, user_email, user_id });

  try {
    // Check if the user is already a member
    const { data: existingMember, error: checkError } = await supabaseAdmin
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('user_email', user_email);

    console.log('Existing member check:', existingMember, checkError);

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Membership check error:', checkError);
      return res.status(400).json({ error: 'Failed to check membership' });
    }

    // If already accepted, return success
    if (existingMember && existingMember.status === 'accepted') {
      console.log('User is already a member');
      return res.status(200).json({ 
        ok: true, 
        msg: "Already a member of this workspace",
        workspace_id: workspace_id
      });
    }

    // If no pending invitation found, return error
    if (!existingMember || existingMember.status !== 'pending') {
      console.error('No pending invitation found');
      return res.status(400).json({ error: 'No pending invitation found for this user and workspace' });
    }

    // Update the membership to mark as accepted
    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('workspace_members')
      .update({ 
        status: 'active',
        accepted_at: new Date().toISOString(),
        user_id: user_id
      })
      .eq('workspace_id', workspace_id)
      .eq('user_email', user_email)
      .eq('status', 'pending')
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    console.log('Invitation accepted successfully:', updatedMember);

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