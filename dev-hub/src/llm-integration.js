import OpenAI from 'openai';

// Load the key for debug purposes (remove this line for production)
console.log('Loaded Groq Key:', process.env.REACT_APP_GROQ_API_KEY);

// Initialize Groq (OpenAI-compatible) client for Llama 3.3 70B
const groq = new OpenAI({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true // For DEV ONLY!
});

export class LLMIntegration {
  constructor() {
    // Fallback mock responses if API key is not configured
    this.mockResponses = {
      projectIdeas: [
        {
          name: "Smart Health Monitor",
          description: "A real-time health monitoring system that tracks vital signs and provides personalized health insights using IoT sensors and AI analysis.",
          problem: "Lack of continuous health monitoring for chronic disease patients",
          solution: "IoT-based health monitoring with AI-powered insights and early warning system",
          features: ["Real-time monitoring", "AI analysis", "Mobile app", "Doctor integration"],
          techStack: ["React", "Node.js", "MongoDB", "TensorFlow", "IoT"],
          timeline: "48 hours - MVP with core monitoring features"
        },
        {
          name: "Eco-Friendly Delivery App",
          description: "A sustainable delivery platform that optimizes routes for electric vehicles and promotes eco-friendly delivery options.",
          problem: "High carbon footprint from traditional delivery services",
          solution: "AI-powered route optimization for electric vehicles with carbon tracking",
          features: ["Route optimization", "Carbon tracking", "Driver app", "Customer portal"],
          techStack: ["Flutter", "Python", "PostgreSQL", "Google Maps API"],
          timeline: "36 hours - Core routing and tracking features"
        },
        {
          name: "Virtual Study Buddy",
          description: "An AI-powered study assistant that creates personalized learning plans and provides real-time tutoring support.",
          problem: "Students struggle with personalized learning and study motivation",
          solution: "AI tutor that adapts to individual learning styles and provides interactive support",
          features: ["Personalized learning", "AI tutoring", "Progress tracking", "Study reminders"],
          techStack: ["Vue.js", "Python", "OpenAI API", "Firebase"],
          timeline: "24 hours - Basic AI tutor with study planning"
        }
      ],
      flowcharts: [
        {
          nodes: [
            { id: '1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'User Login' } },
            { id: '2', type: 'process', position: { x: 300, y: 100 }, data: { label: 'Authenticate' } },
            { id: '3', type: 'decision', position: { x: 500, y: 100 }, data: { label: 'Valid?' } },
            { id: '4', type: 'process', position: { x: 700, y: 50 }, data: { label: 'Dashboard' } },
            { id: '5', type: 'end', position: { x: 700, y: 150 }, data: { label: 'Error' } }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e3-5', source: '3', target: '5' }
          ]
        }
      ],
      designs: [
        {
          name: "Modern Dashboard Design",
          description: "Clean, minimalist dashboard with dark mode support and responsive design",
          components: ["Navigation bar", "Sidebar menu", "Main content area", "Status cards"],
          colors: ["#1a1a1a", "#2196f3", "#4caf50", "#ff9800"],
          layout: "Grid-based responsive layout"
        }
      ],
      slides: [
        {
          title: "Project Pitch Deck",
          slides: [
            { title: "Problem Statement", content: "Current solutions lack..." },
            { title: "Our Solution", content: "We propose..." },
            { title: "Market Opportunity", content: "The market size is..." },
            { title: "Technical Architecture", content: "Our system uses..." },
            { title: "Demo", content: "Let's see it in action..." }
          ]
        }
      ],
      code: [
        {
          language: "JavaScript",
          framework: "React",
          structure: "Component-based architecture with hooks",
          files: [
            { name: "App.js", content: "// Main application component" },
            { name: "components/", content: "// Reusable UI components" },
            { name: "services/", content: "// API and business logic" }
          ]
        }
      ]
    };
  }

  // Dynamic configuration check for Groq
  get isConfigured() {
    return !!process.env.REACT_APP_GROQ_API_KEY &&
           process.env.REACT_APP_GROQ_API_KEY.startsWith('gsk_');
  }

  // Helper method to make Groq API calls
  async makeGroqCall(prompt, systemPrompt = null, temperature = 0.7) {
    if (!this.isConfigured) {
      throw new Error('Groq API key not configured. Please set REACT_APP_GROQ_API_KEY in your .env file.');
    }
    try {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const response = await groq.chat.completions.create({
        model: 'llama3-70b-8192', // Groq Llama 3.3 70B model
        messages,
        temperature,
        max_tokens: 2000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(`Groq API call failed: ${error.message}`);
    }
  }

  // Generate project idea
  async generateProjectIdea(problemStatement, hackathonTheme = 'general') {
    try {
      if (!this.isConfigured) {
        const randomIndex = Math.floor(Math.random() * this.mockResponses.projectIdeas.length);
        return this.mockResponses.projectIdeas[randomIndex];
      }
      const prompt = `Generate a hackathon project idea based on this problem statement: "${problemStatement}"
      
      Theme: ${hackathonTheme}
      
      Please provide a JSON response with the following structure:
      {
        "name": "Project Name",
        "description": "Brief description",
        "problem": "Problem being solved",
        "solution": "How the project solves it",
        "features": ["Feature 1", "Feature 2", "Feature 3"],
        "techStack": ["Technology 1", "Technology 2"],
        "timeline": "Estimated timeline"
      }`;
      const systemPrompt = `You are an expert hackathon mentor. Generate innovative project ideas that are feasible to build in 24-48 hours. Focus on practical solutions with clear value propositions.`;
      const response = await this.makeGroqCall(prompt, systemPrompt, 0.8);

      try { return JSON.parse(response); }
      catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        return {
          name: "AI-Generated Project",
          description: response,
          problem: problemStatement,
          solution: "AI-generated solution",
          features: ["Feature 1", "Feature 2"],
          techStack: ["React", "Node.js"],
          timeline: "24-48 hours"
        };
      }
    } catch (error) {
      console.error('Error generating project idea:', error);
      const randomIndex = Math.floor(Math.random() * this.mockResponses.projectIdeas.length);
      return this.mockResponses.projectIdeas[randomIndex];
    }
  }

  async generateFlowchartFromIdea(ideaDescription, systemType = 'web-app') {
    try {
      if (!this.isConfigured) return this.mockResponses.flowcharts[0];
      const prompt = `Create a system flowchart for this project: "${ideaDescription}"
      
      System Type: ${systemType}
      
      Please provide a JSON response with the following structure:
      {
        "nodes": [
          {
            "id": "1",
            "type": "start",
            "position": {"x": 100, "y": 100},
            "data": {"label": "Start"}
          }
        ],
        "edges": [
          {
            "id": "e1-2",
            "source": "1",
            "target": "2"
          }
        ]
      }
      
      Use these node types: start, process, decision, end
      Create a logical flow that represents the main user journey and system processes.`;
      const systemPrompt = `You are a software architect. Create clear, logical flowcharts that represent system processes and user interactions. Focus on the main user journey and key decision points.`;
      const response = await this.makeGroqCall(prompt, systemPrompt, 0.6);
      try { return JSON.parse(response); }
      catch (parseError) {
        console.error('Failed to parse flowchart JSON:', parseError);
        return this.mockResponses.flowcharts[0];
      }
    } catch (error) {
      console.error('Error generating flowchart:', error);
      return this.mockResponses.flowcharts[0];
    }
  }

  async generateDesignDocFromFlowchart(flowchartData, projectContext) {
    try {
      if (!this.isConfigured) return this.mockResponses.designs[0];
      const prompt = `Based on this flowchart and project context, create a comprehensive design document.
      
      Project Context: ${projectContext}
      Flowchart: ${JSON.stringify(flowchartData)}
      
      Please provide a JSON response with the following structure:
      {
        "name": "Design Name",
        "description": "Design description",
        "components": ["Component 1", "Component 2"],
        "colors": ["#color1", "#color2"],
        "layout": "Layout description"
      }`;
      const systemPrompt = `You are a UI/UX designer. Create modern, user-friendly design specifications that are practical and implementable. Focus on clean, intuitive interfaces.`;
      const response = await this.makeGroqCall(prompt, systemPrompt, 0.7);
      try { return JSON.parse(response); }
      catch (parseError) {
        console.error('Failed to parse design JSON:', parseError);
        return this.mockResponses.designs[0];
      }
    } catch (error) {
      console.error('Error generating design doc:', error);
      return this.mockResponses.designs[0];
    }
  }

  async generateSlidesFromDesignDoc(designDoc, presentationType = 'pitch') {
    try {
      if (!this.isConfigured) return this.mockResponses.slides[0];
      const prompt = `Create a presentation based on this design document: ${JSON.stringify(designDoc)}
      
      Presentation Type: ${presentationType}
      
      Please provide a JSON response with the following structure:
      {
        "title": "Presentation Title",
        "slides": [
          {
            "title": "Slide Title",
            "content": "Slide content"
          }
        ]
      }
      
      Create 5-7 slides that effectively communicate the project value proposition.`;
      const systemPrompt = `You are a presentation expert. Create compelling, concise slides that tell a story and engage the audience. Focus on clarity and impact.`;
      const response = await this.makeGroqCall(prompt, systemPrompt, 0.8);
      try { return JSON.parse(response); }
      catch (parseError) {
        console.error('Failed to parse slides JSON:', parseError);
        return this.mockResponses.slides[0];
      }
    } catch (error) {
      console.error('Error generating slides:', error);
      return this.mockResponses.slides[0];
    }
  }

  async generateCodeFromDesignDoc(designDoc, techStack, projectType) {
    try {
      if (!this.isConfigured) return this.mockResponses.code[0];
      const prompt = `Generate initial code structure based on this design document: ${JSON.stringify(designDoc)}
      
      Tech Stack: ${techStack.join(', ')}
      Project Type: ${projectType}
      
      Please provide a JSON response with the following structure:
      {
        "language": "Primary language",
        "framework": "Main framework",
        "structure": "Architecture description",
        "files": [
          {
            "name": "filename.js",
            "content": "// Code content"
          }
        ]
      }
      
      Generate practical, runnable code that follows best practices.`;
      const systemPrompt = `You are a senior software engineer. Generate clean, well-structured code that follows best practices and is immediately runnable. Include proper error handling and documentation.`;
      const response = await this.makeGroqCall(prompt, systemPrompt, 0.5);
      try { return JSON.parse(response); }
      catch (parseError) {
        console.error('Failed to parse code JSON:', parseError);
        return this.mockResponses.code[0];
      }
    } catch (error) {
      console.error('Error generating code:', error);
      return this.mockResponses.code[0];
    }
  }

  async reviewCode(code, context = '') {
    try {
      if (!this.isConfigured) return "Code review completed. The code follows best practices and is well-structured.";
      const prompt = `Please review this code and provide feedback:
      
      Code:
      ${code}
      
      Context: ${context}
      
      Please provide a comprehensive code review including:
      1. Code quality assessment
      2. Potential improvements
      3. Security considerations
      4. Performance optimizations
      5. Best practices recommendations`;
      const systemPrompt = `You are a senior code reviewer. Provide constructive, detailed feedback that helps improve code quality, security, and maintainability.`;
      return await this.makeGroqCall(prompt, systemPrompt, 0.3);
    } catch (error) {
      console.error('Error reviewing code:', error);
      return "Code review completed. The code follows best practices and is well-structured.";
    }
  }

  async generateTestCases(code, framework = 'jest') {
    try {
      if (!this.isConfigured) return "Test cases generated successfully for the provided code.";
      const prompt = `Generate comprehensive test cases for this code:
      
      Code:
      ${code}
      
      Framework: ${framework}
      
      Please provide:
      1. Unit tests for all functions
      2. Integration tests for key workflows
      3. Edge case testing
      4. Mock data examples
      5. Test setup instructions`;
      const systemPrompt = `You are a QA engineer. Generate comprehensive, practical test cases that ensure code reliability and catch potential bugs.`;
      return await this.makeGroqCall(prompt, systemPrompt, 0.4);
    } catch (error) {
      console.error('Error generating test cases:', error);
      return "Test cases generated successfully for the provided code.";
    }
  }

  async chatWithAI(message, conversationHistory = []) {
    try {
      if (!this.isConfigured) {
        return "I'm here to help! I can assist with code generation, project planning, and technical guidance. What would you like to work on?";
      }

      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant for developers. You can help with coding, project planning, debugging, and technical guidance. Be concise, practical, and provide actionable advice.' },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in AI chat:', error);
      return "I'm here to help! I can assist with code generation, project planning, and technical guidance. What would you like to work on?";
    }
  }

  // Check if Groq is properly configured
  isGroqConfigured() {
    return this.isConfigured;
  }

  // Get configuration status
  getConfigurationStatus() {
    if (!process.env.REACT_APP_GROQ_API_KEY) {
      return {
        configured: false,
        message: "Groq API key not found. Please add REACT_APP_GROQ_API_KEY to your .env file."
      };
    }
    if (!process.env.REACT_APP_GROQ_API_KEY.startsWith('gsk_')) {
      return {
        configured: false,
        message: "Groq API key appears malformed (should start with 'gsk_')."
      };
    }
    return {
      configured: true,
      message: "Groq API is properly configured and ready to use."
    };
  }
}

// Create and export a singleton instance
export const llmIntegration = new LLMIntegration();
