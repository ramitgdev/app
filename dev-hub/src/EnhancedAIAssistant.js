import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, IconButton, Paper, List, ListItem, ListItemText,
  ListItemIcon, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  CircularProgress, Accordion, AccordionSummary, AccordionDetails, Divider,
  Tooltip, Badge, Snackbar, LinearProgress, Card, CardContent, CardActions
} from '@mui/material';
import {
  Send as SendIcon, Create as CreateIcon, Folder as FolderIcon, 
  InsertDriveFile as FileIcon, Code as CodeIcon, Build as BuildIcon,
  PlayArrow as PlayIcon, Save as SaveIcon, Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon, Add as AddIcon, Edit as EditIcon,
  ContentCopy as CopyIcon, CheckCircle as CheckIcon, Error as ErrorIcon,
  Lightbulb as LightbulbIcon, Architecture as ArchitectureIcon,
  Storage as StorageIcon, Web as WebIcon, Mobile as MobileIcon
} from '@mui/icons-material';
import { llmIntegration } from './llm-integration';
import { initiateGitHubLogin } from './github-oauth';
import { GitHubAPI, sanitizeRepoName, convertFilesToGitHubFormat, validateGitHubToken } from './github-utils';

export default function EnhancedAIAssistant({ 
  onClose, 
  workspaceId, 
  folders, 
  resources, 
  addFoldersAndResources,
  addChildFolder,
  renameFolder,
  deleteFolder,
  removeResource,
  editResource,
  activeFolder,
  setActiveFolder,
  setResources
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileCreator, setShowFileCreator] = useState(false);
  const [fileCreatorData, setFileCreatorData] = useState({
    fileName: '',
    fileType: 'js',
    content: '',
    folder: activeFolder
  });
  const [showProjectGenerator, setShowProjectGenerator] = useState(false);
  const [projectData, setProjectData] = useState({
    projectName: '',
    projectType: 'web-app',
    techStack: [],
    description: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // GitHub integration state
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token'));
  const [githubUser, setGithubUser] = useState(null);
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [githubRepoName, setGithubRepoName] = useState('');
  const [githubRepoDescription, setGithubRepoDescription] = useState('');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [lastCreatedFiles, setLastCreatedFiles] = useState([]);

  // GitHub token validation and user info
  useEffect(() => {
    if (githubToken) {
      validateAndSetUser();
    }
  }, [githubToken]);

  const validateAndSetUser = async () => {
    if (!githubToken) return;
    
    try {
      const isValid = await validateGitHubToken(githubToken);
      if (isValid) {
        const api = new GitHubAPI(githubToken);
        const userInfo = await api.getUserInfo();
        setGithubUser(userInfo);
      } else {
        setGithubToken(null);
        setGithubUser(null);
        localStorage.removeItem('github_token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setGithubToken(null);
      setGithubUser(null);
      localStorage.removeItem('github_token');
    }
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `🚀 **Enhanced AI Assistant Ready!**

I can help you with:

📁 **File Management**
- Create files and folders
- Generate project structures
- Organize your workspace

💻 **Code Generation**
- Write complete applications
- Generate boilerplate code
- Create components and utilities

🏗️ **Project Architecture**
- Design system architecture
- Plan folder structures
- Suggest best practices

🎯 **Smart Suggestions**
- Analyze your workspace
- Suggest improvements
- Recommend next steps

What would you like to work on today?`,
      timestamp: new Date(),
      type: 'welcome'
    };
    setMessages([welcomeMessage]);
  }, []);

  // Generate workspace analysis and suggestions
  useEffect(() => {
    if (folders.length > 0 || resources.length > 0) {
      generateWorkspaceSuggestions();
    }
  }, [folders, resources]);

  const generateWorkspaceSuggestions = async () => {
    try {
      const context = `Current workspace structure:
Folders: ${folders.map(f => f.text).join(', ')}
Files: ${resources.map(r => r.title).join(', ')}
Active folder: ${folders.find(f => f.id === activeFolder)?.text || 'Root'}`;

      const response = await llmIntegration.chatWithAI(
        `Analyze this workspace and provide 3-5 specific suggestions for improvement or next steps. Focus on practical, actionable advice. ${context}`,
        []
      );

      const suggestionItems = response.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).slice(0, 5);
      setSuggestions(suggestionItems.map((item, index) => ({
        id: index,
        text: item.replace(/^[-•]\s*/, '').trim(),
        type: 'suggestion'
      })));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Analyze the user's intent
      const intent = analyzeUserIntent(currentInput);
      
      if (intent.type === 'create_file') {
        handleFileCreation(intent);
      } else if (intent.type === 'create_multiple_files') {
        handleMultipleFileCreation(intent);
      } else if (intent.type === 'create_project') {
        handleProjectCreation(intent);
      } else if (intent.type === 'workspace_analysis') {
        handleWorkspaceAnalysis(currentInput);
      } else {
        // General AI response
        const response = await llmIntegration.chatWithAI(
          `User is working in a development workspace. Current context: ${getWorkspaceContext()}. User message: ${currentInput}`,
          messages.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        );

        // Check if the response contains file structure suggestions
        if (response.includes('file explorer') || response.includes('File Explorer') || 
            response.includes('new file') || response.includes('created') ||
            response.includes('MainActivity.java') || response.includes('StepTracker.swift') ||
            response.includes('jsx') || response.includes('js') || response.includes('json') ||
            response.includes('package.json') || response.includes('app.js') ||
            response.includes('components/') || response.includes('screens/') || response.includes('utils/') ||
            response.includes('StepTracker') || response.includes('GoalSetter') || response.includes('Dashboard')) {
          
          // Automatically trigger file creation
          const fileCreationIntent = {
            type: 'create_multiple_files',
            content: response
          };
          handleMultipleFileCreation(fileCreationIntent);
          
          const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response + '\n\n🔄 **Processing file creation...**',
            timestamp: new Date(),
            actions: generateActionsFromResponse(response, currentInput)
          };
          setMessages(prev => [...prev, assistantMessage]);
        } else {
          const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            actions: generateActionsFromResponse(response, currentInput)
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeUserIntent = (input) => {
    const lowerInput = input.toLowerCase();
    
    // File creation patterns
    if (lowerInput.includes('create file') || lowerInput.includes('make file') || lowerInput.includes('new file')) {
      return { type: 'create_file', fileName: extractFileName(input) };
    }
    
    // Multiple file creation patterns
    if (lowerInput.includes('make these files') || lowerInput.includes('create these files') || 
        lowerInput.includes('add these files') || lowerInput.includes('generate these files')) {
      return { type: 'create_multiple_files', content: input };
    }
    
    // Project creation patterns
    if (lowerInput.includes('create project') || lowerInput.includes('new project') || lowerInput.includes('start project')) {
      return { type: 'create_project', projectName: extractProjectName(input) };
    }
    
    // Workspace analysis patterns
    if (lowerInput.includes('analyze') || lowerInput.includes('suggest') || lowerInput.includes('improve')) {
      return { type: 'workspace_analysis' };
    }
    
    return { type: 'general' };
  };

  const extractFileName = (input) => {
    const match = input.match(/(?:create|make|new)\s+(?:file\s+)?([a-zA-Z0-9._-]+)/i);
    return match ? match[1] : '';
  };

  const extractProjectName = (input) => {
    const match = input.match(/(?:create|make|new)\s+(?:project\s+)?([a-zA-Z0-9._-]+)/i);
    return match ? match[1] : '';
  };

  const getWorkspaceContext = () => {
    return `Workspace has ${folders.length} folders and ${resources.length} files. Active folder: ${folders.find(f => f.id === activeFolder)?.text || 'Root'}`;
  };

  const handleFileCreation = async (intent) => {
    if (intent.fileName) {
      setFileCreatorData(prev => ({ ...prev, fileName: intent.fileName }));
    }
    setShowFileCreator(true);
  };

  const handleProjectCreation = async (intent) => {
    if (intent.projectName) {
      setProjectData(prev => ({ ...prev, projectName: intent.projectName }));
    }
    setShowProjectGenerator(true);
  };

  const handleWorkspaceAnalysis = async (input) => {
    const context = getWorkspaceContext();
    const response = await llmIntegration.chatWithAI(
      `Analyze this workspace and provide specific, actionable suggestions. ${context}. User request: ${input}`,
      []
    );

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      type: 'analysis'
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const generateActionsFromResponse = (response, userInput) => {
    const actions = [];
    const lowerResponse = response.toLowerCase();
    const lowerInput = userInput.toLowerCase();

    // Detect file creation suggestions
    if (lowerResponse.includes('file explorer') || 
        lowerResponse.includes('created') || 
        lowerResponse.includes('new file') ||
        lowerResponse.includes('jsx') || 
        lowerResponse.includes('js') ||
        lowerResponse.includes('json') ||
        lowerResponse.includes('package.json') ||
        lowerResponse.includes('app.js') ||
        lowerResponse.includes('step tracker') ||
        lowerResponse.includes('footstep') ||
        lowerResponse.includes('components/') ||
        lowerResponse.includes('screens/') ||
        lowerResponse.includes('utils/')) {
      actions.push({
        label: '🔄 Create Files from Response',
        icon: <CreateIcon />,
        action: () => {
          const fileCreationIntent = {
            type: 'create_multiple_files',
            content: response
          };
          handleMultipleFileCreation(fileCreationIntent);
        }
      });
    }

    // Detect code generation
    if (lowerResponse.includes('```') || lowerInput.includes('code') || lowerInput.includes('generate')) {
      actions.push({
        label: 'Create Code File',
        icon: <CodeIcon />,
        action: () => setShowFileCreator(true)
      });
    }

    // Detect project structure
    if (lowerResponse.includes('project') || lowerResponse.includes('structure') || lowerResponse.includes('folder')) {
      actions.push({
        label: 'Generate Project Structure',
        icon: <ArchitectureIcon />,
        action: () => setShowProjectGenerator(true)
      });
    }

    return actions;
  };

  const handleMultipleFileCreation = async (intent) => {
    try {
      setIsLoading(true);
      
      // Ask AI to parse the file structure and create files
      const prompt = `Extract file names from this text and create appropriate, unique content for each file:

${intent.content}

IMPORTANT: Create DIFFERENT content for each file based on its name and purpose.

Return ONLY this JSON format:
{"files":[
  {"name":"app.js","content":"// Main application file\nconsole.log('App started');"},
  {"name":"styles.css","content":"/* Main styles */\nbody { margin: 0; }"},
  {"name":"package.json","content":"{\n  \"name\": \"my-app\",\n  \"version\": \"1.0.0\"\n}"}
]}

Generate unique, appropriate content for each file type. No other text, just the JSON.`;

      const response = await llmIntegration.chatWithAI(prompt, []);
      
      try {
        console.log('AI Response:', response);
        
        // Extract files manually using regex - more reliable than JSON.parse with multiline content
        const filePattern = /{"name":"([^"]+)","content":"((?:[^"\\]|\\.)*)"/g;
        const extractedFiles = [];
        let match;
        
        while ((match = filePattern.exec(response)) !== null) {
          const fileName = match[1];
          let content = match[2];
          
          // Unescape the content
          content = content
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
          
          extractedFiles.push({
            name: fileName,
            content: content
          });
        }
        
        console.log('Extracted files:', extractedFiles);
        
        if (extractedFiles.length > 0) {
          const structure = { files: extractedFiles };
          console.log('Parsed structure:', structure);
          console.log('Files to create:', structure.files);
          
          // Create a project folder for the files
          const projectName = intent.content.split('\n')[0].substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Generated Project';
          const folderName = `${projectName} ${new Date().toLocaleDateString()}`;
          const projectFolderId = Date.now() + Math.random();
          
          const projectFolder = {
            id: projectFolderId,
            text: folderName,
            parent: activeFolder,
            droppable: true
          };

          // Create files and assign them to the project folder
          const newFiles = structure.files.map(file => ({
            id: Date.now() + Math.random() + Math.random(),
            title: file.name,
            url: `file://${file.name}`,
            tags: [file.name.split('.').pop() || 'file'],
            notes: file.content,
            platform: 'local',
            folder: projectFolderId // Assign to project folder
          }));
          
          // Create folders if needed
          const newFolders = [projectFolder];
          if (structure.folders) {
            structure.folders.forEach(folder => {
              newFolders.push({
                id: Date.now() + Math.random(),
                text: folder.name,
                parent: folder.parent || projectFolderId, // Make subfolders under project folder
                droppable: true
              });
            });
          }
          
          // Add to workspace
          if (newFolders.length > 0) {
            addFoldersAndResources(newFolders, []);
          }
          if (newFiles.length > 0) {
            setResources(prev => [...prev, ...newFiles]);
          }
          
          // Store files for potential GitHub push
          setLastCreatedFiles(newFiles);
          
          setSnackbar({ open: true, message: `Created ${newFiles.length} files in folder "${folderName}" successfully`, severity: 'success' });
          
          // Add success message with GitHub push option
          const successMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `✅ Created ${newFiles.length} files in folder "${folderName}"!

Files created:
${newFiles.map(f => `- ${f.title}`).join('\n')}

📤 **Push to GitHub** - Upload these files to a new GitHub repository`,
            timestamp: new Date(),
            type: 'files_created',
            actions: [
              {
                type: 'github_push',
                label: '📤 Push to GitHub',
                files: newFiles,
                action: pushFilesToGitHub
              }
            ]
          };
          setMessages(prev => [...prev, successMessage]);
        } else {
          console.log('No files extracted from AI response');
          throw new Error('No files found in AI response');
        }
      } catch (parseError) {
        console.error('Failed to parse file structure:', parseError);
        console.log('AI Response:', response);
        
        // Fallback: create files based on the original content
        const filesToCreate = [];
        
        // Extract file names from the AI response
        const fileMatches = intent.content.match(/([a-zA-Z0-9._-]+\.(js|jsx|ts|tsx|json|html|css|py|java))/g);
        if (fileMatches) {
          // Generate content using AI for each file individually
          for (const fileName of fileMatches) {
            const extension = fileName.split('.').pop().toLowerCase();
            let content = '';
            
            // Generate specific content based on the design document context and file name
            const fileNameLower = fileName.toLowerCase();
            
            if (fileNameLower.includes('leaderboard')) {
              if (extension === 'java') {
                content = `// ${fileName}\n// Leaderboard Activity for StepTracker App\n\nimport android.app.Activity;\nimport android.os.Bundle;\nimport android.widget.ListView;\n\npublic class LeaderboardActivity extends Activity {\n    private ListView leaderboardList;\n    \n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        setContentView(R.layout.activity_leaderboard);\n        \n        leaderboardList = findViewById(R.id.leaderboard_list);\n        loadLeaderboardData();\n    }\n    \n    private void loadLeaderboardData() {\n        // Load and display leaderboard rankings\n        // TODO: Implement leaderboard data loading\n    }\n}`;
              } else {
                content = `// ${fileName}\n// Leaderboard component for StepTracker App\n\nclass Leaderboard {\n  constructor() {\n    this.rankings = [];\n  }\n  \n  loadRankings() {\n    // Load user rankings based on step count\n    console.log('Loading leaderboard rankings...');\n  }\n  \n  displayRankings() {\n    // Display user rankings\n    return this.rankings;\n  }\n}\n\nexport default Leaderboard;`;
              }
            } else if (fileNameLower.includes('goal')) {
              if (extension === 'java') {
                content = `// ${fileName}\n// Goal Setting Activity for StepTracker App\n\nimport android.app.Activity;\nimport android.os.Bundle;\nimport android.widget.EditText;\nimport android.widget.Button;\n\npublic class GoalSettingActivity extends Activity {\n    private EditText goalInput;\n    private Button saveButton;\n    \n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        setContentView(R.layout.activity_goal_setting);\n        \n        goalInput = findViewById(R.id.goal_input);\n        saveButton = findViewById(R.id.save_button);\n        \n        saveButton.setOnClickListener(v -> saveGoal());\n    }\n    \n    private void saveGoal() {\n        String goal = goalInput.getText().toString();\n        // Save daily step goal\n        // TODO: Implement goal saving logic\n    }\n}`;
              } else {
                content = `// ${fileName}\n// Goal Setting component for StepTracker App\n\nclass GoalSetting {\n  constructor() {\n    this.dailyGoal = 10000; // Default goal\n  }\n  \n  setGoal(steps) {\n    this.dailyGoal = parseInt(steps);\n    this.saveGoal();\n  }\n  \n  saveGoal() {\n    localStorage.setItem('dailyStepGoal', this.dailyGoal);\n    console.log('Goal saved:', this.dailyGoal);\n  }\n  \n  getGoal() {\n    return this.dailyGoal;\n  }\n}\n\nexport default GoalSetting;`;
              }
            } else if (fileNameLower.includes('schema') || fileNameLower.includes('database')) {
              content = `// ${fileName}\n// Database Schema for StepTracker App\n\nconst userSchema = {\n  userId: 'String',\n  email: 'String',\n  dailyStepGoal: 'Number',\n  createdAt: 'Date'\n};\n\nconst stepRecordSchema = {\n  userId: 'String',\n  date: 'Date',\n  stepCount: 'Number',\n  distance: 'Number',\n  calories: 'Number'\n};\n\nconst leaderboardSchema = {\n  userId: 'String',\n  rank: 'Number',\n  stepCount: 'Number',\n  date: 'Date'\n};\n\nmodule.exports = {\n  userSchema,\n  stepRecordSchema,\n  leaderboardSchema\n};`;
            } else if (fileNameLower.includes('dashboard') || fileNameLower.includes('main')) {
              content = `// ${fileName}\n// Main Dashboard for StepTracker App\n\nclass Dashboard {\n  constructor() {\n    this.currentSteps = 0;\n    this.dailyGoal = 10000;\n    this.stepHistory = [];\n  }\n  \n  updateStepCount(steps) {\n    this.currentSteps = steps;\n    this.updateProgress();\n  }\n  \n  updateProgress() {\n    const progress = (this.currentSteps / this.dailyGoal) * 100;\n    console.log('Progress:', Math.min(progress, 100) + '%');\n  }\n  \n  getStepData() {\n    return {\n      current: this.currentSteps,\n      goal: this.dailyGoal,\n      progress: (this.currentSteps / this.dailyGoal) * 100\n    };\n  }\n}\n\nexport default Dashboard;`;
            } else {
              // Generic content based on file type
              switch(extension) {
                case 'js':
                case 'jsx':
                  content = `// ${fileName}\n// Generated for StepTracker App\n\nfunction main() {\n  console.log('${fileName} loaded for StepTracker');\n}\n\nmain();`;
                  break;
                case 'java':
                  content = `// ${fileName}\n// Java class for StepTracker App\n\npublic class ${fileName.replace('.java', '')} {\n    public ${fileName.replace('.java', '')}() {\n        // Constructor\n    }\n    \n    public void initialize() {\n        // Initialize component\n        System.out.println("${fileName} initialized");\n    }\n}`;
                  break;
                case 'css':
                  content = `/* ${fileName} */\n/* Styles for StepTracker App */\n\n.step-tracker {\n  font-family: Arial, sans-serif;\n  color: #333;\n}\n\n.dashboard {\n  padding: 20px;\n  text-align: center;\n}\n\n.step-count {\n  font-size: 2em;\n  color: #4CAF50;\n  font-weight: bold;\n}`;
                  break;
                case 'html':
                  content = `<!DOCTYPE html>\n<html>\n<head>\n  <title>StepTracker - ${fileName}</title>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body>\n  <div class="step-tracker">\n    <h1>StepTracker</h1>\n    <div class="dashboard">\n      <p>Track your daily steps and reach your goals!</p>\n    </div>\n  </div>\n</body>\n</html>`;
                  break;
                case 'json':
                  content = `{\n  "name": "step-tracker-app",\n  "version": "1.0.0",\n  "description": "Mobile app for tracking daily steps and fitness goals",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js",\n    "test": "jest"\n  },\n  "dependencies": {\n    "express": "^4.18.0",\n    "mongoose": "^6.0.0"\n  }\n}`;
                  break;
                default:
                  content = `// ${fileName}\n// Generated for StepTracker App\n\n// TODO: Implement ${fileName} functionality`;
              }
            }
            
            filesToCreate.push({
              id: Date.now() + Math.random(),
              title: fileName,
              url: `file://${fileName}`,
              tags: [extension],
              notes: content,
              platform: 'local',
              folder: activeFolder
            });
          }
        }
        
         if (filesToCreate.length > 0) {
           // Create a project folder for fallback files too
           const projectName = intent.content.split('\n')[0].substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Generated Project';
           const folderName = `${projectName} ${new Date().toLocaleDateString()}`;
           const projectFolderId = Date.now() + Math.random();
           
           const projectFolder = {
             id: projectFolderId,
             text: folderName,
             parent: activeFolder,
             droppable: true
           };

           // Update files to be in the project folder
           filesToCreate.forEach(file => {
             file.folder = projectFolderId;
           });

           // Add folder first, then files
           addFoldersAndResources([projectFolder], []);
           setResources(prev => [...prev, ...filesToCreate]);
           
           // Store files for GitHub push
           setLastCreatedFiles(filesToCreate);
           
           setSnackbar({ open: true, message: `Created ${filesToCreate.length} files in folder "${folderName}" using fallback method`, severity: 'success' });
          
          const successMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `✅ Created ${filesToCreate.length} files in folder "${folderName}"!

Files created:
${filesToCreate.map(f => `- ${f.title}`).join('\n')}

📤 **Push to GitHub** - Upload these files to a new GitHub repository`,
            timestamp: new Date(),
            type: 'files_created',
            actions: [
              {
                type: 'github_push',
                label: '📤 Push to GitHub',
                files: filesToCreate,
                action: pushFilesToGitHub
              }
            ]
          };
          setMessages(prev => [...prev, successMessage]);
        } else {
          setSnackbar({ open: true, message: 'Failed to create files. Please try again.', severity: 'error' });
        }
      }
    } catch (error) {
      console.error('Error creating multiple files:', error);
      setSnackbar({ open: true, message: 'Error creating files', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const createFile = async () => {
    if (!fileCreatorData.fileName) {
      setSnackbar({ open: true, message: 'Please enter a file name', severity: 'error' });
      return;
    }

    try {
      // Generate content if not provided
      let content = fileCreatorData.content;
      if (!content) {
        content = await generateFileContent(fileCreatorData.fileName, fileCreatorData.fileType);
      }

      // Create the file resource
      const newFile = {
        id: Date.now() + Math.random(),
        title: fileCreatorData.fileName,
        url: `file://${fileCreatorData.fileName}`,
        tags: [fileCreatorData.fileType],
        notes: content,
        platform: 'local',
        folder: fileCreatorData.folder
      };

      // Add to resources
      const newResources = [...resources, newFile];
      setResources(newResources);

      setSnackbar({ open: true, message: `Created ${fileCreatorData.fileName}`, severity: 'success' });
      setShowFileCreator(false);
      setFileCreatorData({ fileName: '', fileType: 'js', content: '', folder: activeFolder });

      // Add success message
      const successMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `✅ Created file: **${fileCreatorData.fileName}**

The file has been added to your workspace. You can now edit it or use it in your project.`,
        timestamp: new Date(),
        type: 'file_created'
      };
      setMessages(prev => [...prev, successMessage]);

    } catch (error) {
      console.error('Error creating file:', error);
      setSnackbar({ open: true, message: 'Error creating file', severity: 'error' });
    }
  };

  const generateFileContent = async (fileName, fileType) => {
    const prompt = `Generate appropriate content for a file named "${fileName}" with type "${fileType}". 
    Create practical, runnable code or content that follows best practices.`;
    
    try {
      return await llmIntegration.chatWithAI(prompt, []);
    } catch (error) {
      console.error('Error generating file content:', error);
      return `// ${fileName}\n// Generated by AI Assistant\n\n// TODO: Add your code here`;
    }
  };

  const generateProjectStructure = async () => {
    if (!projectData.projectName) {
      setSnackbar({ open: true, message: 'Please enter a project name', severity: 'error' });
      return;
    }

    try {
      setIsLoading(true);

      // Generate project structure using AI
      const structurePrompt = `Generate a complete project structure for "${projectData.projectName}" with type "${projectData.projectType}".
      Include all necessary files, folders, and basic content. Provide a JSON response with this exact structure:
      {
        "folders": [
          {"id": "folder1", "text": "src", "parent": "root"},
          {"id": "folder2", "text": "components", "parent": "folder1"}
        ],
        "files": [
          {"id": "file1", "title": "package.json", "content": "content here", "folder": "root"},
          {"id": "file2", "title": "App.js", "content": "content here", "folder": "folder1"}
        ]
      }`;
      
      const response = await llmIntegration.chatWithAI(structurePrompt, []);
      
      try {
        // Try to parse JSON response
        const structure = JSON.parse(response);
        
        if (structure.folders && structure.files) {
          // Create folders
          const newFolders = structure.folders.map(folder => ({
            id: folder.id,
            text: folder.text,
            parent: folder.parent === 'root' ? activeFolder : folder.parent,
            droppable: true
          }));
          
          // Create files
          const newFiles = structure.files.map(file => ({
            id: file.id,
            title: file.title,
            url: `file://${file.title}`,
            tags: [file.title.split('.').pop() || 'file'],
            notes: file.content,
            platform: 'local',
            folder: file.folder === 'root' ? activeFolder : file.folder
          }));
          
          // Add to workspace
          if (newFolders.length > 0) {
            addFoldersAndResources(newFolders, []);
          }
          if (newFiles.length > 0) {
            setResources(prev => [...prev, ...newFiles]);
          }
          
          setSnackbar({ open: true, message: `Generated project structure for ${projectData.projectName}`, severity: 'success' });
          setShowProjectGenerator(false);
          setProjectData({ projectName: '', projectType: 'web-app', techStack: [], description: '' });
          
          // Add success message
          const successMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `✅ Generated project structure for **${projectData.projectName}**
            
Created ${newFolders.length} folders and ${newFiles.length} files in your workspace.`,
            timestamp: new Date(),
            type: 'project_created'
          };
          setMessages(prev => [...prev, successMessage]);
        }
      } catch (parseError) {
        console.error('Failed to parse project structure:', parseError);
        // Fallback: create a basic project structure
        const basicFolders = [
          { id: 'src', text: 'src', parent: activeFolder, droppable: true },
          { id: 'public', text: 'public', parent: activeFolder, droppable: true }
        ];
        
        const basicFiles = [
          {
            id: 'package.json',
            title: 'package.json',
            url: 'file://package.json',
            tags: ['json'],
            notes: `{
  "name": "${projectData.projectName}",
  "version": "1.0.0",
  "description": "${projectData.description}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}`,
            platform: 'local',
            folder: activeFolder
          },
          {
            id: 'index.js',
            title: 'index.js',
            url: 'file://index.js',
            tags: ['js'],
            notes: `// ${projectData.projectName}
// Generated by AI Assistant

console.log('Hello, ${projectData.projectName}!');`,
            platform: 'local',
            folder: activeFolder
          }
        ];
        
        if (basicFolders.length > 0) {
          addFoldersAndResources(basicFolders, []);
        }
        if (basicFiles.length > 0) {
          setResources(prev => [...prev, ...basicFiles]);
        }
        setSnackbar({ open: true, message: `Created basic project structure for ${projectData.projectName}`, severity: 'success' });
      }

    } catch (error) {
      console.error('Error generating project structure:', error);
      setSnackbar({ open: true, message: 'Error generating project structure', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub integration functions
  const handleGitHubLogin = async () => {
    try {
      setIsGithubLoading(true);
      const token = await initiateGitHubLogin();

      const api = new GitHubAPI(token);
      const userInfo = await api.getUserInfo();

      setGithubToken(token);
      setGithubUser(userInfo);
      localStorage.setItem('github_token', token);

      setSnackbar({ open: true, message: `GitHub connected successfully as @${userInfo.login}!`, severity: 'success' });
    } catch (error) {
      console.error('GitHub login error:', error);
      setSnackbar({ open: true, message: 'GitHub login failed', severity: 'error' });
      setGithubToken(null);
      setGithubUser(null);
      localStorage.removeItem('github_token');
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleGitHubLogout = () => {
    setGithubToken(null);
    setGithubUser(null);
    localStorage.removeItem('github_token');
    setSnackbar({ open: true, message: 'Disconnected from GitHub', severity: 'info' });
  };

  const pushFilesToGitHub = async () => {
    console.log('Push to GitHub clicked. Token:', !!githubToken, 'User:', !!githubUser, 'Files:', lastCreatedFiles.length);

    if (!githubToken || !githubUser) {
      console.error('GitHub not connected. Token:', !!githubToken, 'User:', githubUser);
      setSnackbar({
        open: true,
        message: `Please connect to GitHub first. Token: ${!!githubToken}, User: ${!!githubUser}`,
        severity: 'error'
      });
      return;
    }

    if (lastCreatedFiles.length === 0) {
      setSnackbar({ open: true, message: 'No files to push. Create some files first!', severity: 'error' });
      return;
    }

    console.log('Opening GitHub dialog...');
    setShowGithubDialog(true);
  };

  const createGitHubRepository = async () => {
    if (!githubRepoName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a repository name', severity: 'error' });
      return;
    }

    try {
      setIsGithubLoading(true);
      const api = new GitHubAPI(githubToken);

      // Create repository
      const repoData = await api.createRepository(
        sanitizeRepoName(githubRepoName),
        githubRepoDescription,
        isPrivateRepo
      );

      console.log('Repository created:', repoData);

      // Convert files to GitHub format
      const githubFiles = convertFilesToGitHubFormat(lastCreatedFiles);

      // Push files to the repository
      await api.pushMultipleFiles(
        githubUser.login,
        repoData.name,
        githubFiles,
        `Initial commit: Added ${githubFiles.length} files`
      );

      setSnackbar({
        open: true,
        message: `Successfully created repository "${repoData.name}" and pushed ${githubFiles.length} files!`,
        severity: 'success'
      });

      // Add success message
      const successMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `🎉 **Repository Created Successfully!**

📦 **Repository**: [${repoData.name}](${repoData.html_url})
📁 **Files pushed**: ${githubFiles.length}
🔗 **URL**: ${repoData.html_url}

Your files have been successfully uploaded to GitHub!`,
        timestamp: new Date(),
        type: 'github_success'
      };
      setMessages(prev => [...prev, successMessage]);

      // Reset dialog
      setShowGithubDialog(false);
      setGithubRepoName('');
      setGithubRepoDescription('');
      setIsPrivateRepo(false);

    } catch (error) {
      console.error('GitHub repository creation failed:', error);
      setSnackbar({
        open: true,
        message: `Failed to create repository: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsGithubLoading(false);
    }
  };

  const renderMessage = (message) => {
    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        <Paper
          sx={{
            maxWidth: '85%',
            p: 2,
            backgroundColor: message.role === 'user' ? 'primary.main' : 'background.paper',
            color: message.role === 'user' ? 'white' : 'text.primary',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
          
          {message.actions && message.actions.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {message.actions.map((action, index) => (
                <Button
                  key={index}
                  size="small"
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={action.action}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
          
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'white',
      display: 'flex'
    }}>
      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon />
            <Typography variant="h6" fontWeight={600}>
              Enhanced AI Assistant
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* GitHub Status Indicator */}
            {githubUser ? (
              <Tooltip title={`Connected as @${githubUser.login}`}>
                <Chip
                  label={`@${githubUser.login}`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                  onClick={handleGitHubLogout}
                />
              </Tooltip>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={handleGitHubLogin}
                disabled={isGithubLoading}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                {isGithubLoading ? <CircularProgress size={16} color="inherit" /> : 'GitHub'}
              </Button>
            )}
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {messages.map(renderMessage)}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <CircularProgress size={20} />
              </Paper>
            </Box>
          )}
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            ⚡ Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CreateIcon />}
              onClick={() => setShowFileCreator(true)}
            >
              Create File
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<BuildIcon />}
              onClick={() => setShowProjectGenerator(true)}
            >
              New Project
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FolderIcon />}
              onClick={() => addChildFolder(activeFolder)}
            >
              New Folder
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<CreateIcon />}
              onClick={() => {
                // Get the last AI message and create files from it
                const lastAIMessage = messages.filter(m => m.role === 'assistant').pop();
                if (lastAIMessage) {
                  const fileCreationIntent = {
                    type: 'create_multiple_files',
                    content: lastAIMessage.content
                  };
                  handleMultipleFileCreation(fileCreationIntent);
                }
              }}
            >
              📁 Create Files from Last Response
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<CreateIcon />}
              onClick={() => {
                // Test: Create multiple files with different content
                const testFiles = [
                  {
                    id: Date.now() + Math.random(),
                    title: 'main.js',
                    url: 'file://main.js',
                    tags: ['js'],
                    notes: '// Main application file\nconsole.log("Main app started");\n\nfunction initApp() {\n  return "App initialized";\n}',
                    platform: 'local',
                    folder: activeFolder
                  },
                  {
                    id: Date.now() + Math.random() + 1,
                    title: 'utils.js',
                    url: 'file://utils.js',
                    tags: ['js'],
                    notes: '// Utility functions\nexport function formatDate(date) {\n  return date.toLocaleDateString();\n}\n\nexport function randomId() {\n  return Math.random().toString(36).substr(2, 9);\n}',
                    platform: 'local',
                    folder: activeFolder
                  },
                  {
                    id: Date.now() + Math.random() + 2,
                    title: 'style.css',
                    url: 'file://style.css',
                    tags: ['css'],
                    notes: '/* Main stylesheet */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}',
                    platform: 'local',
                    folder: activeFolder
                  }
                ];
                setResources(prev => [...prev, ...testFiles]);
                setSnackbar({ open: true, message: 'Created 3 test files with different content', severity: 'success' });
              }}
            >
              🧪 Test Multiple Files
            </Button>
          </Box>
        </Box>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              💡 Suggestions
            </Typography>
            <List dense>
              {suggestions.map((suggestion) => (
                <ListItem key={suggestion.id} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LightbulbIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={suggestion.text}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Input Area */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me to create files, generate projects, or analyze your workspace..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              color="primary"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* File Creator Dialog */}
      <Dialog open={showFileCreator} onClose={() => setShowFileCreator(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="File Name"
              value={fileCreatorData.fileName}
              onChange={(e) => setFileCreatorData(prev => ({ ...prev, fileName: e.target.value }))}
              placeholder="e.g., App.js, index.html, styles.css"
            />
            <TextField
              select
              label="File Type"
              value={fileCreatorData.fileType}
              onChange={(e) => setFileCreatorData(prev => ({ ...prev, fileType: e.target.value }))}
              SelectProps={{ native: true }}
            >
              <option value="js">JavaScript (.js)</option>
              <option value="ts">TypeScript (.ts)</option>
              <option value="jsx">React JSX (.jsx)</option>
              <option value="tsx">React TSX (.tsx)</option>
              <option value="html">HTML (.html)</option>
              <option value="css">CSS (.css)</option>
              <option value="json">JSON (.json)</option>
              <option value="md">Markdown (.md)</option>
              <option value="py">Python (.py)</option>
              <option value="java">Java (.java)</option>
            </TextField>
            <TextField
              label="Content (optional - AI will generate if empty)"
              multiline
              rows={8}
              value={fileCreatorData.content}
              onChange={(e) => setFileCreatorData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Leave empty for AI-generated content..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileCreator(false)}>Cancel</Button>
          <Button onClick={createFile} variant="contained" startIcon={<CreateIcon />}>
            Create File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Generator Dialog */}
      <Dialog open={showProjectGenerator} onClose={() => setShowProjectGenerator(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Project Structure</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Project Name"
              value={projectData.projectName}
              onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="e.g., my-react-app, todo-api, portfolio-site"
            />
            <TextField
              select
              label="Project Type"
              value={projectData.projectType}
              onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value }))}
              SelectProps={{ native: true }}
            >
              <option value="web-app">Web Application</option>
              <option value="react-app">React Application</option>
              <option value="node-api">Node.js API</option>
              <option value="python-app">Python Application</option>
              <option value="mobile-app">Mobile Application</option>
              <option value="desktop-app">Desktop Application</option>
            </TextField>
            <TextField
              label="Description"
              multiline
              rows={3}
              value={projectData.description}
              onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProjectGenerator(false)}>Cancel</Button>
          <Button 
            onClick={generateProjectStructure} 
            variant="contained" 
            startIcon={<BuildIcon />}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GitHub Repository Creation Dialog */}
      <Dialog open={showGithubDialog} onClose={() => setShowGithubDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📤 Push to GitHub Repository
          {githubUser && (
            <Typography variant="body2" color="textSecondary">
              Logged in as @{githubUser.login}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Repository Name"
              value={githubRepoName}
              onChange={(e) => setGithubRepoName(e.target.value)}
              placeholder="my-awesome-project"
              fullWidth
            />
            <TextField
              label="Description (optional)"
              value={githubRepoDescription}
              onChange={(e) => setGithubRepoDescription(e.target.value)}
              placeholder="Generated by Enhanced AI Assistant"
              multiline
              rows={2}
              fullWidth
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                checked={isPrivateRepo}
                onChange={(e) => setIsPrivateRepo(e.target.checked)}
              />
              <Typography variant="body2">Make repository private</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              This will create a new repository and push {lastCreatedFiles.length} files to it.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGithubDialog(false)}>Cancel</Button>
          <Button
            onClick={createGitHubRepository}
            variant="contained"
            disabled={isGithubLoading || !githubRepoName.trim()}
            startIcon={isGithubLoading ? <CircularProgress size={16} /> : null}
          >
            {isGithubLoading ? 'Creating...' : 'Create & Push'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 