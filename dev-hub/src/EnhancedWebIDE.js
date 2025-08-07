import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, IconButton, Button, Drawer, 
  TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Divider, Chip, Alert, CircularProgress,
  List, ListItem, ListItemText, ListItemIcon, Tooltip,
  Collapse, Badge, Menu, MenuList, MenuItem as MenuItemComponent
} from '@mui/material';
import { llmIntegration } from './llm-integration';
import { testGroqAPI } from './test-groq';
import MonacoEditor from '@monaco-editor/react';

// Icons
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import OptimizeIcon from '@mui/icons-material/Tune';
import ExplainIcon from '@mui/icons-material/Help';
import RefactorIcon from '@mui/icons-material/Transform';
import DocumentIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpeedIcon from '@mui/icons-material/Speed';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const EnhancedWebIDE = ({ selectedFile, onFileChange, sidebarCollapsed = false }) => {
  const defaultCode = `// Welcome to the Enhanced AI-Powered Web IDE!
// Click the green "Run" button to execute this code and see the output below!

console.log("🚀 Enhanced AI IDE is working!");
console.log("================================");

function helloWorld() {
  console.log("Hello from Enhanced IDE!");
  return "AI-powered development at your fingertips!";
}

// Try AI features:
// 1. Select code and use AI actions (floating toolbar)
// 2. Chat with AI for help (click Ask AI or chat icon)
// 3. Get intelligent suggestions
// 4. Auto-complete with AI

class SmartCalculator {
  constructor() {
    this.history = [];
  }
  
  calculate(a, b, operation) {
    const result = this.performOperation(a, b, operation);
    this.history.push({ a, b, operation, result, timestamp: new Date() });
    console.log(\`\${a} \${operation} \${b} = \${result}\`);
    return result;
  }
  
  performOperation(a, b, operation) {
    switch(operation) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Error: Division by zero';
      case '%': return a % b;
      case '**': return a ** b;
      default: return "Invalid operation";
    }
  }
  
  getHistory() {
    return this.history;
  }
  
  clearHistory() {
    this.history = [];
  }
}

// Test the calculator
console.log("Testing SmartCalculator:");
const calc = new SmartCalculator();
calc.calculate(10, 5, '+');
calc.calculate(15, 3, '*');
calc.calculate(20, 4, '/');

console.log("\\nCalculation History:");
console.log(calc.getHistory());

console.log("\\nRunning helloWorld function:");
const result = helloWorld();
console.log("Result:", result);

console.log("\\n🎉 Code execution completed!");`;

  // Core state
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('untitled.js');
  
  // AI Chat state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatFullscreen, setAiChatFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // AI Features state
  const [selectedText, setSelectedText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiActionsAnchor, setAiActionsAnchor] = useState(null);
  
  // UI state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const editorRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  
  // Initialize with welcome message
  useEffect(() => {
    setChatMessages([{
      id: Date.now(),
      role: 'assistant',
      content: `🚀 **Welcome to Enhanced AI IDE!**

I'm your AI coding assistant, here to help you:

🔧 **Code Analysis & Debugging**
- Find and fix bugs in your code
- Explain complex code sections
- Suggest optimizations

✨ **Smart Code Generation**
- Auto-complete functions and classes
- Generate boilerplate code
- Create documentation

🏗️ **Refactoring & Optimization**
- Improve code structure
- Performance optimizations
- Best practices suggestions

💬 **Interactive Help**
- Ask me anything about your code
- Get explanations and examples
- Learn new patterns and techniques

**Try selecting some code and right-click for AI actions, or just chat with me!**`,
      timestamp: new Date()
    }]);
  }, []);

  // Load selected file content
  useEffect(() => {
    if (selectedFile) {
      setCode(selectedFile.notes || defaultCode);
      setFileName(selectedFile.title || 'untitled.js');
      
      // Set language based on file extension
      const extension = selectedFile.title?.split('.').pop()?.toLowerCase();
      const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'json': 'json',
        'md': 'markdown',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust'
      };
      setLanguage(languageMap[extension] || 'javascript');
    } else {
      setCode(defaultCode);
      setFileName('untitled.js');
      setLanguage('javascript');
    }
  }, [selectedFile, defaultCode]);

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add AI-powered features to Monaco
    setupAIFeatures(editor, monaco);
    
    // Set up context menu for AI actions - Fixed to prevent page navigation
    editor.addAction({
      id: 'ai-explain-code',
      label: '🤖 Explain Code',
      contextMenuGroupId: 'ai-actions',
      contextMenuOrder: 1,
      precondition: null,
      keybindingContext: null,
      run: function(editor) {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel().getValueInRange(selection);
          if (selectedText.trim()) {
            handleAIAction('explain', selectedText);
          }
        } else {
          showAlertMessage('Please select some code first', 'warning');
        }
        return null;
      }
    });

    editor.addAction({
      id: 'ai-fix-code',
      label: '🔧 Fix Code',
      contextMenuGroupId: 'ai-actions',
      contextMenuOrder: 2,
      precondition: null,
      keybindingContext: null,
      run: function(editor) {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel().getValueInRange(selection);
          if (selectedText.trim()) {
            handleAIAction('fix', selectedText);
          }
        } else {
          showAlertMessage('Please select some code first', 'warning');
        }
        return null;
      }
    });

    editor.addAction({
      id: 'ai-optimize-code',
      label: '⚡ Optimize Code',
      contextMenuGroupId: 'ai-actions',
      contextMenuOrder: 3,
      precondition: null,
      keybindingContext: null,
      run: function(editor) {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel().getValueInRange(selection);
          if (selectedText.trim()) {
            handleAIAction('optimize', selectedText);
          }
        } else {
          showAlertMessage('Please select some code first', 'warning');
        }
        return null;
      }
    });

    editor.addAction({
      id: 'ai-refactor-code',
      label: '🏗️ Refactor Code',
      contextMenuGroupId: 'ai-actions',
      contextMenuOrder: 4,
      precondition: null,
      keybindingContext: null,
      run: function(editor) {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel().getValueInRange(selection);
          if (selectedText.trim()) {
            handleAIAction('refactor', selectedText);
          }
        } else {
          showAlertMessage('Please select some code first', 'warning');
        }
        return null;
      }
    });

    editor.addAction({
      id: 'ai-add-comments',
      label: '📝 Add Comments',
      contextMenuGroupId: 'ai-actions',
      contextMenuOrder: 5,
      precondition: null,
      keybindingContext: null,
      run: function(editor) {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel().getValueInRange(selection);
          if (selectedText.trim()) {
            handleAIAction('comment', selectedText);
          }
        } else {
          showAlertMessage('Please select some code first', 'warning');
        }
        return null;
      }
    });
  };

  // Set up AI-powered features
  const setupAIFeatures = (editor, monaco) => {
    // AI-powered auto-completion
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: async (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // Get context around cursor
        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);
        const afterCursor = lineContent.substring(position.column - 1);

        // Generate AI suggestions
        const suggestions = await generateAISuggestions(beforeCursor, afterCursor, model.getValue());

        return {
          suggestions: suggestions.map((suggestion, index) => ({
            label: suggestion.label,
            kind: monaco.languages.CompletionItemKind.Function,
            documentation: suggestion.documentation,
            insertText: suggestion.insertText,
            range: range,
            sortText: `000${index}` // Prioritize AI suggestions
          }))
        };
      }
    });

    // Real-time code analysis
    let timeoutId;
    editor.onDidChangeModelContent(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        analyzeCodeWithAI(editor.getValue());
      }, 2000); // Debounce analysis
    });
  };

  // Generate AI suggestions
  const generateAISuggestions = async (beforeCursor, afterCursor, fullCode) => {
    try {
      const prompt = `Given this code context, provide intelligent code completion suggestions:

Before cursor: ${beforeCursor}
After cursor: ${afterCursor}
Full code context: ${fullCode.substring(0, 1000)}...

Language: ${language}

Provide 3-5 relevant code completion suggestions. Focus on:
1. Function completions
2. Variable suggestions
3. Method calls
4. Common patterns for this language

Return suggestions in this JSON format:
[
  {
    "label": "suggestion text",
    "insertText": "code to insert",
    "documentation": "explanation of what this does"
  }
]

Return only valid JSON, no other text.`;

      const response = await llmIntegration.chatWithAI(prompt, []);
      
      try {
        const suggestions = JSON.parse(response);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (parseError) {
        console.warn('Failed to parse AI suggestions:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return [];
    }
  };

  // Analyze code with AI
  const analyzeCodeWithAI = useCallback(async (codeToAnalyze) => {
    try {
      const prompt = `Analyze this ${language} code for potential issues, improvements, and suggestions:

\`\`\`${language}
${codeToAnalyze}
\`\`\`

Provide analysis in the following areas:
1. Potential bugs or errors
2. Performance improvements
3. Code quality suggestions
4. Best practices recommendations

Keep suggestions concise and actionable. Return as JSON:
{
  "issues": ["issue 1", "issue 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

      const response = await llmIntegration.chatWithAI(prompt, []);
      
      try {
        const analysis = JSON.parse(response);
        setAiSuggestions(analysis);
        setShowSuggestions(true);
      } catch (parseError) {
        console.warn('Failed to parse code analysis:', parseError);
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
    }
  }, [language]);

  // Handle AI actions
  const handleAIAction = async (action, selectedCode) => {
    setIsAiLoading(true);
    
    const actionPrompts = {
      explain: `Explain this ${language} code in clear, simple terms:\n\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n\nProvide a step-by-step explanation of what this code does.`,
      fix: `Find and fix any bugs or issues in this ${language} code:\n\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n\nReturn the corrected code with explanations of what was fixed.`,
      optimize: `Optimize this ${language} code for better performance and readability:\n\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n\nProvide the optimized version with explanations.`,
      refactor: `Refactor this ${language} code to improve structure and maintainability:\n\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n\nProvide the refactored code with explanations.`,
      comment: `Add detailed comments to this ${language} code:\n\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n\nReturn the code with comprehensive comments explaining each part.`
    };

    try {
      const response = await llmIntegration.chatWithAI(actionPrompts[action], []);
      
      // Add to chat
      const newMessage = {
        id: Date.now(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        action: action,
        originalCode: selectedCode
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setAiChatOpen(true);
      
      showAlertMessage(`AI ${action} completed!`, 'success');
    } catch (error) {
      console.error(`Error in AI ${action}:`, error);
      showAlertMessage(`Failed to ${action} code`, 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle chat message send
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      // Include current code context in chat
      const contextPrompt = `User message: ${chatInput}

Current code context:
\`\`\`${language}
${code}
\`\`\`

File: ${fileName}
Language: ${language}

Please provide helpful assistance related to the code or general programming questions.`;

      const response = await llmIntegration.chatWithAI(contextPrompt, chatMessages.slice(-5));
      
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Utility functions
  const showAlertMessage = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const executeCode = async () => {
    try {
      setOutput('Executing code...\n');
      
      const sandbox = {
        console: {
          log: (...args) => setOutput(prev => prev + args.join(' ') + '\n'),
          error: (...args) => setOutput(prev => prev + 'ERROR: ' + args.join(' ') + '\n'),
          warn: (...args) => setOutput(prev => prev + 'WARNING: ' + args.join(' ') + '\n'),
          info: (...args) => setOutput(prev => prev + 'INFO: ' + args.join(' ') + '\n')
        },
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        Date,
        Math,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        isFinite
      };

      const result = new Function(...Object.keys(sandbox), code);
      result(...Object.values(sandbox));
      
      setOutput(prev => prev + '\n✅ Code executed successfully!');
    } catch (error) {
      setOutput(prev => prev + `\n❌ Error: ${error.message}`);
    }
  };

  const saveFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlertMessage('File saved successfully!');
  };

  // Auto-scroll chat to bottom - contained within chat area only
  useEffect(() => {
    if (chatScrollRef.current && aiChatOpen && chatMessages.length > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        const scrollContainer = chatScrollRef.current;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    }
  }, [chatMessages, aiChatOpen]);

  // Auto-open AI chat when entering fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      setAiChatOpen(true);
    }
  }, [isFullscreen]);

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F11') {
        event.preventDefault();
        setIsFullscreen(!isFullscreen);
      } else if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <Box sx={{ 
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      width: isFullscreen ? '100vw' : '100%',
      height: isFullscreen ? '100vh' : '100vh', 
      zIndex: isFullscreen ? 9999 : 'auto',
      bgcolor: isFullscreen ? 'background.default' : 'transparent',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Prevent main container from scrolling
    }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon color="primary" />
            Enhanced AI IDE {isFullscreen && '(Fullscreen)'}
            {selectedFile && (
              <>
                <span style={{ margin: '0 8px' }}>•</span>
                <span style={{ fontWeight: 'normal', color: '#666' }}>{fileName}</span>
              </>
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                label="Language"
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="markdown">Markdown</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Ask AI about your code">
              <Button
                variant="outlined"
                startIcon={<SmartToyIcon />}
                onClick={() => {
                  setAiChatOpen(true);
                  setChatInput("Help me understand this code");
                }}
                size="small"
              >
                Ask AI
              </Button>
            </Tooltip>

            <Tooltip title="AI Chat Assistant">
              <IconButton
                onClick={() => setAiChatOpen(true)}
                color={aiChatOpen ? 'primary' : 'default'}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={chatMessages.length > 1 ? chatMessages.length - 1 : 0} color="primary">
                  <ChatIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? "Exit Fullscreen IDE" : "Fullscreen IDE"}>
              <IconButton
                onClick={() => setIsFullscreen(!isFullscreen)}
                color={isFullscreen ? 'primary' : 'default'}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setShowSaveDialog(true)}
            >
              Save
            </Button>
            
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={executeCode}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)'
                }
              }}
            >
              Run
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        position: 'relative', 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a8a8a8',
        }
      }}>
        {/* Code Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <Box sx={{ minHeight: '400px', flexShrink: 0 }}>
            <MonacoEditor
              height="400px"
              language={language}
              value={code}
              onChange={(value) => {
                setCode(value);
                if (onFileChange && selectedFile) {
                  onFileChange(value);
                }
              }}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                theme: 'vs-dark',
                contextmenu: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: true,
                parameterHints: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnPaste: true,
                formatOnType: true,
                renderLineHighlight: 'all',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                detectIndentation: true,
                folding: true,
                lineNumbers: 'on',
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                scrollbar: {
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10
                }
              }}
            />
          </Box>

          {/* Floating AI Actions Toolbar */}
          <Paper
            sx={{
              position: 'absolute',
              top: 10,
              right: aiChatOpen ? 420 : 20,
              zIndex: 1000,
              p: 1,
              display: 'flex',
              gap: 1,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Tooltip title="Select code and click to explain">
              <IconButton
                size="small"
                onClick={() => {
                  const editor = editorRef.current;
                  if (editor) {
                    const selection = editor.getSelection();
                    if (selection && !selection.isEmpty()) {
                      const selectedText = editor.getModel().getValueInRange(selection);
                      if (selectedText.trim()) {
                        handleAIAction('explain', selectedText);
                      }
                    } else {
                      showAlertMessage('Please select some code first', 'warning');
                    }
                  }
                }}
                sx={{ color: 'primary.main' }}
              >
                <ExplainIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Fix selected code">
              <IconButton
                size="small"
                onClick={() => {
                  const editor = editorRef.current;
                  if (editor) {
                    const selection = editor.getSelection();
                    if (selection && !selection.isEmpty()) {
                      const selectedText = editor.getModel().getValueInRange(selection);
                      if (selectedText.trim()) {
                        handleAIAction('fix', selectedText);
                      }
                    } else {
                      showAlertMessage('Please select some code first', 'warning');
                    }
                  }
                }}
                sx={{ color: 'error.main' }}
              >
                <BugReportIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Optimize selected code">
              <IconButton
                size="small"
                onClick={() => {
                  const editor = editorRef.current;
                  if (editor) {
                    const selection = editor.getSelection();
                    if (selection && !selection.isEmpty()) {
                      const selectedText = editor.getModel().getValueInRange(selection);
                      if (selectedText.trim()) {
                        handleAIAction('optimize', selectedText);
                      }
                    } else {
                      showAlertMessage('Please select some code first', 'warning');
                    }
                  }
                }}
                sx={{ color: 'warning.main' }}
              >
                <OptimizeIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refactor selected code">
              <IconButton
                size="small"
                onClick={() => {
                  const editor = editorRef.current;
                  if (editor) {
                    const selection = editor.getSelection();
                    if (selection && !selection.isEmpty()) {
                      const selectedText = editor.getModel().getValueInRange(selection);
                      if (selectedText.trim()) {
                        handleAIAction('refactor', selectedText);
                      }
                    } else {
                      showAlertMessage('Please select some code first', 'warning');
                    }
                  }
                }}
                sx={{ color: 'success.main' }}
              >
                <RefactorIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add comments to selected code">
              <IconButton
                size="small"
                onClick={() => {
                  const editor = editorRef.current;
                  if (editor) {
                    const selection = editor.getSelection();
                    if (selection && !selection.isEmpty()) {
                      const selectedText = editor.getModel().getValueInRange(selection);
                      if (selectedText.trim()) {
                        handleAIAction('comment', selectedText);
                      }
                    } else {
                      showAlertMessage('Please select some code first', 'warning');
                    }
                  }
                }}
                sx={{ color: 'info.main' }}
              >
                <DocumentIcon />
              </IconButton>
            </Tooltip>
          </Paper>
          
          {/* Output Console */}
          <Box sx={{ 
            minHeight: '300px',
            p: 2, 
            bgcolor: 'grey.900', 
            color: 'white', 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon />
                Console Output:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'grey.400', fontSize: '11px' }}>
                  ↕ Scroll to see more
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setOutput('')}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'grey.300',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                bgcolor: 'black',
                p: 1,
                borderRadius: 1,
                minHeight: 0
              }}
            >
              {output || 'No output yet. Click "Run" to execute your code.'}
            </Box>
          </Box>
        </Box>

        {/* AI Chat Sidebar - Always visible in fullscreen */}
        {(aiChatOpen || isFullscreen) && (
          <Box
            sx={{
              width: aiChatFullscreen ? '100vw' : (isFullscreen ? 500 : 400),
              flexShrink: 0,
              height: '100%',
              borderLeft: '1px solid #e0e0e0',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyIcon />
                  AI Assistant {aiChatFullscreen && '(Fullscreen)'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    onClick={() => setAiChatFullscreen(!aiChatFullscreen)} 
                    sx={{ color: 'white' }}
                    title={aiChatFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {aiChatFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                  {!isFullscreen && (
                    <IconButton 
                      onClick={() => {
                        setAiChatOpen(false);
                        setAiChatFullscreen(false);
                      }} 
                      sx={{ color: 'white' }}
                      title="Close Chat"
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Chat Messages */}
            <Box 
              sx={{ 
                flex: 1, 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}
            >
              <Box 
                ref={chatScrollRef}
                sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  p: 1,
                  scrollBehavior: 'smooth',
                  minHeight: 0,
                  maxHeight: 'calc(100vh - 200px)',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#a8a8a8',
                  }
                }}
              >
                {chatMessages.map((message) => (
                  <Box key={message.id} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        sx={{
                          maxWidth: '85%',
                          p: 2,
                          bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                          color: message.role === 'user' ? 'white' : 'text.primary',
                          wordBreak: 'break-word'
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                ))}
                {isAiLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">AI is thinking...</Typography>
                    </Paper>
                  </Box>
                )}
                <div ref={chatEndRef} />
              </Box>
            </Box>

            {/* Chat Input */}
            <Box sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider', 
              flexShrink: 0,
              bgcolor: 'background.paper',
              minHeight: '80px'
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask AI about your code..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    multiline
                    maxRows={3}
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-root': {
                        maxHeight: '120px',
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        border: '2px solid #2196F3'
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleSendChatMessage}
                    disabled={!chatInput.trim() || isAiLoading}
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      },
                      '&:disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
                
                {/* Quick Test Buttons */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setChatInput("Hello AI! Can you help me with my code?");
                      setTimeout(() => handleSendChatMessage(), 100);
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    🧪 Test AI Chat
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    color="warning"
                    onClick={async () => {
                      console.log('🔧 Testing Groq API directly...');
                      const result = await testGroqAPI();
                      setChatMessages(prev => [...prev, {
                        id: Date.now(),
                        role: 'system',
                        content: `🔧 Direct API Test Result: ${result}`,
                        timestamp: new Date()
                      }]);
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    🔧 Debug API
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
          </Box>
        )}
      </Box>

      {/* AI Suggestions Panel */}
      {showSuggestions && aiSuggestions && Object.keys(aiSuggestions).length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 20,
            right: aiChatOpen ? 420 : 20,
            width: 300,
            maxHeight: 200,
            overflow: 'auto',
            zIndex: 1000
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon color="warning" fontSize="small" />
                AI Suggestions
              </Typography>
              <IconButton size="small" onClick={() => setShowSuggestions(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {aiSuggestions.issues && aiSuggestions.issues.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                  Issues:
                </Typography>
                {aiSuggestions.issues.map((issue, index) => (
                  <Typography key={index} variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                    • {issue}
                  </Typography>
                ))}
              </Box>
            )}
            
            {aiSuggestions.improvements && aiSuggestions.improvements.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                  Improvements:
                </Typography>
                {aiSuggestions.improvements.map((improvement, index) => (
                  <Typography key={index} variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
                    • {improvement}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save File</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            saveFile();
            setShowSaveDialog(false);
          }} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
      {showAlert && (
        <Alert
          severity={alertSeverity}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999
          }}
          onClose={() => setShowAlert(false)}
        >
          {alertMessage}
        </Alert>
      )}
    </Box>
  );
};

export default EnhancedWebIDE;