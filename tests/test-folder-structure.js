// Test folder structure preservation
async function testFolderStructure() {
  const workspaceId = 'f572d26a-4d00-4026-82f9-b35e0a4c3644';
  
  console.log('🧪 Testing folder structure preservation...');
  
  try {
    // Load folders and files from Supabase
    const [folders, files] = await Promise.all([
      supabaseWorkspaceStorage.loadFolders(workspaceId),
      supabaseWorkspaceStorage.loadWorkspaceFiles(workspaceId)
    ]);
    
    console.log('📁 Folders loaded:', folders.length);
    console.log('📄 Files loaded:', files.length);
    
    // Show folder structure
    console.log('📁 Folder structure:');
    folders.forEach(folder => {
      const indent = folder.parent === 0 ? '' : '  ';
      console.log(`${indent}📁 ${folder.text} (ID: ${folder.id}, Parent: ${folder.parent})`);
    });
    
    // Show file locations
    console.log('📄 File locations:');
    files.forEach(file => {
      const folder = folders.find(f => f.id === file.folder);
      const folderName = folder ? folder.text : 'All Resources';
      console.log(`  📄 ${file.title} → ${folderName} (Folder ID: ${file.folder})`);
    });
    
    // Check for orphaned files (files with non-existent folder IDs)
    const orphanedFiles = files.filter(file => {
      if (file.folder === 0) return false; // Root folder is always valid
      return !folders.find(f => f.id === file.folder);
    });
    
    if (orphanedFiles.length > 0) {
      console.log('⚠️ Orphaned files (files with non-existent folder IDs):');
      orphanedFiles.forEach(file => {
        console.log(`  📄 ${file.title} (Folder ID: ${file.folder})`);
      });
    } else {
      console.log('✅ No orphaned files found');
    }
    
    // Check raw database data
    console.log('🔍 Checking raw database data...');
    
    const { data: rawFolders } = await supabase
      .from('workspace_folders')
      .select('*')
      .eq('workspace_id', workspaceId);
    
    const { data: rawFiles } = await supabase
      .from('workspace_files')
      .select('*')
      .eq('workspace_id', workspaceId);
    
    console.log('📁 Raw folders in DB:', rawFolders?.length || 0);
    console.log('📄 Raw files in DB:', rawFiles?.length || 0);
    
    if (rawFolders) {
      console.log('📁 Raw folder data:');
      rawFolders.forEach(folder => {
        console.log(`  📁 ${folder.name} (ID: ${folder.id}, Parent: ${folder.parent_id})`);
      });
    }
    
    if (rawFiles) {
      console.log('📄 Raw file data:');
      rawFiles.forEach(file => {
        console.log(`  📄 ${file.title} (Folder: ${file.folder}, Folder ID: ${file.folder_id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFolderStructure();
