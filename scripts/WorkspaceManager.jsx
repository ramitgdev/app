// Example React Component showing how to use the workspace operations
// You can integrate this into your existing app

import React, { useState, useEffect } from 'react';
import {
  createWorkspace,
  deleteWorkspace,
  shareWorkspace,
  getUserWorkspaces,
  getWorkspaceCollaborators,
  removeCollaborator,
  getPendingInvitations,
  acceptWorkspaceInvitation
} from './workspace-operations';

const WorkspaceManager = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [shareEmail, setShareEmail] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadWorkspaces();
    loadPendingInvitations();
  }, []);

  // Load collaborators when workspace is selected
  useEffect(() => {
    if (selectedWorkspace) {
      loadCollaborators(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    setLoading(true);
    const result = await getUserWorkspaces();
    if (result.success) {
      setWorkspaces(result.workspaces);
    } else {
      alert('Error loading workspaces: ' + result.error);
    }
    setLoading(false);
  };

  const loadPendingInvitations = async () => {
    const result = await getPendingInvitations();
    if (result.success) {
      setPendingInvitations(result.invitations);
    }
  };

  const loadCollaborators = async (workspaceId) => {
    const result = await getWorkspaceCollaborators(workspaceId);
    if (result.success) {
      setCollaborators(result.collaborators);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setLoading(true);
    const result = await createWorkspace(newWorkspaceName, newWorkspaceDescription);
    
    if (result.success) {
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      loadWorkspaces(); // Refresh the list
      alert('Workspace created successfully!');
    } else {
      alert('Error creating workspace: ' + result.error);
    }
    setLoading(false);
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    if (!confirm('Are you sure you want to delete this workspace?')) return;

    setLoading(true);
    const result = await deleteWorkspace(workspaceId);
    
    if (result.success) {
      loadWorkspaces(); // Refresh the list
      setSelectedWorkspace(null);
      alert('Workspace deleted successfully!');
    } else {
      alert('Error deleting workspace: ' + result.error);
    }
    setLoading(false);
  };

  const handleShareWorkspace = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim() || !selectedWorkspace) return;

    setLoading(true);
    const result = await shareWorkspace(selectedWorkspace.id, shareEmail);
    
    if (result.success) {
      setShareEmail('');
      loadCollaborators(selectedWorkspace.id); // Refresh collaborators
      alert('Workspace shared successfully!');
    } else {
      alert('Error sharing workspace: ' + result.error);
    }
    setLoading(false);
  };

  const handleAcceptInvitation = async (workspaceId) => {
    setLoading(true);
    const result = await acceptWorkspaceInvitation(workspaceId);
    
    if (result.success) {
      loadWorkspaces(); // Refresh workspaces
      loadPendingInvitations(); // Refresh invitations
      alert('Invitation accepted!');
    } else {
      alert('Error accepting invitation: ' + result.error);
    }
    setLoading(false);
  };

  const handleRemoveCollaborator = async (userEmail) => {
    if (!confirm('Remove this collaborator?')) return;

    setLoading(true);
    const result = await removeCollaborator(selectedWorkspace.id, userEmail);
    
    if (result.success) {
      loadCollaborators(selectedWorkspace.id); // Refresh collaborators
      alert('Collaborator removed!');
    } else {
      alert('Error removing collaborator: ' + result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Workspace Manager</h1>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
          <h3>Pending Invitations</h3>
          {pendingInvitations.map((invitation) => (
            <div key={invitation.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span>
                <strong>{invitation.workspaces.name}</strong> - Invited by {invitation.invited_by_user?.full_name || invitation.invited_by_user?.email}
              </span>
              <button 
                onClick={() => handleAcceptInvitation(invitation.workspace_id)}
                disabled={loading}
                style={{ padding: '5px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Left Column - Workspace List & Creation */}
        <div>
          <h2>My Workspaces</h2>
          
          {/* Create New Workspace Form */}
          <form onSubmit={handleCreateWorkspace} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3>Create New Workspace</h3>
            <input
              type="text"
              placeholder="Workspace Name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newWorkspaceDescription}
              onChange={(e) => setNewWorkspaceDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '60px' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>

          {/* Workspace List */}
          <div>
            {loading && <p>Loading...</p>}
            {workspaces.map((workspace) => (
              <div 
                key={workspace.id} 
                style={{ 
                  padding: '15px', 
                  marginBottom: '10px', 
                  backgroundColor: selectedWorkspace?.id === workspace.id ? '#e3f2fd' : '#f5f5f5', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedWorkspace(workspace)}
              >
                <h4>{workspace.name}</h4>
                <p>{workspace.description}</p>
                <small>Created: {new Date(workspace.created_at).toLocaleDateString()}</small>
                <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace.id);
                    }}
                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Selected Workspace Details */}
        <div>
          {selectedWorkspace ? (
            <>
              <h2>{selectedWorkspace.name}</h2>
              <p>{selectedWorkspace.description}</p>

              {/* Share Workspace Form */}
              <form onSubmit={handleShareWorkspace} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3>Share Workspace</h3>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  style={{ width: '70%', padding: '8px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Share
                </button>
              </form>

              {/* Collaborators List */}
              <div>
                <h3>Collaborators</h3>
                {collaborators.length === 0 ? (
                  <p>No collaborators yet.</p>
                ) : (
                  collaborators.map((member) => (
                    <div 
                      key={member.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px', 
                        marginBottom: '5px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '4px' 
                      }}
                    >
                      <div>
                        <strong>{member.users?.full_name || member.user_email}</strong>
                        <br />
                        <small>{member.user_email} - {member.role}</small>
                      </div>
                      <button 
                        onClick={() => handleRemoveCollaborator(member.user_email)}
                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p>Select a workspace to view details and manage collaborators.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManager;
