// Quick test to verify Groq API is working
import { llmIntegration } from './llm-integration.js';

// Test function to check if Groq API is working
export const testGroqAPI = async () => {
  console.log('🧪 Testing Groq API...');
  console.log('API Key present:', !!process.env.REACT_APP_GROQ_API_KEY);
  console.log('API Key starts with gsk_:', process.env.REACT_APP_GROQ_API_KEY?.startsWith('gsk_'));
  console.log('LLM configured:', llmIntegration.isConfigured);
  
  try {
    const response = await llmIntegration.chatWithAI('Say "Hello, Groq API is working!" and nothing else.');
    console.log('✅ Groq API Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Groq API Error:', error);
    return 'Error: ' + error.message;
  }
};

// Auto-test when loaded
if (typeof window !== 'undefined') {
  window.testGroqAPI = testGroqAPI;
  console.log('🔧 Groq API test function available as window.testGroqAPI()');
}