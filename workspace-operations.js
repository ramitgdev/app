// Workspace Operations for your React App
// Import this into your components and use these functions

import { supabase } from './supabaseClient'; // Adjust path as needed

// ============================================
// WORKSPACE CREATION
// ============================================

export const createWorkspace = async (name, description = '') => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspaces')
      .insert([
        {
          name: name,
          description: description,
          owner_id: user.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    console.log('Workspace created:', data);
    return { success: true, workspace: data };
  } catch (error) {
    console.error('Error creating workspace:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// WORKSPACE DELETION
// ============================================

export const deleteWorkspace = async (workspaceId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // The RLS policy ensures only the owner can delete
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId)
      .eq('owner_id', user.user.id); // Extra safety check

    if (error) throw error;
    
    console.log('Workspace deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// WORKSPACE SHARING
// ============================================

export const shareWorkspace = async (workspaceId, userEmail, role = 'collaborator') => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_email', userEmail)
      .single();

    if (existingMember) {
      return { success: false, error: 'User is already a member of this workspace' };
    }

    // Add the new member
    const { data, error } = await supabase
      .from('workspace_members')
      .insert([
        {
          workspace_id: workspaceId,
          user_email: userEmail,
          role: role,
          invited_by: user.user.id,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    console.log('Workspace shared with:', userEmail);
    return { success: true, member: data };
  } catch (error) {
    console.error('Error sharing workspace:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ACCEPT WORKSPACE INVITATION
// ============================================

export const acceptWorkspaceInvitation = async (workspaceId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_members')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        user_id: user.user.id
      })
      .eq('workspace_id', workspaceId)
      .eq('user_email', user.user.email)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    
    console.log('Workspace invitation accepted');
    return { success: true, member: data };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// GET USER'S WORKSPACES
// ============================================

export const getUserWorkspaces = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get owned workspaces and shared workspaces
    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        workspace_members!inner(
          role,
          status,
          accepted_at
        )
      `)
      .or(`owner_id.eq.${user.user.id},workspace_members.user_id.eq.${user.user.id}`)
      .eq('workspace_members.status', 'accepted');

    if (error) throw error;
    
    return { success: true, workspaces: data };
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// GET WORKSPACE COLLABORATORS
// ============================================

export const getWorkspaceCollaborators = async (workspaceId) => {
  try {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        *,
        users(
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('workspace_id', workspaceId)
      .eq('status', 'accepted');

    if (error) throw error;
    
    return { success: true, collaborators: data };
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// REMOVE COLLABORATOR
// ============================================

export const removeCollaborator = async (workspaceId, userEmail) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_email', userEmail);

    if (error) throw error;
    
    console.log('Collaborator removed');
    return { success: true };
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// GET PENDING INVITATIONS
// ============================================

export const getPendingInvitations = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        *,
        workspaces(
          id,
          name,
          description
        ),
        invited_by_user:users!workspace_members_invited_by_fkey(
          full_name,
          email
        )
      `)
      .eq('user_email', user.user.email)
      .eq('status', 'pending');

    if (error) throw error;
    
    return { success: true, invitations: data };
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return { success: false, error: error.message };
  }
};
