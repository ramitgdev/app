#!/usr/bin/env node

/**
 * Storage Setup Script for Dev Hub
 * This script helps you set up Supabase storage integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Dev Hub Storage Setup\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file found');
} else {
  console.log('❌ .env.local file not found');
  console.log('Creating .env.local file...\n');
}

// Function to ask for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupStorage() {
  console.log('📋 Supabase Configuration\n');
  
  const supabaseUrl = await askQuestion('Enter your Supabase URL (e.g., https://your-project.supabase.co): ');
  const supabaseAnonKey = await askQuestion('Enter your Supabase anon key: ');
  const supabaseServiceKey = await askQuestion('Enter your Supabase service role key (optional): ');
  
  // Create .env.local content
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
${supabaseServiceKey ? `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}` : ''}

# Storage Configuration
STORAGE_PROVIDER=supabase
STORAGE_BUCKET=dev-hub-resources

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

  // Write to .env.local
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env.local file created successfully!');

  // Next steps
  console.log('\n📝 Next Steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Storage section');
  console.log('3. Create a new bucket named "dev-hub-resources"');
  console.log('4. Set bucket privacy to "Private"');
  console.log('5. Start your development server: npm start');
  console.log('6. Test the storage integration using the StorageTest component');

  console.log('\n🔧 To test the integration:');
  console.log('1. Import StorageTest in your App.js');
  console.log('2. Add <StorageTest /> to your component tree');
  console.log('3. Try uploading a test file');

  rl.close();
}

// Run setup
setupStorage().catch(console.error); 