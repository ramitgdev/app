# OpenAI Integration Setup Guide

## Overview

The DevHub application now includes full OpenAI integration for AI-powered features like:
- **ChatGPT-like interface** for code assistance and project guidance
- **AI Code Review** with security, performance, and bug detection
- **Project idea generation** for hackathons
- **Flowchart generation** from project descriptions
- **Design document creation** from flowcharts
- **Code generation** from design documents
- **Test case generation** for code quality

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to the "API Keys" section
4. Click "Create new secret key"
5. Copy the generated API key (starts with `sk-`)

### 2. Configure the Environment

1. In the `dev-hub` directory, edit the `.env` file:
   ```bash
   # Replace the placeholder with your actual API key
   REACT_APP_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

2. **Important**: Replace `your_openai_api_key_here` with your actual API key

### 3. Restart the Application

After updating the `.env` file, restart your development server:
```bash
npm start
```

## Features Available

### ChatGPT Interface
- **Location**: AI Tools section in the sidebar
- **Features**: 
  - Natural language code assistance
  - Project planning guidance
  - Code generation and review
  - Technical problem solving

### AI Code Review
- **Location**: AI Tools section in the sidebar
- **Features**:
  - Security vulnerability detection
  - Performance issue identification
  - Bug detection and fixes
  - Code quality metrics
  - Custom review requests

### Hackathon Assistant
- **Location**: Development workspace tab
- **Features**:
  - Project idea generation
  - System flowchart creation
  - Design document generation
  - Presentation slide creation
  - Initial code structure generation

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Solution: Make sure you've added your API key to the `.env` file
   - Ensure the key starts with `sk-`

2. **"API call failed"**
   - Check your internet connection
   - Verify your API key is valid
   - Ensure you have sufficient OpenAI credits

3. **"Failed to parse JSON response"**
   - This is a fallback mechanism - the app will still work with mock responses
   - Check the browser console for detailed error messages

### Configuration Status

The app will show configuration status in the UI:
- ✅ **Configured**: Full AI features available
- ⚠️ **Not Configured**: Mock responses with limited functionality
- ❌ **Error**: Check your API key and network connection

## Security Notes

⚠️ **Important**: In a production environment, API keys should be handled server-side, not in the browser. This setup is for development and demonstration purposes.

## Cost Considerations

- OpenAI API calls are charged based on usage
- GPT-4 is more expensive than GPT-3.5
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set up billing alerts to avoid unexpected charges

## Advanced Configuration

### Customizing AI Behavior

You can modify the AI prompts in `src/llm-integration.js`:
- Adjust temperature for more/less creative responses
- Customize system prompts for specific use cases
- Add new AI features by extending the `LLMIntegration` class

### Environment Variables

Additional environment variables you can configure:
```bash
# Optional: Set a different OpenAI model
REACT_APP_OPENAI_MODEL=gpt-4

# Optional: Set maximum tokens for responses
REACT_APP_OPENAI_MAX_TOKENS=2000
```

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Ensure you have sufficient OpenAI credits
4. Check your network connection

## Mock Mode

If you don't want to use OpenAI or don't have an API key, the app will automatically fall back to mock responses, providing a realistic preview of AI features without making actual API calls. 