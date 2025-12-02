// Debug script to check database operations
// Run this in the browser console

async function debugWorkspaceFiles() {
  console.log('🔍 Debugging Workspace Files...');
  
  try {
    // Check if we have a selected workspace
    if (!window.selectedWksp || !window.selectedWksp.id) {
      console.log('❌ No workspace selected');
      return;
    }
    
    console.log('📋 Current workspace:', window.selectedWksp.name, 'ID:', window.selectedWksp.id);
    console.log('📁 Current resources in state:', window.resources?.length || 0);
    console.log('📁 Current selectedWksp.resources:', window.selectedWksp.resources?.length || 0);
    
    // Test database connection
    console.log('🔌 Testing database connection...');
    const result = await loadWorkspaceData(window.selectedWksp.id);
    
    if (result.success) {
      console.log('✅ Database connection successful');
      console.log('📄 Files in database:', result.files.length);
      console.log('📂 Folders in database:', result.folders.length);
      
      if (result.files.length > 0) {
        console.log('📄 Sample file from database:', result.files[0]);
      }
    } else {
      console.log('❌ Database connection failed:', result.error);
    }
    
    // Test file creation
    console.log('📝 Testing file creation...');
    const testFileResult = await createWorkspaceFile(window.selectedWksp.id, {
      title: 'Debug Test File - ' + Date.now(),
      notes: 'This is a debug test file',
      folder: 0,
      folder_name: 'All Resources'
    });
    
    if (testFileResult.success) {
      console.log('✅ Test file created successfully');
      console.log('📄 Created file:', testFileResult.file);
      
      // Reload workspace data to see if it appears
      console.log('🔄 Reloading workspace data...');
      const reloadResult = await loadWorkspaceData(window.selectedWksp.id);
      if (reloadResult.success) {
        console.log('✅ Reload successful, files found:', reloadResult.files.length);
        const newFile = reloadResult.files.find(f => f.title.includes('Debug Test File'));
        if (newFile) {
          console.log('✅ New file found in reload:', newFile);
        } else {
          console.log('❌ New file not found in reload');
        }
      }
    } else {
      console.log('❌ Test file creation failed:', testFileResult.error);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugWorkspaceFiles();
