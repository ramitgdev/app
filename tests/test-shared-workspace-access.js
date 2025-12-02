// Test script to verify shared workspace access
// Run this after applying the SQL fixes

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSharedWorkspaceAccess() {
  console.log('🧪 Testing Shared Workspace Access...\n');

  try {
    // Test 1: Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ User authentication error:', userError);
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('User ID:', user.id);

    // Test 2: Get accessible workspaces using new function
    console.log('\n📋 Testing get_user_accessible_workspaces()...');
    const { data: workspaces, error: workspacesError } = await supabase
      .rpc('get_user_accessible_workspaces');
    
    if (workspacesError) {
      console.error('❌ Error getting workspaces:', workspacesError);
    } else {
      console.log('✅ Workspaces found:', workspaces.length);
      workspaces.forEach((ws, index) => {
        console.log(`  ${index + 1}. ${ws.name} (${ws.membership_status})`);
      });
    }

    // Test 3: Get pending invitations using new function
    console.log('\n📨 Testing get_user_pending_invitations()...');
    const { data: invitations, error: invitationsError } = await supabase
      .rpc('get_user_pending_invitations');
    
    if (invitationsError) {
      console.error('❌ Error getting invitations:', invitationsError);
    } else {
      console.log('✅ Pending invitations found:', invitations.length);
      invitations.forEach((inv, index) => {
        console.log(`  ${index + 1}. ${inv.workspace_name} (invited by ${inv.inviter_email})`);
      });
    }

    // Test 4: Direct query to workspaces table
    console.log('\n🔍 Testing direct workspaces query...');
    const { data: directWorkspaces, error: directError } = await supabase
      .from('workspaces')
      .select('*');
    
    if (directError) {
      console.error('❌ Error with direct workspaces query:', directError);
    } else {
      console.log('✅ Direct workspaces query successful:', directWorkspaces.length, 'workspaces');
    }

    // Test 5: Direct query to workspace_members table
    console.log('\n👥 Testing direct workspace_members query...');
    const { data: members, error: membersError } = await supabase
      .from('workspace_members')
      .select('*');
    
    if (membersError) {
      console.error('❌ Error with direct workspace_members query:', membersError);
    } else {
      console.log('✅ Direct workspace_members query successful:', members.length, 'memberships');
      
      // Show memberships for current user
      const userMemberships = members.filter(m => 
        m.user_id === user.id || m.user_email === user.email
      );
      console.log('  User memberships:', userMemberships.length);
      userMemberships.forEach(m => {
        console.log(`    - Workspace: ${m.workspace_id}, Status: ${m.status}, Role: ${m.role}`);
      });
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSharedWorkspaceAccess();
