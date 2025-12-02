// Test script to verify Slack integration setup
// Run this after setting up your environment variables

require('dotenv').config({ path: './dev-hub/.env' });

function testSlackSetup() {
  console.log('🧪 Testing Slack Integration Setup...\n');

  // Check required environment variables
  const requiredVars = {
    'REACT_APP_SLACK_CLIENT_ID': process.env.REACT_APP_SLACK_CLIENT_ID,
    'REACT_APP_SLACK_CLIENT_SECRET': process.env.REACT_APP_SLACK_CLIENT_SECRET,
    'REACT_APP_SLACK_REDIRECT_URI': process.env.REACT_APP_SLACK_REDIRECT_URI
  };

  console.log('1. Checking Environment Variables:');
  
  let allSet = true;
  Object.entries(requiredVars).forEach(([varName, value]) => {
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: Not set`);
      allSet = false;
    }
  });

  if (!allSet) {
    console.log('\n❌ Some environment variables are missing!');
    console.log('Please check SLACK_ENV_SETUP.md for instructions.');
    return;
  }

  // Validate Client ID format
  console.log('\n2. Validating Client ID format:');
  const clientId = process.env.REACT_APP_SLACK_CLIENT_ID;
  if (clientId && clientId.startsWith('xoxb-')) {
    console.log('✅ Client ID format looks correct');
  } else {
    console.log('⚠️  Client ID should start with "xoxb-"');
  }

  // Validate redirect URI
  console.log('\n3. Validating Redirect URI:');
  const redirectUri = process.env.REACT_APP_SLACK_REDIRECT_URI;
  if (redirectUri === 'http://localhost:3000/slack-callback') {
    console.log('✅ Redirect URI is correct for development');
  } else {
    console.log('⚠️  Redirect URI should be: http://localhost:3000/slack-callback');
  }

  // Test OAuth URL generation
  console.log('\n4. Testing OAuth URL generation:');
  try {
    const scope = 'chat:write,channels:read,channels:history,users:read,files:read';
    const state = btoa(JSON.stringify({ workspaceId: 'test', timestamp: Date.now() }));
    
    const authUrl = `https://slack.com/api/oauth.v2.authorize?` +
      `client_id=${clientId}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${encodeURIComponent(state)}`;

    console.log('✅ OAuth URL can be generated');
    console.log('   URL length:', authUrl.length, 'characters');
  } catch (error) {
    console.log('❌ Error generating OAuth URL:', error.message);
  }

  console.log('\n🎉 Slack Integration Setup Test Complete!');
  console.log('\nNext steps:');
  console.log('1. Start your development server');
  console.log('2. Go to your workspace chat');
  console.log('3. Click "Connect to Slack" in the chat panel');
  console.log('4. Test the OAuth flow');
}

// Run the test
testSlackSetup();
