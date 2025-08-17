const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3003; // Use a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Claude API Proxy
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, apiKey, model, maxTokens } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    console.log('Claude API request:', { prompt: prompt.substring(0, 100) + '...', model, maxTokens });

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
    console.log('Claude API success:', data.content[0]?.text?.substring(0, 100) + '...');
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

    console.log('OpenAI API request:', { prompt: prompt.substring(0, 100) + '...', model, maxTokens });

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
    console.log('OpenAI API success:', data.choices[0]?.message?.content?.substring(0, 100) + '...');
    res.json({ response: data.choices[0]?.message?.content || 'No response from OpenAI' });
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Groq API Proxy
app.post('/api/groq', async (req, res) => {
  try {
    const { prompt, apiKey, model, maxTokens } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    console.log('Groq API request:', { prompt: prompt.substring(0, 100) + '...', model, maxTokens });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens || 1000,
        temperature: 0.3
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
    console.log('Groq API success:', data.choices[0]?.message?.content?.substring(0, 100) + '...');
    res.json({ response: data.choices[0]?.message?.content || 'No response from Groq' });
  } catch (error) {
    console.error('Groq proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Proxy Server running on port ${PORT}`);
  console.log(`📡 API Proxies available:`);
  console.log(`   - POST http://localhost:${PORT}/api/claude`);
  console.log(`   - POST http://localhost:${PORT}/api/openai`);
  console.log(`   - POST http://localhost:${PORT}/api/groq`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
});
