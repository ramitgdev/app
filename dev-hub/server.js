const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Claude API Proxy
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, apiKey, model, maxTokens } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens || 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Claude API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.json({ response: data.content[0]?.text || 'No response from Claude' });
  } catch (error) {
    console.error('Claude proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// OpenAI API Proxy
app.post('/api/openai', async (req, res) => {
  try {
    const { prompt, apiKey, model, maxTokens } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens || 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `OpenAI API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.json({ response: data.choices[0]?.message?.content || 'No response from OpenAI' });
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Groq API Proxy
app.post('/api/groq', async (req, res) => {
  try {
    const { prompt, apiKey, model, maxTokens, systemPrompt, temperature } = req.body;
    
    console.log('Groq API request received:');
    console.log('System Prompt:', systemPrompt);
    console.log('User Prompt:', prompt);
    console.log('Model:', model);
    console.log('Max Tokens:', maxTokens);
    console.log('Temperature:', temperature);
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Build messages array with system prompt if provided
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    console.log('Messages being sent to Groq:', messages);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'llama3-8b-8192',
        messages: messages,
        max_tokens: maxTokens || 1000,
        temperature: temperature || 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Groq API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Groq API response:', data.choices[0]?.message?.content);
    res.json({ response: data.choices[0]?.message?.content || 'No response from Groq' });
  } catch (error) {
    console.error('Groq proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve React app - only in production
if (process.env.NODE_ENV === 'production') {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Proxies available:`);
  console.log(`   - POST /api/claude`);
  console.log(`   - POST /api/openai`);
  console.log(`   - POST /api/groq`);
}); 