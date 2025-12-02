// Test script to verify workspace sharing fix works
// Run this after applying the SQL fix

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itxnrnohdagesykzalzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5ybm9oZGFnZXN5a3phbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzE1MTgsImV4cCI6MjA2ODU0NzUxOH0.5tmd_k9Fn0qscrSpZL0bLjs_dT_IsfBlN-iT5D_noyg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWorkspaceSharingFix() {
  console.log('🧪 Testing Workspace Sharing Fix...');
  
  try {
    // 1. Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.error('❌ Authentication required. Please log in first.');
      return false;
    }
    
    console.log('✅ Authenticated as:', session.user.email);
    
    // 2. Get user's workspaces
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id, name, owner_id')
      .eq('owner_id', session.user.id);
    
    if (workspacesError) {
      console.error('❌ Error accessing workspaces:', workspacesError);
      return false;
    }
    
    if (!workspaces || workspaces.length === 0) {
      console.log('⚠️ No workspaces found. Please create a workspace first.');
      return false;
    }
    
    console.log('✅ Found workspaces:', workspaces.map(w => w.name));
    
    // 3. Test member insertion (the main issue)
    const testWorkspace = workspaces[0];
    const testEmail = 'test-invite@example.com';
    
    console.log(`\n🧪 Testing member insertion for workspace: "${testWorkspace.name}"`);
    
    const testMemberData = {
      workspace_id: testWorkspace.id,
      user_email: testEmail,
      invited_by: session.user.id,
      role: 'member',
      invited_at: new Date().toISOString(),
      accepted_at: null
    };
    
    console.log('📝 Inserting test member:', testMemberData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('workspace_members')
      .insert([testMemberData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error message:', insertError.message);
      return false;
    }
    
    console.log('✅ Insert successful:', insertResult);
    
    // 4. Verify the member was created
    const { data: verifyResult, error: verifyError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('id', insertResult[0].id)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return false;
    }
    
    console.log('✅ Verification successful:', verifyResult);
    
    // 5. Clean up test data
    const { error: deleteError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', insertResult[0].id);
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clean up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n🎉 WORKSPACE SHARING FIX VERIFIED!');
    console.log('✅ The RLS policies are now working correctly.');
    console.log('✅ You should be able to share workspaces now.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the test
testWorkspaceSharingFix().then(success => {
  if (success) {
    console.log('\n🚀 Ready to test workspace sharing in your app!');
  } else {
    console.log('\n🔧 There are still issues to resolve.');
  }
});

// Export for use in other scripts
export { testWorkspaceSharingFix };
