// Connect Accounts to Workspace Script
// Run this in your browser console to manually connect accounts

const connectAccountsToWorkspace = async () => {
  console.log('🔗 Connecting accounts to workspace...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    console.log('👤 Current user:', user.email);
    
    // Get or create a workspace
    let { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .limit(1);
    
    if (workspacesError) throw workspacesError;
    
    let workspace;
    if (workspaces && workspaces.length > 0) {
      workspace = workspaces[0];
      console.log('📁 Using existing workspace:', workspace);
    } else {
      // Create a new workspace
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert([{
          name: 'Test Workspace',
          description: 'Workspace for testing chat functionality',
          owner_id: user.id
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      workspace = newWorkspace;
      console.log('📁 Created new workspace:', workspace);
    }
    
    // Get all users to find the other account
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) throw usersError;
    console.log('👥 All users:', allUsers);
    
    // Find the other account (ramitrgoyal@gmail.com or ramitgoodboy@gmail.com)
    const otherEmails = ['ramitrgoyal@gmail.com', 'ramitgoodboy@gmail.com'];
    const otherUser = allUsers.find(u => otherEmails.includes(u.email) && u.id !== user.id);
    
    if (otherUser) {
      console.log('👤 Found other user:', otherUser);
      
      // Check if they're already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('user_id', otherUser.id)
        .single();
      
      if (memberError && memberError.code !== 'PGRST116') throw memberError;
      
      if (existingMember) {
        console.log('✅ User is already a member:', existingMember);
        
        // Update to active status if needed
        if (existingMember.status !== 'active') {
          const { error: updateError } = await supabase
            .from('workspace_members')
            .update({ status: 'active', accepted_at: new Date().toISOString() })
            .eq('id', existingMember.id);
          
          if (updateError) throw updateError;
          console.log('✅ Updated member status to active');
        }
      } else {
        // Add them as a member
        const { data: newMember, error: addError } = await supabase
          .from('workspace_members')
          .insert([{
            workspace_id: workspace.id,
            user_id: otherUser.id,
            user_email: otherUser.email,
            role: 'member',
            status: 'active',
            invited_by: user.id,
            accepted_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (addError) throw addError;
        console.log('✅ Added user as member:', newMember);
      }
      
      // Test sending a message
      console.log('📤 Testing message send...');
      const testMessage = {
        workspace_id: workspace.id,
        sender_id: user.id,
        recipient_id: otherUser.id,
        message: `Test message from ${user.email} to ${otherUser.email} at ${new Date().toISOString()}`,
        created_at: new Date().toISOString()
      };
      
      const { data: sentMessage, error: sendError } = await supabase
        .from('workspace_chats')
        .insert([testMessage])
        .select()
        .single();
      
      if (sendError) {
        console.error('❌ Error sending test message:', sendError);
      } else {
        console.log('✅ Test message sent successfully:', sentMessage);
      }
      
      // Verify the connection
      console.log('🔍 Verifying connection...');
      const { data: members, error: verifyError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id);
      
      if (verifyError) throw verifyError;
      console.log('✅ Workspace members:', members);
      
      // Get chat messages
      const { data: chats, error: chatsError } = await supabase
        .from('workspace_chats')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true });
      
      if (chatsError) throw chatsError;
      console.log('✅ Chat messages:', chats);
      
      console.log('🎉 Setup complete! Both accounts should now be able to chat.');
      console.log('📋 Instructions:');
      console.log('1. Refresh both browser windows');
      console.log('2. Go to the same workspace');
      console.log('3. Check the Team section - both users should appear');
      console.log('4. Try sending direct messages between the accounts');
      
    } else {
      console.log('⚠️ Other user not found. Make sure both accounts are created.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the connection script
connectAccountsToWorkspace();
