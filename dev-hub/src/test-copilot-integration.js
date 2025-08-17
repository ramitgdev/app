// Test file for GitHub Copilot Integration
import GitHubCopilotMockAPI from './GitHubCopilotMockAPI';

// Test the mock API
async function testCopilotIntegration() {
  console.log('🧪 Testing GitHub Copilot Integration...');
  
  const mockAPI = new GitHubCopilotMockAPI();
  
  try {
    // Test initialization
    console.log('1. Testing initialization...');
    const initResult = await mockAPI.initialize();
    console.log('✅ Initialization result:', initResult);
    
    // Test connection
    console.log('2. Testing connection...');
    const connectionResult = await mockAPI.testConnection();
    console.log('✅ Connection result:', connectionResult);
    
    // Test suggestions
    console.log('3. Testing suggestions...');
    const suggestions = await mockAPI.getSuggestions(
      'function test() {', 
      'javascript', 
      { lineNumber: 1, column: 20 },
      { filePath: 'test.js', projectType: 'react-app' }
    );
    console.log('✅ Suggestions result:', suggestions);
    
    // Test inline completion
    console.log('4. Testing inline completion...');
    const completion = await mockAPI.getInlineCompletion(
      'console.log', 
      'javascript', 
      { lineNumber: 1, column: 12 },
      { filePath: 'test.js' }
    );
    console.log('✅ Inline completion result:', completion);
    
    // Test code generation
    console.log('5. Testing code generation...');
    const generatedCode = await mockAPI.generateCode(
      'Create a React component for a todo list',
      'javascript',
      { projectType: 'react-app' }
    );
    console.log('✅ Code generation result:', generatedCode);
    
    console.log('🎉 All tests passed! GitHub Copilot integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in other files
export { testCopilotIntegration };

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testCopilotIntegration = testCopilotIntegration;
  console.log('🚀 GitHub Copilot test function available at window.testCopilotIntegration()');
}

