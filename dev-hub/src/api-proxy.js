// API Proxy for handling CORS issues with AI services
class APIProxy {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003';
  }

  async callClaude(prompt, apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/api/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey,
          model: 'claude-3-5-sonnet-20241022',
          maxTokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Claude API proxy error:', error);
      throw error;
    }
  }

  async callOpenAI(prompt, apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey,
          model: 'gpt-4',
          maxTokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('OpenAI API proxy error:', error);
      throw error;
    }
  }

  async callGroq(prompt, apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/api/groq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey,
          model: 'llama3-8b-8192',
          maxTokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Groq API proxy error:', error);
      throw error;
    }
  }
}

export default APIProxy;
