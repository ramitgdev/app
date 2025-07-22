import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code, state } = req.query;
  if (!code) {
    res.status(400).send('Missing code');
    return;
  }
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  const redirect_uri = `${req.headers.origin}/api/github-callback`;

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
      redirect_uri,
      state
    })
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    res.status(400).send(tokenData.error_description || 'OAuth error');
    return;
  }
  // Return a page that posts the token to the opener and closes itself
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html><body>
      <script>
        window.opener.postMessage({ type: 'github_token', token: '${tokenData.access_token}' }, window.opener.location.origin);
        window.close();
      </script>
      <p>Authenticated! You can close this window.</p>
    </body></html>
  `);
} 