// Test script to debug workspace sharing authentication
// Run this in your browser console or as a Node.js script

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itxnrnohdagesykzalzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5ybm9oZGFnZXN5a3phbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzE1MTgsImV4cCI6MjA2ODU0NzUxOH0.5tmd_k9Fn0qscrSpZL0bLjs_dT_IsfBlN-iT5D_noyg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWorkspaceSharing() {
  console.log('=== Testing Workspace Sharing Authentication ===');
  
  try {
    // 1. Check current authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }
    
    console.log('Current session:', session ? '✅ Authenticated' : '❌ Not authenticated');
    if (session?.user) {
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);
    }
    
    if (!session?.user) {
      console.log('❌ No authenticated user found. Please log in first.');
      return;
    }
    
    // 2. Test if we can access the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Error accessing users table:', userError);
    } else {
      console.log('✅ Users table access:', userData);
    }
    
    // 3. Test if we can access workspaces
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id, name, owner_id')
      .eq('owner_id', session.user.id);
    
    if (workspacesError) {
      console.error('❌ Error accessing workspaces:', workspacesError);
    } else {
      console.log('✅ Workspaces access:', workspaces);
    }
    
    // 4. Test if we can access workspace_members
    const { data: members, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .limit(5);
    
    if (membersError) {
      console.error('❌ Error accessing workspace_members:', membersError);
    } else {
      console.log('✅ Workspace members access:', members);
    }
    
    // 5. Test inserting a new member (this is what's failing)
    if (workspaces && workspaces.length > 0) {
      const testWorkspaceId = workspaces[0].id;
      console.log(`\n=== Testing member insertion for workspace: ${testWorkspaceId} ===`);
      
      const testMemberData = {
        workspace_id: testWorkspaceId,
        user_email: 'test@example.com',
        invited_by: session.user.id,
        role: 'member',
        accepted_at: null
      };
      
      console.log('Attempting to insert:', testMemberData);
      
      const { data: insertResult, error: insertError } = await supabase
        .from('workspace_members')
        .insert([testMemberData])
        .select();
      
      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        console.error('Error code:', insertError.code);
        console.error('Error message:', insertError.message);
        console.error('Error details:', insertError.details);
        console.error('Error hint:', insertError.hint);
      } else {
        console.log('✅ Insert successful:', insertResult);
        
        // Clean up the test data
        const { error: deleteError } = await supabase
          .from('workspace_members')
          .delete()
          .eq('id', insertResult[0].id);
        
        if (deleteError) {
          console.log('⚠️ Warning: Could not clean up test data:', deleteError);
        } else {
          console.log('✅ Test data cleaned up');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testWorkspaceSharing();

// Export for use in other scripts
export { testWorkspaceSharing };
