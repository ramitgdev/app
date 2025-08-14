// Fix Chat Setup Script
// This will help set up the chat system properly

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixChatSetup() {
  console.log('🔧 Fixing Chat Setup...\n');

  try {
    // 1. Check if we have any workspaces
    console.log('1. Checking workspaces...');
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .limit(5);

    if (workspaceError) {
      console.log('❌ Error loading workspaces:', workspaceError.message);
      return;
    }

    console.log(`✅ Found ${workspaces.length} workspaces`);
    workspaces.forEach(w => console.log(`   - ${w.name} (${w.id})`));

    if (workspaces.length === 0) {
      console.log('⚠️  No workspaces found. You need to create a workspace first.');
      return;
    }

    // 2. Check workspace members
    console.log('\n2. Checking workspace members...');
    const workspaceId = workspaces[0].id;
    
    const { data: members, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (membersError) {
      console.log('❌ Error loading members:', membersError.message);
      return;
    }

    console.log(`✅ Found ${members.length} members in workspace`);
    members.forEach(m => console.log(`   - ${m.user_email} (${m.user_id ? 'Accepted' : 'Pending'})`));

    // 3. Check if we can insert a test group message
    console.log('\n3. Testing group message insertion...');
    if (members.length > 0) {
      const acceptedMember = members.find(m => m.user_id);
      if (acceptedMember) {
        const { data: testMsg, error: testError } = await supabase
          .from('workspace_group_chats')
          .insert([{
            workspace_id: workspaceId,
            sender_id: acceptedMember.user_id,
            message: '🧪 Test message from fix script',
            message_type: 'text'
          }])
          .select()
          .single();

        if (testError) {
          console.log('❌ Error inserting test message:', testError.message);
        } else {
          console.log('✅ Test message inserted successfully:', testMsg.id);
          
          // Clean up
          await supabase
            .from('workspace_group_chats')
            .delete()
            .eq('id', testMsg.id);
          console.log('✅ Test message cleaned up');
        }
      } else {
        console.log('⚠️  No accepted members found. Members need to accept workspace invitations.');
      }
    }

    // 4. Instructions for fixing issues
    console.log('\n📋 Instructions to fix chat issues:');
    
    if (members.length === 0) {
      console.log('1. Add members to your workspace:');
      console.log('   - Go to your workspace in the app');
      console.log('   - Click "Share" or "Invite"');
      console.log('   - Add your alt account email');
    }
    
    if (members.length > 0 && !members.find(m => m.user_id)) {
      console.log('1. Accept workspace invitations:');
      console.log('   - Check your alt account email for invitations');
      console.log('   - Click the invitation link to accept');
    }
    
    console.log('2. Create storage bucket:');
    console.log('   - Go to Supabase dashboard → Storage');
    console.log('   - Click "Create a new bucket"');
    console.log('   - Name: workspace-files');
    console.log('   - Make it public: ✅');
    
    console.log('3. Test the chat:');
    console.log('   - Start your app: npm start');
    console.log('   - Go to Team Chat section');
    console.log('   - Try sending a group message');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixChatSetup();
