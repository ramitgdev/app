// Test Claude API Integration
import { RealAICopilotService } from './RealAICopilotIntegration';

async function testClaudeIntegration() {
  console.log('🧪 Testing Claude API Integration...');
  
  try {
    // Create a new service instance
    const service = new RealAICopilotService();
    
    // Initialize the service
    const initResult = await service.initialize();
    console.log('✅ Initialization result:', initResult);
    
    if (!initResult.success) {
      console.log('❌ Service initialization failed');
      return;
    }
    
    // Set provider to Claude
    service.updateSettings({ aiProvider: 'claude' });
    
    // Test code generation
    console.log('🧪 Testing code generation...');
    const testPrompt = 'Create a simple JavaScript function that calculates the factorial of a number';
    const generatedCode = await service.generateCode(testPrompt, 'javascript', {});
    
    if (generatedCode) {
      console.log('✅ Code generation successful!');
      console.log('Generated code:', generatedCode);
    } else {
      console.log('❌ Code generation failed');
    }
    
    // Test code explanation
    console.log('🧪 Testing code explanation...');
    const testCode = `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`;
    const explanation = await service.explainCode(testCode, 'javascript', {});
    
    if (explanation) {
      console.log('✅ Code explanation successful!');
      console.log('Explanation:', explanation);
    } else {
      console.log('❌ Code explanation failed');
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Make function globally available for browser console testing
window.testClaudeIntegration = testClaudeIntegration;

console.log('🚀 Claude test function available at window.testClaudeIntegration()');

