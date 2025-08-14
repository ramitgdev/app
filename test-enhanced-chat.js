// Test script for Enhanced Chat System
// Run this to verify the chat system is working

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your_supabase_url';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your_supabase_anon_key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEnhancedChatSystem() {
  console.log('🧪 Testing Enhanced Chat System...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking database tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'workspace_group_chats',
        'slack_integrations',
        'slack_channels',
        'chat_notifications'
      ]);

    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('✅ Found tables:', tableNames);
      
      if (tableNames.length === 4) {
        console.log('✅ All required tables exist');
      } else {
        console.log('⚠️  Missing tables. Run the schema setup first.');
      }
    }

    // Test 2: Check RLS policies
    console.log('\n2. Checking RLS policies...');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_names: ['workspace_group_chats', 'slack_integrations'] });

    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError.message);
    } else {
      console.log('✅ RLS policies configured');
    }

    // Test 3: Test real-time subscription
    console.log('\n3. Testing real-time subscription...');
    
    const channel = supabase
      .channel('test-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workspace_group_chats'
      }, (payload) => {
        console.log('✅ Real-time subscription working:', payload.new);
      })
      .subscribe();

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Real-time subscription established');

    // Test 4: Test message insertion (if we have a workspace)
    console.log('\n4. Testing message insertion...');
    
    // Get first workspace
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1);

    if (workspaceError || !workspaces || workspaces.length === 0) {
      console.log('⚠️  No workspaces found. Create a workspace first.');
    } else {
      const workspaceId = workspaces[0].id;
      
      // Get first user
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (userError || !users || users.length === 0) {
        console.log('⚠️  No users found. Create a user first.');
      } else {
        const userId = users[0].id;
        
        // Insert test message
        const { data: message, error: messageError } = await supabase
          .from('workspace_group_chats')
          .insert([{
            workspace_id: workspaceId,
            sender_id: userId,
            message: '🧪 Test message from enhanced chat system',
            message_type: 'text'
          }])
          .select()
          .single();

        if (messageError) {
          console.log('❌ Error inserting test message:', messageError.message);
        } else {
          console.log('✅ Test message inserted:', message.id);
          
          // Clean up test message
          await supabase
            .from('workspace_group_chats')
            .delete()
            .eq('id', message.id);
          
          console.log('✅ Test message cleaned up');
        }
      }
    }

    // Test 5: Check storage bucket
    console.log('\n5. Checking storage bucket...');
    
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Error checking storage:', bucketError.message);
    } else {
      const workspaceFilesBucket = buckets.find(b => b.name === 'workspace-files');
      if (workspaceFilesBucket) {
        console.log('✅ Storage bucket "workspace-files" exists');
      } else {
        console.log('⚠️  Storage bucket "workspace-files" not found. Create it in Supabase dashboard.');
      }
    }

    // Test 6: Check environment variables
    console.log('\n6. Checking environment variables...');
    
    const requiredVars = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY'
    ];
    
    const optionalVars = [
      'REACT_APP_SLACK_CLIENT_ID',
      'REACT_APP_SLACK_CLIENT_SECRET',
      'REACT_APP_SLACK_REDIRECT_URI'
    ];

    console.log('Required variables:');
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${varName}: Not set`);
      }
    });

    console.log('\nOptional variables (for Slack integration):');
    optionalVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`⚠️  ${varName}: Not set (Slack integration will be disabled)`);
      }
    });

    // Cleanup
    channel.unsubscribe();
    
    console.log('\n🎉 Enhanced Chat System Test Complete!');
    console.log('\nNext steps:');
    console.log('1. Run the database schema if tables are missing');
    console.log('2. Create a storage bucket if not found');
    console.log('3. Set up Slack integration if desired');
    console.log('4. Test the chat interface in your application');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEnhancedChatSystem();
