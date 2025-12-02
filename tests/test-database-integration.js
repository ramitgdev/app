// Test script to verify database integration
// Run this in the browser console after refreshing the app

async function testDatabaseIntegration() {
  console.log('🧪 Testing Database Integration...');
  
  try {
    // Test 1: Check if functions are available
    if (typeof loadWorkspaceData === 'function') {
      console.log('✅ loadWorkspaceData function is available');
    } else {
      console.log('❌ loadWorkspaceData function is not available');
      return;
    }
    
    if (typeof createWorkspaceFile === 'function') {
      console.log('✅ createWorkspaceFile function is available');
    } else {
      console.log('❌ createWorkspaceFile function is not available');
      return;
    }
    
    // Test 2: Check if we have a selected workspace
    if (window.selectedWksp && window.selectedWksp.id) {
      console.log('✅ Selected workspace found:', window.selectedWksp.name, 'ID:', window.selectedWksp.id);
      
      // Test 3: Try to load workspace data
      console.log('📥 Loading workspace data from database...');
      const result = await loadWorkspaceData(window.selectedWksp.id);
      
      if (result.success) {
        console.log('✅ Workspace data loaded successfully from database!');
        console.log('📁 Files found:', result.files.length);
        console.log('📂 Folders found:', result.folders.length);
        
        if (result.files.length > 0) {
          console.log('📄 Sample file:', result.files[0]);
        }
      } else {
        console.log('❌ Failed to load workspace data:', result.error);
      }
      
      // Test 4: Try to create a test file
      console.log('📝 Creating test file in database...');
      const testFileResult = await createWorkspaceFile(window.selectedWksp.id, {
        title: 'Test File - ' + new Date().toISOString(),
        notes: 'This is a test file created to verify database integration',
        folder: 0,
        folder_name: 'All Resources'
      });
      
      if (testFileResult.success) {
        console.log('✅ Test file created successfully in database!');
        console.log('📄 Created file:', testFileResult.file);
      } else {
        console.log('❌ Failed to create test file:', testFileResult.error);
      }
      
    } else {
      console.log('❌ No workspace selected. Please select a workspace first.');
      console.log('💡 Tip: Click on a workspace to select it, then run this test again.');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDatabaseIntegration();
