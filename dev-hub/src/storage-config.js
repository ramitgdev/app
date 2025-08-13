// Storage Configuration for Dev Hub
// Configure your preferred storage provider here

export const STORAGE_CONFIG = {
  // Default provider - change this to your preferred option
  defaultProvider: 'supabase', // 'supabase', 'aws', 'google', 'local'
  
  // Provider-specific configurations
  providers: {
    supabase: {
      url: process.env.REACT_APP_SUPABASE_URL,
      anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      bucket: 'dev-hub-resources',
      // Enable RLS (Row Level Security) for user-specific access
      enableRLS: true,
      // Public bucket for shared resources
      publicBucket: 'dev-hub-public'
    },
    
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'dev-hub-resources',
      // Optional: CloudFront distribution for CDN
      cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL
    },
    
    google: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
      bucket: process.env.GOOGLE_CLOUD_BUCKET || 'dev-hub-resources',
      // Optional: CDN URL
      cdnUrl: process.env.GOOGLE_CLOUD_CDN_URL
    },
    
    local: {
      // Local storage using IndexedDB
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enableCompression: true,
      // Cleanup old files after X days
      cleanupAfterDays: 30
    }
  },
  
  // Global settings
  global: {
    // Maximum file size for uploads (in bytes)
    maxFileSize: 100 * 1024 * 1024, // 100MB
    
    // Allowed file types
    allowedTypes: [
      // Audio files
      'audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
      // Image files
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Video files
      'video/mp4', 'video/webm', 'video/ogg',
      // Document files
      'application/pdf', 'text/plain', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'application/xml',
      // Code files
      'application/javascript', 'text/x-python', 'text/x-java-source',
      'text/x-c++src', 'text/x-csrc', 'text/x-php', 'text/x-ruby',
      // Archive files
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ],
    
    // File organization
    organization: {
      // Group files by type
      groupByType: true,
      // Create user-specific folders
      userSpecificFolders: true,
      // Add timestamps to filenames
      addTimestamps: true
    },
    
    // Caching strategy
    caching: {
      // Cache downloaded files locally
      enableLocalCache: true,
      // Cache duration in milliseconds
      cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
      // Maximum cache size
      maxCacheSize: 500 * 1024 * 1024 // 500MB
    }
  }
};

// Environment variables template
export const ENV_TEMPLATE = `
# Storage Configuration Environment Variables

# Supabase (Recommended for your current setup)
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3 (Alternative option)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_CLOUDFRONT_URL=your-cloudfront-url (optional)

# Google Cloud Storage (Alternative option)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_CLIENT_EMAIL=your_service_account_email
GOOGLE_CLOUD_PRIVATE_KEY=your_private_key
GOOGLE_CLOUD_BUCKET=your-bucket-name
GOOGLE_CLOUD_CDN_URL=your-cdn-url (optional)
`;

// Setup instructions for each provider
export const SETUP_INSTRUCTIONS = {
  supabase: {
    title: 'Supabase Storage Setup',
    steps: [
      '1. Go to your Supabase project dashboard',
      '2. Navigate to Storage section',
      '3. Create a new bucket called "dev-hub-resources"',
      '4. Set bucket privacy to "Private" for user files',
      '5. Create another bucket called "dev-hub-public" for shared files',
      '6. Set public bucket privacy to "Public"',
      '7. Copy your project URL and anon key to environment variables',
      '8. Enable Row Level Security (RLS) for user-specific access'
    ],
    advantages: [
      '✅ Already integrated with your existing Supabase setup',
      '✅ Built-in authentication and RLS',
      '✅ Automatic CDN',
      '✅ Generous free tier',
      '✅ Easy to set up'
    ]
  },
  
  aws: {
    title: 'AWS S3 Setup',
    steps: [
      '1. Create an AWS account',
      '2. Create an S3 bucket',
      '3. Configure CORS for your bucket',
      '4. Create an IAM user with S3 permissions',
      '5. Generate access keys',
      '6. Set up CloudFront distribution (optional)',
      '7. Add environment variables'
    ],
    advantages: [
      '✅ Most popular and reliable',
      '✅ Excellent performance',
      '✅ Advanced features',
      '✅ Cost-effective for large scale'
    ]
  },
  
  google: {
    title: 'Google Cloud Storage Setup',
    steps: [
      '1. Create a Google Cloud project',
      '2. Enable Cloud Storage API',
      '3. Create a storage bucket',
      '4. Create a service account',
      '5. Download service account key',
      '6. Set up CORS configuration',
      '7. Add environment variables'
    ],
    advantages: [
      '✅ Integrates well with Google services',
      '✅ Good for your existing Google Drive integration',
      '✅ Competitive pricing',
      '✅ Global CDN'
    ]
  },
  
  local: {
    title: 'Local Storage Setup',
    steps: [
      '1. No setup required - works out of the box',
      '2. Uses browser IndexedDB for storage',
      '3. Files persist between sessions',
      '4. Limited by browser storage limits'
    ],
    advantages: [
      '✅ No external dependencies',
      '✅ Works offline',
      '✅ No setup required',
      '✅ Good for development/testing'
    ],
    limitations: [
      '❌ Limited storage space',
      '❌ Not shared across devices',
      '❌ Data lost if browser data is cleared'
    ]
  }
};

// Helper function to get current provider config
export function getCurrentProviderConfig() {
  const provider = STORAGE_CONFIG.defaultProvider;
  return {
    provider,
    config: STORAGE_CONFIG.providers[provider],
    instructions: SETUP_INSTRUCTIONS[provider]
  };
}

// Helper function to validate configuration
export function validateConfig() {
  const { provider, config } = getCurrentProviderConfig();
  const errors = [];
  
  switch (provider) {
    case 'supabase':
      if (!config.url) errors.push('Missing SUPABASE_URL');
      if (!config.anonKey) errors.push('Missing SUPABASE_ANON_KEY');
      break;
    case 'aws':
      if (!config.accessKeyId) errors.push('Missing AWS_ACCESS_KEY_ID');
      if (!config.secretAccessKey) errors.push('Missing AWS_SECRET_ACCESS_KEY');
      if (!config.bucket) errors.push('Missing AWS_S3_BUCKET');
      break;
    case 'google':
      if (!config.projectId) errors.push('Missing GOOGLE_CLOUD_PROJECT_ID');
      if (!config.clientEmail) errors.push('Missing GOOGLE_CLOUD_CLIENT_EMAIL');
      if (!config.privateKey) errors.push('Missing GOOGLE_CLOUD_PRIVATE_KEY');
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    provider
  };
}
