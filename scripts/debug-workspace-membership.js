// Debug Workspace Membership and Chat Issues
// Run this in your browser console to diagnose the problems

const debugWorkspaceIssues = async () => {
  console.log('🔍 Debugging workspace membership and chat issues...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    console.log('👤 Current user:', user.email);
    
    // Get all workspaces for current user
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .or(`owner_id.eq.${user.id},id.in.(select workspace_id from workspace_members where user_id = '${user.id}')`);
    
    if (workspacesError) throw workspacesError;
    console.log('📁 User workspaces:', workspaces);
    
    if (workspaces && workspaces.length > 0) {
      const workspace = workspaces[0]; // Use first workspace
      console.log('🎯 Using workspace:', workspace);
      
      // Get workspace members
      const { data: members, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id);
      
      if (membersError) throw membersError;
      console.log('👥 Workspace members:', members);
      
      // Get user profiles for all members
      const memberIds = [workspace.owner_id, ...members.map(m => m.user_id).filter(Boolean)];
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', memberIds);
      
      if (usersError) throw usersError;
      console.log('👤 User profiles:', users);
      
      // Get presence data
      const { data: presence, error: presenceError } = await supabase
        .from('user_presence')
        .select('*')
        .in('user_id', memberIds);
      
      if (presenceError) throw presenceError;
      console.log('🟢 Presence data:', presence);
      
      // Get existing chat messages
      const { data: chats, error: chatsError } = await supabase
        .from('workspace_chats')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true });
      
      if (chatsError) throw chatsError;
      console.log('💬 Existing chat messages:', chats);
      
      // Test sending a message
      console.log('📤 Testing message send...');
      const testMessage = {
        workspace_id: workspace.id,
        sender_id: user.id,
        recipient_id: memberIds.find(id => id !== user.id), // Send to another member
        message: `Test message from ${user.email} at ${new Date().toISOString()}`,
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
      
      // Check RLS policies
      console.log('🔐 Checking RLS policies...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id)
        .limit(1);
      
      if (rlsError) {
        console.error('❌ RLS policy issue:', rlsError);
      } else {
        console.log('✅ RLS policies working correctly');
      }
      
    } else {
      console.log('⚠️ No workspaces found for user');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Run the debug function
debugWorkspaceIssues();
