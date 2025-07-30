// Mock LLM Integration for development
// This provides realistic responses without requiring API keys

export class LLMIntegration {
  constructor() {
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

  // Generate project idea
  async generateProjectIdea(problemStatement, hackathonTheme = 'general') {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a random project idea
      const randomIndex = Math.floor(Math.random() * this.mockResponses.projectIdeas.length);
      return this.mockResponses.projectIdeas[randomIndex];
    } catch (error) {
      console.error('Error generating project idea:', error);
      throw new Error('Failed to generate project idea');
    }
  }

  // Generate flowchart from idea
  async generateFlowchartFromIdea(ideaDescription, systemType = 'web-app') {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      return this.mockResponses.flowcharts[0];
    } catch (error) {
      console.error('Error generating flowchart:', error);
      throw new Error('Failed to generate flowchart');
    }
  }

  // Generate design document
  async generateDesignDocFromFlowchart(flowchartData, projectContext) {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      return this.mockResponses.designs[0];
    } catch (error) {
      console.error('Error generating design doc:', error);
      throw new Error('Failed to generate design document');
    }
  }

  // Generate slides
  async generateSlidesFromDesignDoc(designDoc, presentationType = 'pitch') {
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      return this.mockResponses.slides[0];
    } catch (error) {
      console.error('Error generating slides:', error);
      throw new Error('Failed to generate slides');
    }
  }

  // Generate code
  async generateCodeFromDesignDoc(designDoc, techStack, projectType) {
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      return this.mockResponses.code[0];
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Failed to generate code');
    }
  }

  // Review code
  async reviewCode(code, context = '') {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return "Code review completed. The code follows best practices and is well-structured.";
    } catch (error) {
      console.error('Error reviewing code:', error);
      throw new Error('Failed to review code');
    }
  }

  // Generate test cases
  async generateTestCases(code, framework = 'jest') {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      return "Test cases generated successfully for the provided code.";
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw new Error('Failed to generate test cases');
    }
  }
}

// Create and export a singleton instance
export const llmIntegration = new LLMIntegration(); 