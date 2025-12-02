// Emergency Workspace Fix Script
// Run this in the ramitgoodboy@gmail.com account browser console

const emergencyWorkspaceFix = async () => {
  console.log('🚨 Emergency workspace fix for ramitgoodboy@gmail.com...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    console.log('👤 Current user:', user.email);
    
    // First, let's check what workspaces exist
    const { data: allWorkspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*');
    
    if (workspacesError) {
      console.error('❌ Error fetching workspaces:', workspacesError);
      return;
    }
    
    console.log('📁 All workspaces:', allWorkspaces);
    
    // Check what memberships exist
    const { data: memberships, error: membershipsError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('user_email', user.email);
    
    if (membershipsError) {
      console.error('❌ Error fetching memberships:', membershipsError);
      return;
    }
    
    console.log('👥 Current memberships:', memberships);
    
    // Find the "hi" workspace
    const hiWorkspace = allWorkspaces.find(w => w.name === 'hi');
    
    if (hiWorkspace) {
      console.log('🎯 Found "hi" workspace:', hiWorkspace);
      
      // Check if we're already a member
      const existingMembership = memberships.find(m => m.workspace_id === hiWorkspace.id);
      
      if (existingMembership) {
        console.log('✅ Already a member of "hi" workspace:', existingMembership);
        
        // Update to active status if needed
        if (existingMembership.status !== 'active') {
          const { error: updateError } = await supabase
            .from('workspace_members')
            .update({ 
              status: 'active', 
              accepted_at: new Date().toISOString(),
              user_id: user.id
            })
            .eq('id', existingMembership.id);
          
          if (updateError) {
            console.error('❌ Error updating membership:', updateError);
          } else {
            console.log('✅ Updated membership to active');
          }
        }
      } else {
        console.log('➕ Adding membership to "hi" workspace...');
        
        // Add ourselves as a member
        const { data: newMembership, error: addError } = await supabase
          .from('workspace_members')
          .insert([{
            workspace_id: hiWorkspace.id,
            user_id: user.id,
            user_email: user.email,
            role: 'member',
            status: 'active',
            invited_by: hiWorkspace.owner_id,
            accepted_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (addError) {
          console.error('❌ Error adding membership:', addError);
        } else {
          console.log('✅ Added membership:', newMembership);
        }
      }
      
      // Test accessing the workspace
      console.log('🔍 Testing workspace access...');
      const { data: testAccess, error: accessError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', hiWorkspace.id)
        .single();
      
      if (accessError) {
        console.error('❌ Error accessing workspace:', accessError);
      } else {
        console.log('✅ Successfully accessed workspace:', testAccess);
      }
      
      // Test getting workspace members
      const { data: workspaceMembers, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', hiWorkspace.id);
      
      if (membersError) {
        console.error('❌ Error getting workspace members:', membersError);
      } else {
        console.log('✅ Workspace members:', workspaceMembers);
      }
      
      console.log('🎉 Emergency fix complete!');
      console.log('📋 Next steps:');
      console.log('1. Refresh the page');
      console.log('2. You should now see the "hi" workspace in your list');
      console.log('3. Try accessing the workspace');
      
    } else {
      console.log('⚠️ "hi" workspace not found. Available workspaces:', allWorkspaces.map(w => w.name));
      
      // If no "hi" workspace, let's create one
      console.log('📁 Creating a new workspace...');
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert([{
          name: 'Shared Workspace',
          description: 'Workspace for testing',
          owner_id: user.id
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating workspace:', createError);
      } else {
        console.log('✅ Created new workspace:', newWorkspace);
      }
    }
    
  } catch (error) {
    console.error('❌ Emergency fix error:', error);
  }
};

// Run the emergency fix
emergencyWorkspaceFix();
