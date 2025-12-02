// Check workspace_folders table schema
async function checkFolderSchema() {
  console.log('🔍 Checking workspace_folders table schema...');
  
  try {
    // Check if table exists by trying to query it
    const { data: folders, error } = await supabase
      .from('workspace_folders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing workspace_folders table:', error);
      console.log('💡 The table might not exist or have wrong permissions');
      return;
    }
    
    console.log('✅ workspace_folders table exists and is accessible');
    console.log('📁 Current folders in table:', folders?.length || 0);
    
    // Try to get table schema info
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'workspace_folders' });
    
    if (schemaError) {
      console.log('⚠️ Could not get schema info, but table exists');
    } else {
      console.log('📋 Table schema:', schemaInfo);
    }
    
    // Check if we can insert a test folder
    const testFolder = {
      id: 999999, // Use a high ID to avoid conflicts
      workspace_id: 'f572d26a-4d00-4026-82f9-b35e0a4c3644',
      name: 'test-folder-schema-check',
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('workspace_folders')
      .insert(testFolder);
    
    if (insertError) {
      console.error('❌ Cannot insert into workspace_folders:', insertError);
    } else {
      console.log('✅ Can insert into workspace_folders');
      
      // Clean up test folder
      await supabase
        .from('workspace_folders')
        .delete()
        .eq('id', 999999);
      
      console.log('🧹 Test folder cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkFolderSchema();
