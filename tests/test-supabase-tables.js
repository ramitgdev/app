// Test script to check Supabase tables
// Run this in your browser console

async function testSupabaseTables() {
  console.log('Testing Supabase tables...');
  
  try {
    // Test workspace_files table
    const { data: files, error: filesError } = await supabase
      .from('workspace_files')
      .select('*')
      .limit(1);
    
    if (filesError) {
      console.error('❌ workspace_files table error:', filesError);
    } else {
      console.log('✅ workspace_files table exists and is accessible');
    }
    
    // Test workspace_folders table
    const { data: folders, error: foldersError } = await supabase
      .from('workspace_folders')
      .select('*')
      .limit(1);
    
    if (foldersError) {
      console.error('❌ workspace_folders table error:', foldersError);
    } else {
      console.log('✅ workspace_folders table exists and is accessible');
    }
    
    // Test inserting a sample record
    const testWorkspaceId = 'test-workspace-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('workspace_files')
      .insert([{
        workspace_id: testWorkspaceId,
        title: 'Test File',
        notes: 'This is a test file',
        platform: 'test',
        folder: 0,
        folder_name: 'All Resources',
        type: 'file'
      }])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test successful:', insertData);
      
      // Clean up test data
      await supabase
        .from('workspace_files')
        .delete()
        .eq('workspace_id', testWorkspaceId);
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSupabaseTables();
