// Fix ramitgoodboy@gmail.com access to workspace
// Run this in your browser console when logged in as ramitrgoyal@gmail.com

const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRamitGoodboyAccess() {
  console.log('🔧 Fixing ramitgoodboy@gmail.com access...');
  
  try {
    // Step 1: Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }
    console.log('✅ Current user:', user.email);
    
    // Step 2: Find the workspace that was just shared
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (workspacesError) {
      console.error('❌ Error getting workspaces:', workspacesError);
      return;
    }
    
    console.log('📁 Found workspaces:', workspaces.map(w => ({ id: w.id, name: w.name })));
    
    // Step 3: Check if ramitgoodboy@gmail.com already has access
    const { data: existingMemberships, error: membershipError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('user_email', 'ramitgoodboy@gmail.com');
    
    if (membershipError) {
      console.error('❌ Error checking memberships:', membershipError);
      return;
    }
    
    console.log('👥 Existing memberships for ramitgoodboy@gmail.com:', existingMemberships);
    
    // Step 4: Get the user ID for ramitgoodboy@gmail.com
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'ramitgoodboy@gmail.com')
      .single();
    
    if (targetUserError) {
      console.error('❌ Error getting target user:', targetUserError);
      return;
    }
    
    console.log('👤 Target user:', targetUser);
    
    // Step 5: For each workspace owned by current user, ensure ramitgoodboy@gmail.com has access
    for (const workspace of workspaces) {
      const existingMembership = existingMemberships.find(m => m.workspace_id === workspace.id);
      
      if (!existingMembership) {
        console.log(`➕ Adding ramitgoodboy@gmail.com to workspace: ${workspace.name}`);
        
        const { data: newMembership, error: insertError } = await supabase
          .from('workspace_members')
          .insert([{
            workspace_id: workspace.id,
            user_id: targetUser.id,
            user_email: 'ramitgoodboy@gmail.com',
            role: 'member',
            status: 'active',
            invited_by: user.id,
            accepted_at: new Date().toISOString()
          }])
          .select();
        
        if (insertError) {
          console.error(`❌ Error adding to workspace ${workspace.name}:`, insertError);
        } else {
          console.log(`✅ Added to workspace ${workspace.name}:`, newMembership);
        }
      } else {
        console.log(`✅ Already has access to workspace: ${workspace.name}`);
        
        // Update status to active if it's not already
        if (existingMembership.status !== 'active') {
          console.log(`🔄 Updating status to active for workspace: ${workspace.name}`);
          
          const { error: updateError } = await supabase
            .from('workspace_members')
            .update({ 
              status: 'active',
              accepted_at: new Date().toISOString()
            })
            .eq('id', existingMembership.id);
          
          if (updateError) {
            console.error(`❌ Error updating status:`, updateError);
          } else {
            console.log(`✅ Status updated for workspace: ${workspace.name}`);
          }
        }
      }
    }
    
    console.log('🎉 Access fix completed!');
    
    // Step 6: Verify the fix
    const { data: finalMemberships, error: finalError } = await supabase
      .from('workspace_members')
      .select('*, workspaces(name)')
      .eq('user_email', 'ramitgoodboy@gmail.com');
    
    if (finalError) {
      console.error('❌ Error verifying fix:', finalError);
    } else {
      console.log('🔍 Final memberships for ramitgoodboy@gmail.com:', finalMemberships);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixRamitGoodboyAccess();
