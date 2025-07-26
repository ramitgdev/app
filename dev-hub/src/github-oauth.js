// GitHub OAuth Configuration
// Replace these with your actual GitHub OAuth App credentials
export const GITHUB_CONFIG = {
  clientId: 'Ov23liJejZDWuCTiepRB',
  clientSecret: '07ac68a02bed63122c9a1084c71bf24848558f53',
  redirectUri: 'http://localhost:3001/github-callback.html',
  scope: 'repo'
};

// GitHub OAuth Helper Functions
export function initiateGitHubLogin() {
  const { clientId, redirectUri, scope } = GITHUB_CONFIG;
  const state = Math.random().toString(36).substring(2);
  
  // Store state for verification
  localStorage.setItem('github_oauth_state', state);
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  
  // Open GitHub OAuth in popup
  const popup = window.open(authUrl, 'github-oauth', 'width=600,height=700');
  
  return new Promise((resolve, reject) => {
    // Listen for the callback
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'github_oauth_success') {
        resolve(event.data.token);
      } else if (event.data.type === 'github_oauth_error') {
        reject(new Error(event.data.error));
      }
    });
  });
}

export function handleGitHubCallback(code, state) {
  const { clientId, clientSecret, redirectUri } = GITHUB_CONFIG;
  
  // Verify state
  const storedState = localStorage.getItem('github_oauth_state');
  if (state !== storedState) {
    throw new Error('OAuth state mismatch');
  }
  
  // Exchange code for token
  return fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    return data.access_token;
  });
} 