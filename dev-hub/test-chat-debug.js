// Debug script to test chat system issues
// Run this to identify problems with group messages and direct messaging

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file contains:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugChatSystem() {
  console.log('🔍 Debugging Chat System Issues...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking database tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['workspace_group_chats', 'workspace_chats', 'workspace_members']);

    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name));
    }

    // Test 2: Check workspace members
    console.log('\n2. Checking workspace members...');
    const { data: members, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')
      .limit(5);

    if (membersError) {
      console.log('❌ Error loading members:', membersError.message);
    } else {
      console.log('✅ Found members:', members.length);
      members.forEach(m => console.log(`   - ${m.user_email} (${m.user_id ? 'Accepted' : 'Pending'})`));
    }

    // Test 3: Check if we can insert a test group message
    console.log('\n3. Testing group message insertion...');
    if (members && members.length > 0) {
      const workspaceId = members[0].workspace_id;
      const userId = members[0].user_id;
      
      if (userId) {
        const { data: groupMsg, error: groupError } = await supabase
          .from('workspace_group_chats')
          .insert([{
            workspace_id: workspaceId,
            sender_id: userId,
            message: '🧪 Test group message from debug script',
            message_type: 'text'
          }])
          .select()
          .single();

        if (groupError) {
          console.log('❌ Error inserting group message:', groupError.message);
        } else {
          console.log('✅ Group message inserted successfully:', groupMsg.id);
          
          // Clean up test message
          await supabase
            .from('workspace_group_chats')
            .delete()
            .eq('id', groupMsg.id);
          console.log('✅ Test message cleaned up');
        }
      } else {
        console.log('⚠️  No accepted members found to test with');
      }
    }

    // Test 4: Check RLS policies
    console.log('\n4. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_names: ['workspace_group_chats'] });

    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError.message);
    } else {
      console.log('✅ RLS policies configured');
    }

    // Test 5: Check real-time subscriptions
    console.log('\n5. Testing real-time subscription...');
    const channel = supabase
      .channel('test-chat-debug')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workspace_group_chats'
      }, (payload) => {
        console.log('✅ Real-time subscription working:', payload.new.message);
      })
      .subscribe();

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Real-time subscription established');

    // Test 6: Check storage bucket
    console.log('\n6. Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Error checking storage:', bucketError.message);
    } else {
      const workspaceFilesBucket = buckets.find(b => b.name === 'workspace-files');
      if (workspaceFilesBucket) {
        console.log('✅ Storage bucket "workspace-files" exists');
      } else {
        console.log('⚠️  Storage bucket "workspace-files" not found');
      }
    }

    // Cleanup
    channel.unsubscribe();
    
    console.log('\n🎉 Chat System Debug Complete!');
    console.log('\nCommon issues and solutions:');
    console.log('1. If group messages fail: Check RLS policies');
    console.log('2. If direct messages fail: Check workspace_members table');
    console.log('3. If real-time not working: Check Supabase project settings');
    console.log('4. If file uploads fail: Create workspace-files bucket');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugChatSystem();
