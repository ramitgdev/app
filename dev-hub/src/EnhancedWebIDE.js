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
import { RealAICopilotIntegration } from './RealAICopilotIntegration';
import './test-claude-integration';

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
import GitHubIcon from '@mui/icons-material/Code';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

const EnhancedWebIDE = ({ selectedFile, onFileChange, sidebarCollapsed = false, onCreateNewFile, availableFolders = [] }) => {
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
    console.log(a + " " + operation + " " + b + " = " + result);
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
  
  // GitHub integration state
  const [isGitHubFile, setIsGitHubFile] = useState(false);
  const [githubInfo, setGithubInfo] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);
  
  // Copilot integration state
  const [copilotEnabled, setCopilotEnabled] = useState(true);
  
  // New file dialog state
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileFolder, setNewFileFolder] = useState(0); // Default to root folder ID
  
  // Refs
  const editorRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  
  // Handle selectedFile changes (including GitHub files)
  useEffect(() => {
    if (selectedFile) {
      // Check if it's a GitHub file
      if (selectedFile.isGitHubFile && selectedFile.githubInfo) {
        setIsGitHubFile(true);
        setGithubInfo(selectedFile.githubInfo);
        setOriginalContent(selectedFile.originalContent || '');
        setCode(selectedFile.notes || '');
        setFileName(selectedFile.title || selectedFile.githubInfo.filePath.split('/').pop());
        
        // Determine language from file extension
        const extension = selectedFile.title ? selectedFile.title.split('.').pop() : selectedFile.githubInfo.filePath.split('.').pop();
        const langMap = {
          'js': 'javascript',
          'jsx': 'javascript', 
          'ts': 'typescript',
          'tsx': 'typescript',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'c',
          'css': 'css',
          'html': 'html',
          'json': 'json',
          'md': 'markdown'
        };
        setLanguage(langMap[extension] || 'plaintext');
        
        // Add GitHub-specific welcome message
        setChatMessages([{
          id: Date.now(),
          role: 'assistant',
          content: `📁 **GitHub File Loaded!**

**Repository:** ${selectedFile.githubInfo.repoFullName}
**File:** ${selectedFile.githubInfo.filePath}
**Branch:** ${selectedFile.githubInfo.branch}

🔧 I can help you:
- Edit and analyze this GitHub file
- Push changes back to GitHub
- Explain the code structure
- Suggest improvements

💡 **Tip:** Make your changes and click "Push to GitHub" to save them to the repository!`,
          timestamp: new Date()
        }]);
        
        setHasUnsavedChanges(false);
      } else if (selectedFile.notes !== undefined) {
        // Handle regular local files
        setIsGitHubFile(false);
        setGithubInfo(null);
        setOriginalContent('');
        setCode(selectedFile.notes || defaultCode);
        setFileName(selectedFile.title || 'untitled.js');
        setHasUnsavedChanges(false);
        
        // Regular welcome message
        setChatMessages([{
          id: Date.now(),
          role: 'assistant',
          content: `🚀 **Enhanced AI IDE Ready!**

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
      }
    } else {
      // No file selected, show default
      setIsGitHubFile(false);
      setGithubInfo(null);
      setOriginalContent('');
      setCode(defaultCode);
      setFileName('untitled.js');
      setLanguage('javascript');
      setHasUnsavedChanges(false);
      
      // Default welcome message
      setChatMessages([{
        id: Date.now(),
        role: 'assistant',
        content: `🚀 **Enhanced AI IDE Ready!**

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
    }
  }, [selectedFile]);

  // Track code changes for GitHub files
  useEffect(() => {
    if (isGitHubFile && originalContent !== '') {
      setHasUnsavedChanges(code !== originalContent);
    }
  }, [code, originalContent, isGitHubFile]);

  const [pyodide, setPyodide] = useState(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [cheerpj, setCheerpj] = useState(null);
  const [isCheerpjLoading, setIsCheerpjLoading] = useState(false);
  const [emscripten, setEmscripten] = useState(null);
  const [isEmscriptenLoading, setIsEmscriptenLoading] = useState(false);
  
  // Load runtimes based on language
  useEffect(() => {
    if (language === 'python' && !pyodide && !isPyodideLoading) {
      setIsPyodideLoading(true);
      loadPyodide();
    } else if (language === 'java' && !cheerpj && !isCheerpjLoading) {
      setIsCheerpjLoading(true);
      loadCheerpj();
    } else if (language === 'cpp' && !emscripten && !isEmscriptenLoading) {
      setIsEmscriptenLoading(true);
      loadEmscripten();
    }
  }, [language, pyodide, isPyodideLoading, cheerpj, isCheerpjLoading, emscripten, isEmscriptenLoading]);

  // Get default code based on language
  const getDefaultCodeForLanguage = (lang) => {
    switch (lang) {
      case 'python':
        return `# Welcome to the Enhanced AI-Powered Web IDE!
# Click the green "Run" button to execute this Python code!

print("🚀 Enhanced AI IDE is working!")
print("================================")

def hello_world():
    print("Hello from Enhanced IDE!")
    return "AI-powered development at your fingertips!"

# Try AI features:
# 1. Select code and use AI actions (floating toolbar)
# 2. Chat with AI for help (click Ask AI or chat icon)
# 3. Get intelligent suggestions
# 4. Auto-complete with AI

class SmartCalculator:
    def __init__(self):
        self.history = []
    
    def calculate(self, a, b, operation):
        result = self.perform_operation(a, b, operation)
        self.history.append({
            'a': a, 'b': b, 'operation': operation, 
            'result': result, 'timestamp': 'now'
        })
        print(str(a) + " " + operation + " " + str(b) + " = " + str(result))
        return result
    
    def perform_operation(self, a, b, operation):
        if operation == '+': return a + b
        elif operation == '-': return a - b
        elif operation == '*': return a * b
        elif operation == '/': return a / b if b != 0 else 'Error: Division by zero'
        elif operation == '%': return a % b
        elif operation == '**': return a ** b
        else: return "Invalid operation"
    
    def get_history(self):
        return self.history
    
    def clear_history(self):
        self.history = []

# Test the calculator
print("Testing SmartCalculator:")
calc = SmartCalculator()
calc.calculate(10, 5, '+')
calc.calculate(15, 3, '*')
calc.calculate(20, 4, '/')

print("\\nCalculation History:")
print(calc.get_history())

print("\\nRunning hello_world function:")
result = hello_world()
print("Result:", result)

print("\\n🎉 Python code execution completed!")`;
      case 'typescript':
        return `// Welcome to the Enhanced AI-Powered Web IDE!
// Click the green "Run" button to execute this TypeScript code!

console.log("🚀 Enhanced AI IDE is working!");
console.log("================================");

interface CalculatorHistory {
  a: number;
  b: number;
  operation: string;
  result: number | string;
  timestamp: Date;
}

class SmartCalculator {
  private history: CalculatorHistory[] = [];

  calculate(a: number, b: number, operation: string): number | string {
    const result = this.performOperation(a, b, operation);
    this.history.push({
      a, b, operation, result, timestamp: new Date()
    });
    console.log(a + " " + operation + " " + b + " = " + result);
    return result;
  }

  private performOperation(a: number, b: number, operation: string): number | string {
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

  getHistory(): CalculatorHistory[] {
    return this.history;
  }

  clearHistory(): void {
    this.history = [];
  }
}

function helloWorld(): string {
  console.log("Hello from Enhanced IDE!");
  return "AI-powered development at your fingertips!";
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

console.log("\\n🎉 TypeScript code execution completed!");`;
      case 'java':
        return `// Welcome to the Enhanced AI-Powered Web IDE!
// Click the green "Run" button to execute this Java code!

public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 Enhanced AI IDE is working!");
        System.out.println("================================");
        
        // Try AI features:
        // 1. Select code and use AI actions (floating toolbar)
        // 2. Chat with AI for help (click Ask AI or chat icon)
        // 3. Get intelligent suggestions
        // 4. Auto-complete with AI
        
        SmartCalculator calc = new SmartCalculator();
        
        // Test the calculator
        System.out.println("Testing SmartCalculator:");
        calc.calculate(10, 5, "+");
        calc.calculate(15, 3, "*");
        calc.calculate(20, 4, "/");
        
        System.out.println("\\nCalculation History:");
        calc.printHistory();
        
        System.out.println("\\nRunning helloWorld function:");
        String result = helloWorld();
        System.out.println("Result: " + result);
        
        System.out.println("\\n🎉 Java code execution completed!");
    }
    
    public static String helloWorld() {
        System.out.println("Hello from Enhanced IDE!");
        return "AI-powered development at your fingertips!";
    }
}

class SmartCalculator {
    private java.util.List<Calculation> history = new java.util.ArrayList<>();
    
    public void calculate(double a, double b, String operation) {
        double result = performOperation(a, b, operation);
        history.add(new Calculation(a, b, operation, result));
        System.out.println(a + " " + operation + " " + b + " = " + result);
    }
    
    private double performOperation(double a, double b, String operation) {
        switch(operation) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return b != 0 ? a / b : Double.NaN;
            case "%": return a % b;
            default: return Double.NaN;
        }
    }
    
    public void printHistory() {
        for (Calculation calc : history) {
            System.out.println(calc);
        }
    }
}

class Calculation {
    private double a, b, result;
    private String operation;
    
    public Calculation(double a, double b, String operation, double result) {
        this.a = a;
        this.b = b;
        this.operation = operation;
        this.result = result;
    }
    
    @Override
    public String toString() {
        return a + " " + operation + " " + b + " = " + result;
    }
}`;
      case 'cpp':
        return `// Welcome to the Enhanced AI-Powered Web IDE!
// Click the green "Run" button to execute this C++ code!

#include <iostream>
#include <vector>
#include <string>
#include <cmath>

using namespace std;

class SmartCalculator {
private:
    struct Calculation {
        double a, b, result;
        string operation;
        
        Calculation(double a, double b, string op, double res) 
            : a(a), b(b), operation(op), result(res) {}
    };
    
    vector<Calculation> history;

public:
    void calculate(double a, double b, string operation) {
        double result = performOperation(a, b, operation);
        history.push_back(Calculation(a, b, operation, result));
        cout << a << " " << operation << " " << b << " = " << result << endl;
    }
    
private:
    double performOperation(double a, double b, string operation) {
        if (operation == "+") return a + b;
        if (operation == "-") return a - b;
        if (operation == "*") return a * b;
        if (operation == "/") return b != 0 ? a / b : NAN;
        if (operation == "%") return (int)a % (int)b;
        if (operation == "**") return pow(a, b);
        return NAN;
    }

public:
    void printHistory() {
        cout << "\\nCalculation History:" << endl;
        for (const auto& calc : history) {
            cout << calc.a << " " << calc.operation << " " << calc.b << " = " << calc.result << endl;
        }
    }
};

string helloWorld() {
    cout << "Hello from Enhanced IDE!" << endl;
    return "AI-powered development at your fingertips!";
}

int main() {
    cout << "🚀 Enhanced AI IDE is working!" << endl;
    cout << "================================" << endl;
    
    // Try AI features:
    // 1. Select code and use AI actions (floating toolbar)
    // 2. Chat with AI for help (click Ask AI or chat icon)
    // 3. Get intelligent suggestions
    // 4. Auto-complete with AI
    
    SmartCalculator calc;
    
    // Test the calculator
    cout << "Testing SmartCalculator:" << endl;
    calc.calculate(10, 5, "+");
    calc.calculate(15, 3, "*");
    calc.calculate(20, 4, "/");
    
    calc.printHistory();
    
    cout << "\\nRunning helloWorld function:" << endl;
    string result = helloWorld();
    cout << "Result: " << result << endl;
    
    cout << "\\n🎉 C++ code execution completed!" << endl;
    return 0;
}`;
      case 'json':
        return `{
  "message": "Welcome to the Enhanced AI-Powered Web IDE!",
  "description": "This is a sample JSON object to demonstrate JSON parsing and validation.",
  "features": [
    "JSON validation",
    "Syntax highlighting",
    "Formatting",
    "Error detection"
  ],
  "metadata": {
    "version": "1.0.0",
    "author": "AI Assistant",
    "created": "2024-01-01"
  },
  "nested": {
    "object": {
      "with": {
        "deep": {
          "structure": true
        }
      }
    }
  },
  "array": [
    "item1",
    "item2",
    "item3"
  ],
  "numbers": [1, 2, 3, 4, 5],
  "booleans": [true, false],
  "null_value": null
}`;
      default:
        return defaultCode;
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Update file extension based on language
    const extensionMap = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp'
    };
    const extension = extensionMap[newLanguage] || 'js';
    setFileName(prev => {
      const nameWithoutExt = prev.split('.').slice(0, -1).join('.');
      return nameWithoutExt + '.' + extension;
    });
    
    // Update code to language-appropriate default if it's the default code
    if (code === defaultCode || code === getDefaultCodeForLanguage(language)) {
      setCode(getDefaultCodeForLanguage(newLanguage));
    }
  };

  const loadPyodide = async () => {
    try {
      setOutput('🐍 Loading Python runtime...\n');
      
      // Check if Pyodide is already loaded globally
      if (window.loadPyodide) {
        try {
          setOutput(prev => prev + 'Found existing Pyodide, initializing...\n');
          const pyodideInstance = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
          });
          setPyodide(pyodideInstance);
          setOutput(prev => prev + '✅ Python runtime loaded successfully!\n');
          setIsPyodideLoading(false);
          return;
        } catch (error) {
          setOutput(prev => prev + '⚠️ Failed to use existing Pyodide, trying fresh load...\n');
          console.warn('Existing Pyodide failed:', error);
        }
      }
      
      // Multiple CDN fallbacks for better reliability
      const cdnUrls = [
        'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
        'https://unpkg.com/pyodide@0.24.1/pyodide.js',
        'https://cdn.skypack.dev/pyodide@0.24.1/pyodide.js'
      ];
      
      let lastError = null;
      
      for (let i = 0; i < cdnUrls.length; i++) {
        const cdnUrl = cdnUrls[i];
        setOutput(prev => prev + `Trying CDN ${i + 1}/${cdnUrls.length}: ${cdnUrl.split('/')[2]}...\n`);
        
        try {
          // Remove any existing Pyodide scripts to prevent conflicts
          const existingScripts = document.querySelectorAll('script[src*="pyodide"]');
          existingScripts.forEach(script => script.remove());
          
          const script = document.createElement('script');
          script.src = cdnUrl;
          script.crossOrigin = 'anonymous';
          script.type = 'text/javascript';
          
          const loadPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout loading from ${cdnUrl}`));
            }, 15000); // Shorter timeout per CDN
            
            script.onload = async () => {
              clearTimeout(timeout);
              try {
                setOutput(prev => prev + 'Script loaded, initializing Python runtime...\n');
                
                // Verify the script loaded correctly
                if (!window.loadPyodide || typeof window.loadPyodide !== 'function') {
                  throw new Error('Pyodide loader not found after script load');
                }
                
                const pyodideInstance = await window.loadPyodide({
                  indexURL: cdnUrl.replace('/pyodide.js', '/'),
                  stdout: (text) => setOutput(prev => prev + text + '\n'),
                  stderr: (text) => setOutput(prev => prev + 'Python Error: ' + text + '\n')
                });
                
                setPyodide(pyodideInstance);
                setOutput(prev => prev + '✅ Python runtime loaded successfully!\n');
                resolve(pyodideInstance);
              } catch (initError) {
                clearTimeout(timeout);
                reject(new Error(`Initialization failed: ${initError.message}`));
              }
            };
            
            script.onerror = (error) => {
              clearTimeout(timeout);
              reject(new Error(`Script loading failed from ${cdnUrl}`));
            };
          });
          
          document.head.appendChild(script);
          await loadPromise;
          
          // If we get here, loading was successful
          setIsPyodideLoading(false);
          return;
          
        } catch (error) {
          lastError = error;
          setOutput(prev => prev + `❌ CDN ${i + 1} failed: ${error.message}\n`);
          
          // Remove failed script
          const failedScript = document.querySelector(`script[src="${cdnUrl}"]`);
          if (failedScript) {
            failedScript.remove();
          }
          
          // Continue to next CDN
          continue;
        }
      }
      
      // If all CDNs failed
      throw new Error(`All CDNs failed. Last error: ${lastError?.message || 'Unknown error'}`);
      
    } catch (error) {
      console.error('Pyodide loading error:', error);
      setOutput(prev => prev + `❌ Failed to load Python runtime: ${error.message}\n`);
      setOutput(prev => prev + '💡 Troubleshooting tips:\n');
      setOutput(prev => prev + '  • Check your internet connection\n');
      setOutput(prev => prev + '  • Try refreshing the page\n');
      setOutput(prev => prev + '  • Disable ad blockers temporarily\n');
      setOutput(prev => prev + '  • Try switching to JavaScript for now\n');
    } finally {
      setIsPyodideLoading(false);
    }
  };

  const loadCheerpj = async () => {
    try {
      setOutput('☕ Setting up Java execution environment...\n');
      
      // Instead of relying on external CDNs that may fail, 
      // we'll create a simple Java-to-JavaScript transpiler
      const javaTranspiler = {
        transpile: (javaCode) => {
          try {
            let jsCode = javaCode;
            
            // Basic Java to JavaScript transpilation
            jsCode = jsCode
              // Remove package and import statements
              .replace(/package\s+[^;]+;/g, '')
              .replace(/import\s+[^;]+;/g, '')
              
              // Convert System.out.println to console.log
              .replace(/System\.out\.println\s*\(\s*([^)]+)\s*\)\s*;/g, 'console.log($1);')
              .replace(/System\.out\.print\s*\(\s*([^)]+)\s*\)\s*;/g, 'console.log($1);')
              
              // Convert main method - handle multiple patterns
              .replace(/public\s+static\s+void\s+main\s*\(\s*String\[\]\s+\w+\s*\)\s*{/, 'function main() {')
              .replace(/public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s+\w+\s*\)\s*{/, 'function main() {')
              
              // Convert other static methods
              .replace(/public\s+static\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g, 'function $2($3) {')
              
              // Convert basic class structure
              .replace(/public\s+class\s+(\w+)\s*{/, 'class $1 {')
              
                             // Convert regular methods (after static methods to avoid conflicts)
               .replace(/public\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g, '$2($3) {')
               .replace(/private\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g, '$2($3) {')
               
               // Handle constructors
               .replace(/public\s+(\w+)\s*\(([^)]*)\)\s*{/g, 'constructor($2) {')
              
              // Remove remaining access modifiers
              .replace(/\bprivate\s+/g, '')
              .replace(/\bpublic\s+/g, '')
              .replace(/\bstatic\s+/g, '')
              
              // Convert variable declarations - improved to handle object instantiation
              .replace(/(\w+)\s+(\w+)\s*=\s*new\s+(\w+)\s*\([^)]*\)\s*;/g, 'let $2 = new $3();')
              .replace(/int\s+(\w+)\s*=\s*([^;]+);/g, 'let $1 = $2;')
              .replace(/double\s+(\w+)\s*=\s*([^;]+);/g, 'let $1 = $2;')
              .replace(/String\s+(\w+)\s*=\s*([^;]+);/g, 'let $1 = $2;')
              .replace(/boolean\s+(\w+)\s*=\s*([^;]+);/g, 'let $1 = $2;')
              
              // Handle variable declarations without initialization - be more specific
              .replace(/\b(int|double|String|boolean)\s+(\w+)\s*;/g, 'let $2;')
              
              // Handle Java collections and generics
              .replace(/java\.util\.List<\w+>/g, 'Array')
              .replace(/java\.util\.ArrayList<>/g, 'Array')
              .replace(/new\s+java\.util\.ArrayList<>\(\)/g, '[]')
              .replace(/\.add\(/g, '.push(')
              
                             // Convert enhanced for loops
               .replace(/for\s*\(\s*(\w+)\s+(\w+)\s*:\s*(\w+)\s*\)/g, 'for (let $2 of $3)')
               
               // Handle toString method calls
               .replace(/\.toString\(\)/g, '')
              
              // Convert basic types
              .replace(/\bString\b/g, 'String')
              .replace(/\btrue\b/g, 'true')
              .replace(/\bfalse\b/g, 'false')
              .replace(/\bDouble\.NaN\b/g, 'NaN')
              
              // Convert for loops
              .replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)/g, 'for (let $1 = $2; $3; $4)')
              
              // Handle method calls with dot notation
              .replace(/(\w+)\.(\w+)\s*\(/g, '$1.$2(')
              
              // Convert @Override annotation (remove it)
              .replace(/@Override\s*/g, '')
              
                             // Add toString method for objects and main function call at the end
               .replace(/}\s*$/, '}\n\n// Add toString method for objects\nif (typeof Calculation !== "undefined") {\n  Calculation.prototype.toString = function() {\n    return this.a + " " + this.operation + " " + this.b + " = " + this.result;\n  };\n}\n\n// Execute main function\nif (typeof main === "function") main();');
            
            return jsCode;
          } catch (error) {
            throw new Error(`Java transpilation failed: ${error.message}`);
          }
        }
      };
      
      setCheerpj(javaTranspiler);
      setOutput(prev => prev + '✅ Java execution environment ready!\n');
      setOutput(prev => prev + '💡 Using built-in Java-to-JavaScript transpiler for basic Java support\n');
      setIsCheerpjLoading(false);
      
    } catch (error) {
      console.error('Java setup error:', error);
      setOutput(prev => prev + `❌ Failed to set up Java environment: ${error.message}\n`);
      setOutput(prev => prev + '💡 Try switching to JavaScript or Python for immediate execution\n');
      setIsCheerpjLoading(false);
    }
  };

  const loadEmscripten = async () => {
    try {
      setOutput('⚙️ Loading C++ runtime (Emscripten)...\n');
      
      // Check if Emscripten is already available
      if (window.Module && window.Module.ccall) {
        setOutput(prev => prev + '✅ Emscripten runtime found!\n');
        setEmscripten({ 
          execute: (code) => executeCppWithEmscripten(code),
          transpile: transpileCppToJs // Keep as fallback
        });
        setIsEmscriptenLoading(false);
        return;
      }
      
      // Try to load Emscripten from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/emscripten@3.1.45/shell.js';
      script.onload = () => {
        setOutput(prev => prev + '✅ Emscripten loaded successfully!\n');
        setEmscripten({ 
          execute: (code) => executeCppWithEmscripten(code),
          transpile: transpileCppToJs // Keep as fallback
        });
        setIsEmscriptenLoading(false);
      };
      script.onerror = () => {
        setOutput(prev => prev + '⚠️ Emscripten loading failed, using transpiler fallback\n');
        setEmscripten({ transpile: transpileCppToJs });
        setIsEmscriptenLoading(false);
      };
      document.head.appendChild(script);
      
    } catch (error) {
      setOutput(prev => prev + '❌ C++ runtime loading failed: ' + error.message + '\n');
      setOutput(prev => prev + '💡 Falling back to transpiler for basic C++ support\n');
      setEmscripten({ transpile: transpileCppToJs });
      setIsEmscriptenLoading(false);
    }
  };

  // Execute C++ code using a proper C++ compiler (WASM-based)
  const executeCppWithEmscripten = async (cppCode) => {
    try {
      setOutput(prev => prev + '🔧 Compiling C++ code to WebAssembly...\n');
      
      // Create a simple C++ program with the user's code
      const fullCppCode = `
#include <iostream>
#include <string>
#include <vector>
#include <cmath>

using namespace std;

// User's code goes here
${cppCode}

// Main function to execute the code
int main() {
  try {
    // Capture cout output
    cout << "🚀 C++ Code Execution Started" << endl;
    cout << "================================" << endl;
    
    // Execute the user's main function if it exists
    // For now, we'll just run the code as-is
    
    cout << "✅ C++ code executed successfully!" << endl;
    return 0;
  } catch (const exception& e) {
    cout << "❌ C++ Error: " << e.what() << endl;
    return 1;
  }
}`;

      // For now, we'll use a simpler approach with a C++ compiler API
      // In a real implementation, you'd use Emscripten to compile to WASM
      
      setOutput(prev => prev + '⚠️ Direct C++ compilation not available in browser\n');
      setOutput(prev => prev + '💡 Using transpiler fallback for C++ execution\n');
      
      // Fall back to transpiler for now
      return transpileCppToJs(cppCode);
      
    } catch (error) {
      throw new Error(`C++ execution failed: ${error.message}`);
    }
  };

  // Enhanced C++ to JavaScript transpiler (fallback)
  const transpileCppToJs = (cppCode) => {
    try {
      let jsCode = cppCode;
      
      // Step 1: Remove includes and using statements
      jsCode = jsCode
        .replace(/#include\s*<[^>]*>/g, '')
        .replace(/using\s+namespace\s+std;/g, '');
      
      // Step 2: Convert C++ comments to JavaScript comments
      jsCode = jsCode
        .replace(/\/\//g, '//')
        .replace(/\/\*([^*]|\*[^/])*\*\//g, '/* $1 */');
      
      // Step 3: Convert cout statements to console.log - improved to handle std::cout and endl
      jsCode = jsCode
        // First, handle std::endl and endl replacements
        .replace(/std::endl/g, '"\\n"')
        .replace(/endl/g, '"\\n"')
        // Handle std::cout statements with proper concatenation
        .replace(/std::cout\s*<<\s*([^;]+)\s*<<\s*std::endl\s*;/g, 'console.log($1);')
        .replace(/std::cout\s*<<\s*([^;]+)\s*<<\s*endl\s*;/g, 'console.log($1);')
        .replace(/std::cout\s*<<\s*([^;]+)\s*;/g, 'console.log($1);')
        // Handle regular cout statements
        .replace(/cout\s*<<\s*([^;]+)\s*<<\s*endl\s*;/g, 'console.log($1);')
        .replace(/cout\s*<<\s*([^;]+)\s*;/g, 'console.log($1);');
      
      // Step 4: Convert C++ classes to JavaScript classes
      jsCode = jsCode
        .replace(/class\s+(\w+)\s*{/g, 'class $1 {')
        .replace(/private:/g, '')
        .replace(/public:/g, '')
        .replace(/protected:/g, '');
      
      // Step 5: Convert C++ structs to JavaScript objects
      jsCode = jsCode
        .replace(/struct\s+(\w+)\s*{/g, 'class $1 {')
        .replace(/(\w+)\s+(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*;/g, 'constructor($2, $3, $4, $5) { this.$2 = $2; this.$3 = $3; this.$4 = $4; this.$5 = $5; }');
      
      // Step 6: Convert C++ constructors to JavaScript constructors - improved
      jsCode = jsCode
        .replace(/(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*([^}]*)\s*{/g, 'constructor($2) { $3')
        .replace(/(\w+)\s*\(\s*([^)]*)\s*\)\s*{/g, 'constructor($2) {')
        // Handle empty constructors
        .replace(/constructor\(\)\s*{\s*}/g, 'constructor() { }')
        // Clean up any malformed constructors
        .replace(/constructor\s*\(\s*\)\s*{\s*([^}]*)\s*}/g, 'constructor() { $1 }');
      
      // Step 7: Convert C++ types to JavaScript
      jsCode = jsCode
        .replace(/\bint\b/g, 'let')
        .replace(/\bdouble\b/g, 'let')
        .replace(/\bstring\b/g, 'let')
        .replace(/\bvector\b/g, 'Array')
        .replace(/\bconst\b/g, '')
        .replace(/\bauto\b/g, 'let');
      
      // Step 8: Convert C++ vector operations
      jsCode = jsCode
        .replace(/\.push_back\(/g, '.push(')
        .replace(/\.size\(\)/g, '.length');
      
      // Step 9: Convert C++ for loops
      jsCode = jsCode
        .replace(/for\s*\(\s*const\s+auto\s*&\s*(\w+)\s*:\s*(\w+)\s*\)/g, 'for (let $1 of $2)')
        .replace(/for\s*\(\s*auto\s*&\s*(\w+)\s*:\s*(\w+)\s*\)/g, 'for (let $1 of $2)')
        .replace(/for\s*\(\s*(\w+)\s+(\w+)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)/g, 'for (let $2 = $3; $4; $5)');
      
      // Step 10: Convert C++ function declarations
      jsCode = jsCode
        .replace(/(\w+)\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*{/g, '$2($3) {');
      
      // Step 11: Convert C++ return statements
      jsCode = jsCode
        .replace(/return\s+([^;]+);/g, 'return $1;');
      
      // Step 12: Convert C++ variable declarations - improved to avoid invalid syntax
      jsCode = jsCode
        .replace(/(\w+)\s+(\w+)\s*=\s*([^;]+);/g, 'let $2 = $3;')
        .replace(/(\w+)\s+(\w+)\s*;/g, 'let $2;')
        // Clean up any remaining invalid declarations
        .replace(/let\s+(\d+);/g, '// Removed invalid declaration: let $1;')
        .replace(/let\s+(\d+)\s*=\s*([^;]+);/g, '// Removed invalid assignment: let $1 = $2;');
      
      // Step 13: Convert C++ operators
      jsCode = jsCode
        .replace(/\|\|/g, '||')
        .replace(/&&/g, '&&')
        .replace(/!=/g, '!==')
        .replace(/==/g, '===');
      
      // Step 14: Convert C++ constants
      jsCode = jsCode
        .replace(/\bNAN\b/g, 'NaN')
        .replace(/\btrue\b/g, 'true')
        .replace(/\bfalse\b/g, 'false');
      
      // Step 15: Convert C++ math functions
      jsCode = jsCode
        .replace(/\bpow\s*\(/g, 'Math.pow(')
        .replace(/\bsqrt\s*\(/g, 'Math.sqrt(')
        .replace(/\babs\s*\(/g, 'Math.abs(');
      
      // Step 15.5: Clean up any remaining C++ syntax issues
      jsCode = jsCode
        // Remove any remaining << operators that weren't caught
        .replace(/\s*<<\s*/g, ' + ')
        // Clean up any double semicolons
        .replace(/;;/g, ';')
        // Remove any empty statements
        .replace(/;\s*}/g, '}')
        .replace(/;\s*$/g, '');
      
      // Step 16: Handle main function
      jsCode = jsCode
        .replace(/int\s+main\s*\(\s*[^)]*\s*\)\s*{([^}]*)return\s+0;\s*}/s, 'function main() { $1 }')
        .replace(/int\s+main\s*\(\s*[^)]*\s*\)\s*{([^}]*)}/s, 'function main() { $1 }');
      
      // Step 17: Add main function call and ensure proper execution
      jsCode = jsCode + '\n\n// Execute main function\nif (typeof main === "function") {\n  try {\n    main();\n  } catch (error) {\n    console.error("Error in main function:", error);\n  }\n}';
      
      return jsCode;
    } catch (error) {
      throw new Error(`C++ transpilation failed: ${error.message}`);
    }
  };

  // Simple Python to JavaScript transpiler for basic code
  const transpilePythonToJs = (pythonCode) => {
    let jsCode = pythonCode
      // Convert print statements
      .replace(/print\s*\(\s*([^)]+)\s*\)/g, 'print($1)')
      // Convert Python comments to JS comments
      .replace(/#\s*(.+)/g, '// $1')
      // Convert def to function
      .replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g, 'function $1($2) {')
      // Convert if statements
      .replace(/if\s+([^:]+):/g, 'if ($1) {')
      // Convert elif to else if
      .replace(/elif\s+([^:]+):/g, '} else if ($1) {')
      // Convert else
      .replace(/else\s*:/g, '} else {')
      // Convert for loops (basic)
      .replace(/for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:/g, 'for (let $1 = 0; $1 < $2; $1++) {')
      .replace(/for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*:/g, 'for (let $1 = $2; $1 < $3; $1++) {')
      // Convert while loops
      .replace(/while\s+([^:]+):/g, 'while ($1) {')
      // Convert return statements
      .replace(/return\s+(.+)/g, 'return $1;')
      // Convert variable assignments (basic)
      .replace(/(\w+)\s*=\s*([^=\n]+)/g, 'let $1 = $2;')
      // Convert string formatting (basic)
      .replace(/f"([^"]*{[^}]*}[^"]*)"/g, '`$1`')
      .replace(/{(\w+)}/g, '${$1}')
      // Add closing braces for indented blocks (simplified)
      .replace(/\n\s{4,}(.+)/g, '\n    $1')
      // Convert True/False to true/false
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      // Convert None to null
      .replace(/\bNone\b/g, 'null')
      // Convert and/or operators
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!')
      // Add semicolons to statements
      .replace(/([^{}\s;])\s*\n/g, '$1;\n')
      // Close function blocks (simplified)
      .split('\n').map(line => {
        if (line.trim().startsWith('function') || line.trim().startsWith('if') || 
            line.trim().startsWith('for') || line.trim().startsWith('while') ||
            line.trim().includes('} else')) {
          return line;
        }
        return line;
      }).join('\n') + '\n}'; // Close any open blocks
    
    return jsCode;
  };

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

  // New file creation function
  const handleCreateNewFile = () => {
    if (!newFileName.trim()) {
      showAlertMessage('Please enter a file name', 'warning');
      return;
    }

    // Add file extension if not provided
    let fileName = newFileName.trim();
    if (!fileName.includes('.')) {
      // Default to .js if no extension
      fileName += '.js';
    }

    // Create the new file
    if (onCreateNewFile) {
      // Find the selected folder name
      const selectedFolder = availableFolders.find(f => f.id === newFileFolder);
      
      onCreateNewFile({
        fileName: fileName,
        folder: newFileFolder, // Folder ID
        folderName: selectedFolder ? selectedFolder.name : 'All Resources', // Folder name for reference
        initialContent: getInitialContentForFile(fileName),
        openInIDE: true
      });
    }

    // Reset dialog state
    setNewFileName('');
    setNewFileFolder(availableFolders.length > 0 ? availableFolders[0].id : 0);
    setShowNewFileDialog(false);
    
    showAlertMessage(`File "${fileName}" created successfully!`, 'success');
  };

  // Get initial content based on file type
  const getInitialContentForFile = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const templates = {
      js: `// ${fileName}
// Created on ${new Date().toLocaleDateString()}

console.log("Hello from ${fileName}!");

function main() {
  // Your code here
}

main();
`,
      jsx: `// ${fileName}
// Created on ${new Date().toLocaleDateString()}

import React from 'react';

const ComponentName = () => {
  return (
    <div>
      <h1>Hello from ${fileName}!</h1>
    </div>
  );
};

export default ComponentName;
`,
      ts: `// ${fileName}
// Created on ${new Date().toLocaleDateString()}

console.log("Hello from ${fileName}!");

function main(): void {
  // Your code here
}

main();
`,
      tsx: `// ${fileName}
// Created on ${new Date().toLocaleDateString()}

import React from 'react';

interface Props {
  // Define props here
}

const ComponentName: React.FC<Props> = () => {
  return (
    <div>
      <h1>Hello from ${fileName}!</h1>
    </div>
  );
};

export default ComponentName;
`,
      py: `# ${fileName}
# Created on ${new Date().toLocaleDateString()}

def main():
    print(f"Hello from ${fileName}!")
    # Your code here

if __name__ == "__main__":
    main()
`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
</head>
<body>
    <h1>Hello from ${fileName}!</h1>
    <!-- Your content here -->
</body>
</html>
`,
      css: `/* ${fileName} */
/* Created on ${new Date().toLocaleDateString()} */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}
`,
      md: `# ${fileName}

Created on ${new Date().toLocaleDateString()}

## Overview

Your content here...

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

\`\`\`javascript
// Example code
console.log("Hello World!");
\`\`\`
`,
      json: `{
  "name": "${fileName.replace('.json', '')}",
  "version": "1.0.0",
  "description": "Created on ${new Date().toLocaleDateString()}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "",
  "license": "MIT"
}
`
    };

    return templates[extension] || `// ${fileName}
// Created on ${new Date().toLocaleDateString()}

// Your code here...
`;
  };

  // GitHub push function
  const pushToGitHub = async () => {
    if (!isGitHubFile || !githubInfo || !hasUnsavedChanges) {
      showAlertMessage('No changes to push or not a GitHub file', 'warning');
      return;
    }

    // Get GitHub token from localStorage (set by the main app)
    const githubToken = localStorage.getItem('github_token');
    if (!githubToken) {
      showAlertMessage('Please connect to GitHub first in the AI Assistant tab', 'error');
      return;
    }

    setIsPushingToGitHub(true);
    
    try {
      // First, get the file's current SHA (required for updates)
      const getFileResponse = await fetch(
        `https://api.github.com/repos/${githubInfo.repoFullName}/contents/${githubInfo.filePath}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      let sha = null;
      if (getFileResponse.ok) {
        const fileData = await getFileResponse.json();
        sha = fileData.sha;
      }

      // Prepare the update payload
      const updatePayload = {
        message: `Update ${githubInfo.filePath} via Enhanced Web IDE`,
        content: btoa(unescape(encodeURIComponent(code))), // Base64 encode the content
        branch: githubInfo.branch || 'main'
      };

      if (sha) {
        updatePayload.sha = sha; // Required for updating existing files
      }

      // Push the changes
      const updateResponse = await fetch(
        `https://api.github.com/repos/${githubInfo.repoFullName}/contents/${githubInfo.filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        }
      );

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        setOriginalContent(code); // Update the original content
        setHasUnsavedChanges(false);
        
        showAlertMessage('Successfully pushed to GitHub!', 'success');
        
        // Add success message to chat
        const successMessage = {
          id: Date.now(),
          role: 'assistant',
          content: `🎉 **Successfully pushed to GitHub!**

**Repository:** ${githubInfo.repoFullName}
**File:** ${githubInfo.filePath}
**Commit:** ${result.commit.sha.substring(0, 7)}

Your changes have been saved to the repository. Great work! 🚀`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, successMessage]);
        
        // Notify parent component about the change
        if (onFileChange) {
          onFileChange(code);
        }
      } else {
        const error = await updateResponse.text();
        throw new Error(`GitHub API error: ${updateResponse.status} - ${error}`);
      }
    } catch (error) {
      console.error('Error pushing to GitHub:', error);
      showAlertMessage(`Failed to push to GitHub: ${error.message}`, 'error');
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `❌ **Failed to push to GitHub**

**Error:** ${error.message}

**Troubleshooting:**
- Check your GitHub token is valid
- Ensure you have write access to the repository
- Verify the file path and repository name are correct

Your changes are still saved locally in the IDE.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsPushingToGitHub(false);
    }
  };

  const executeCode = async () => {
    try {
      setOutput('Executing code...\n');
      
      if (language === 'python') {
        // Execute Python code using Pyodide
        if (!pyodide) {
          setOutput(prev => prev + '❌ Python runtime not loaded. Please wait or try again.\n');
          return;
        }
        
        try {
          // Simple and reliable Python output capture
          let capturedOutput = '';
          
          // Override Python's print function to capture output
          pyodide.globals.set('print', (...args) => {
            const output = args.join(' ');
            capturedOutput += output + '\n';
            setOutput(prev => prev + output + '\n');
          });
          
          try {
            // Execute the Python code directly
            await pyodide.runPythonAsync(code);
            
            // If no output was captured, show a message
            if (!capturedOutput.trim()) {
              setOutput(prev => prev + '(No output produced)\n');
            }
          } finally {
            // Restore the original print function
            pyodide.globals.set('print', pyodide.globals.get('print'));
          }
          
          setOutput(prev => prev + '✅ Python code executed successfully!\n');
        } catch (error) {
          setOutput(prev => prev + '❌ Python Error: ' + error.message + '\n');
        }
      } else if (language === 'typescript') {
        // Execute TypeScript code with improved transpilation that preserves console.log
        try {
          // Step-by-step TypeScript to JavaScript conversion
          let jsCode = code;
          
          // First, preserve console.log statements by marking them
          const consoleStatements = [];
          jsCode = jsCode.replace(/(console\.[a-zA-Z]+\([^)]*\);?)/g, (match, statement) => {
            const index = consoleStatements.length;
            consoleStatements.push(statement);
            return `__CONSOLE_PLACEHOLDER_${index}__`;
          });
          
          // Now do the type stripping - more comprehensive approach
          jsCode = jsCode
            // Remove import/export statements
            .replace(/^import\s+.*?from\s+['"][^'"]*['"];?\s*$/gm, '')
            .replace(/^export\s+/gm, '')
            
            // Handle interfaces - completely remove them
            .replace(/interface\s+\w+\s*{[^}]*}/g, '')
            
            // Handle type aliases - remove them
            .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
            
            // Remove access modifiers first
            .replace(/\b(private|public|protected|readonly)\s+/g, '')
            
            // Remove generic type parameters
            .replace(/<[^>]*>/g, '')
            
            // Handle class property type annotations (more comprehensive)
            .replace(/(\w+):\s*[^=;,)]+\s*=/g, '$1 =')
            .replace(/(\w+):\s*[^=;,)]+\s*;/g, '$1;')
            .replace(/(\w+):\s*[^=;,)]+\s*,/g, '$1,')
            
            // Remove type annotations from function parameters (improved)
            .replace(/\(([^)]*)\):\s*[^{=]+\s*{/g, (match, params) => {
              const cleanParams = params.replace(/:\s*[^,)]+/g, '');
              return `(${cleanParams}) {`;
            })
            
            // Remove return type annotations
            .replace(/\):\s*[^{=]+\s*{/g, ') {')
            .replace(/\):\s*[^{=]+\s*=>/g, ') =>')
            
            // Remove type annotations from variables
            .replace(/:\s*[^=;,)]+\s*=/g, ' =')
            .replace(/:\s*[^=;,)]+\s*;/g, ';')
            .replace(/:\s*[^=;,)]+\s*,/g, ',')
            
            // Handle as keyword (type assertions)
            .replace(/\s+as\s+\w+/g, '')
            
            // Remove optional property markers
            .replace(/\?:/g, ':')
            
            // Final cleanup - remove any remaining orphaned colons
            .replace(/:\s*([,;)])/g, '$1')
            .replace(/:\s*$/gm, '')
            
            // Clean up extra spaces
            .replace(/\s+/g, ' ')
            .replace(/\s*([{}();,=])\s*/g, '$1 ')
            .trim();

          // Restore console statements
          consoleStatements.forEach((statement, index) => {
            jsCode = jsCode.replace(`__CONSOLE_PLACEHOLDER_${index}__`, statement);
          });

          const sandbox = {
            console: {
              log: (...args) => setOutput(prev => prev + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n'),
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
            isFinite,
            Array,
            Object,
            String,
            Number,
            Boolean
          };

          const result = new Function(...Object.keys(sandbox), jsCode);
          result(...Object.values(sandbox));
          
          setOutput(prev => prev + '\n✅ TypeScript code executed successfully!');
        } catch (error) {
          setOutput(prev => prev + '\n❌ TypeScript Error: ' + error.message);
          setOutput(prev => prev + '\n💡 Tip: Some TypeScript features may not be supported in browser execution');
        }
              } else if (language === 'java') {
          // Execute Java code using built-in transpiler
          if (!cheerpj) {
            setOutput(prev => prev + '❌ Java execution environment not ready. Please wait or try again.\n');
            return;
          }
          
          try {
            setOutput(prev => prev + '☕ Executing Java code using built-in transpiler...\n');
            
            // Transpile Java to JavaScript
            const jsCode = cheerpj.transpile(code);
            
            // Debug: Show transpiled code for troubleshooting
            setOutput(prev => prev + '\n🔍 Transpiled JavaScript:\n' + jsCode + '\n');
          
          const sandbox = {
            console: {
              log: (...args) => setOutput(prev => prev + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n'),
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
            isFinite,
            Array,
            Object,
            String,
            Number,
            Boolean
          };

          const result = new Function(...Object.keys(sandbox), jsCode);
          result(...Object.values(sandbox));
          
          setOutput(prev => prev + '\n✅ Java code executed successfully!');
          setOutput(prev => prev + '\n💡 Note: Using basic Java-to-JavaScript transpiler for browser compatibility');
        } catch (error) {
          setOutput(prev => prev + '\n❌ Java Error: ' + error.message);
          setOutput(prev => prev + '\n💡 Try simpler Java code or switch to JavaScript/Python for full feature support\n');
        }
      } else if (language === 'cpp') {
        // Execute C++ code using proper C++ runtime
        if (!emscripten) {
          setOutput(prev => prev + '❌ C++ runtime not loaded. Please wait or try again.\n');
          return;
        }
        
        try {
          setOutput(prev => prev + '⚙️ Executing C++ code...\n');
          
          // Try to use proper C++ execution first
          if (emscripten.execute) {
            const result = await emscripten.execute(code);
            if (result) {
              // If execute returns transpiled code, run it
              const jsCode = result;
              setOutput(prev => prev + '\n🔍 Using transpiled JavaScript (fallback):\n' + jsCode + '\n');
              
              const sandbox = {
                console: {
                  log: (...args) => setOutput(prev => prev + args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                  ).join(' ') + '\n'),
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
                isFinite,
                Array,
                Object,
                String,
                Number,
                Boolean
              };

              const resultFunc = new Function(...Object.keys(sandbox), jsCode);
              resultFunc(...Object.values(sandbox));
            }
          } else {
            // Fallback to transpiler
            const jsCode = emscripten.transpile(code);
            setOutput(prev => prev + '\n🔍 Transpiled JavaScript (fallback):\n' + jsCode + '\n');
          
          const sandbox = {
            console: {
              log: (...args) => setOutput(prev => prev + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n'),
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
            isFinite,
            Array,
            Object,
            String,
            Number,
            Boolean
          };

          const result = new Function(...Object.keys(sandbox), jsCode);
          result(...Object.values(sandbox));
          
          setOutput(prev => prev + '\n✅ C++ code executed successfully!');
          setOutput(prev => prev + '\n💡 Note: Using transpiler fallback for browser compatibility');
        }
        } catch (error) {
          setOutput(prev => prev + '\n❌ C++ Error: ' + error.message);
        }
      } else if (language === 'html') {
        // Execute HTML code by rendering it
        try {
          setOutput(prev => prev + '🌐 Rendering HTML...\n');
          
          // Create a new window/tab to display the HTML
          const htmlWindow = window.open('', '_blank');
          htmlWindow.document.write(code);
          htmlWindow.document.close();
          
          setOutput(prev => prev + '✅ HTML rendered in new tab successfully!\n');
          setOutput(prev => prev + '💡 Check the new browser tab to see your HTML page\n');
        } catch (error) {
          setOutput(prev => prev + '\n❌ HTML Error: ' + error.message);
        }
      } else if (language === 'css') {
        // Execute CSS code by applying it to a demo HTML
        try {
          setOutput(prev => prev + '🎨 Applying CSS styles...\n');
          
          const demoHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Demo</title>
    <style>
${code}
    </style>
</head>
<body>
    <div class="container">
        <h1>CSS Demo</h1>
        <p>This is a demo page to showcase your CSS styles.</p>
        <div class="demo-box">Demo Box</div>
        <button class="demo-button">Demo Button</button>
        <ul class="demo-list">
            <li>List Item 1</li>
            <li>List Item 2</li>
            <li>List Item 3</li>
        </ul>
    </div>
</body>
</html>`;
          
          // Create a new window/tab to display the CSS demo
          const cssWindow = window.open('', '_blank');
          cssWindow.document.write(demoHTML);
          cssWindow.document.close();
          
          setOutput(prev => prev + '✅ CSS applied to demo page successfully!\n');
          setOutput(prev => prev + '💡 Check the new browser tab to see your CSS in action\n');
        } catch (error) {
          setOutput(prev => prev + '\n❌ CSS Error: ' + error.message);
        }
      } else if (language === 'json') {
        // Execute JSON code by parsing and validating it
        try {
          setOutput(prev => prev + '📋 Parsing JSON...\n');
          
          // First, try to parse as JSON
          const parsedJSON = JSON.parse(code);
          setOutput(prev => prev + '✅ JSON is valid!\n');
          setOutput(prev => prev + '\n📋 Parsed JSON:\n');
          setOutput(prev => prev + JSON.stringify(parsedJSON, null, 2) + '\n');
          
          // Show some JSON statistics
          const stats = {
            type: Array.isArray(parsedJSON) ? 'Array' : typeof parsedJSON,
            keys: typeof parsedJSON === 'object' && parsedJSON !== null ? Object.keys(parsedJSON).length : 0,
            length: Array.isArray(parsedJSON) ? parsedJSON.length : undefined
          };
          
          setOutput(prev => prev + '\n📊 JSON Statistics:\n');
          setOutput(prev => prev + `Type: ${stats.type}\n`);
          if (stats.keys > 0) setOutput(prev => prev + `Keys: ${stats.keys}\n`);
          if (stats.length !== undefined) setOutput(prev => prev + `Length: ${stats.length}\n`);
          
          // If it looks like JavaScript code, suggest switching languages
          if (code.includes('console.log') || code.includes('function') || code.includes('class')) {
            setOutput(prev => prev + '\n💡 Tip: This looks like JavaScript code. Consider switching to "JavaScript" language for code execution.\n');
          }
          
        } catch (error) {
          setOutput(prev => prev + '\n❌ JSON Error: ' + error.message);
          
          // Check if it looks like JavaScript code
          if (code.includes('console.log') || code.includes('function') || code.includes('class') || code.includes('//')) {
            setOutput(prev => prev + '\n💡 This appears to be JavaScript code, not JSON data.\n');
            setOutput(prev => prev + '💡 Try switching the language to "JavaScript" to execute this code.\n');
            setOutput(prev => prev + '💡 Or if you want to create JSON data, use the JSON template.\n');
          } else {
            setOutput(prev => prev + '\n💡 Check your JSON syntax - common issues:\n');
            setOutput(prev => prev + '  • Missing quotes around strings\n');
            setOutput(prev => prev + '  • Trailing commas\n');
            setOutput(prev => prev + '  • Unescaped characters\n');
          }
        }
      } else {
        // Execute JavaScript code (existing logic)
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
        
        setOutput(prev => prev + '\n✅ JavaScript code executed successfully!');
      }
    } catch (error) {
      setOutput(prev => prev + '\n❌ Error: ' + error.message);
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
            <Chip 
              label={language.toUpperCase()} 
              size="small" 
              color={language === 'python' ? 'success' : 'primary'}
              sx={{ ml: 1 }}
            />
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                label="Language"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      zIndex: isFullscreen ? 10000 : 1300, // Higher z-index in fullscreen
                    },
                  },
                }}
              >
                <MenuItem value="javascript">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🟨</span> JavaScript
                  </Box>
                </MenuItem>
                <MenuItem value="typescript">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🔷</span> TypeScript
                  </Box>
                </MenuItem>
                <MenuItem value="python">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🐍</span> Python
                    {isPyodideLoading && <CircularProgress size={12} />}
                    {pyodide && <span style={{ color: 'green' }}>✓</span>}
                  </Box>
                </MenuItem>
                <MenuItem value="java">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>☕</span> Java
                    {isCheerpjLoading && <CircularProgress size={12} />}
                    {cheerpj && <span style={{ color: 'green' }}>✓</span>}
                  </Box>
                </MenuItem>
                <MenuItem value="cpp">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>⚙️</span> C++
                    {isEmscriptenLoading && <CircularProgress size={12} />}
                    {emscripten && <span style={{ color: 'green' }}>✓</span>}
                  </Box>
                </MenuItem>
                <MenuItem value="html">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🌐</span> HTML
                  </Box>
                </MenuItem>
                <MenuItem value="css">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🎨</span> CSS
                  </Box>
                </MenuItem>
                <MenuItem value="json">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>📋</span> JSON
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="🤖 AI Assistant - Generate code, explain, refactor (Ctrl+Shift+A)">
              <Button
                variant="contained"
                startIcon={<SmartToyIcon />}
                onClick={() => {
                  // Trigger the AI panel in the RealAICopilotIntegration
                  const event = new CustomEvent('openAIPanel');
                  window.dispatchEvent(event);
                }}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                🤖 AI Assistant
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

            <Tooltip title={`${copilotEnabled ? 'Disable' : 'Enable'} GitHub Copilot`}>
              <IconButton
                onClick={() => setCopilotEnabled(!copilotEnabled)}
                sx={{ 
                  color: copilotEnabled ? 'success.main' : 'grey.500',
                  '&:hover': { color: copilotEnabled ? 'success.dark' : 'grey.700' }
                }}
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Create a new file">
              <Button
                variant="outlined"
                startIcon={<NoteAddIcon />}
                onClick={() => setShowNewFileDialog(true)}
                sx={{ 
                  color: 'success.main',
                  borderColor: 'success.main',
                  '&:hover': {
                    borderColor: 'success.dark',
                    backgroundColor: 'success.light',
                    color: 'success.contrastText',
                  }
                }}
              >
                New File
              </Button>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setShowSaveDialog(true)}
            >
              Save
            </Button>

            {/* GitHub Push Button - only show for GitHub files */}
            {isGitHubFile && (
              <Tooltip title={hasUnsavedChanges ? "Push changes to GitHub" : "No changes to push"}>
                <Button
                  variant="contained"
                  startIcon={isPushingToGitHub ? <CircularProgress size={16} color="inherit" /> : <GitHubIcon />}
                  onClick={pushToGitHub}
                  disabled={!hasUnsavedChanges || isPushingToGitHub}
                  sx={{ 
                    background: hasUnsavedChanges 
                      ? 'linear-gradient(45deg, #2196F3 30%, #42A5F5 90%)' 
                      : 'linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)',
                    '&:hover': {
                      background: hasUnsavedChanges 
                        ? 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)'
                        : 'linear-gradient(45deg, #757575 30%, #9E9E9E 90%)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #E0E0E0 30%, #F5F5F5 90%)'
                    }
                  }}
                >
                  {isPushingToGitHub ? 'Pushing...' : (hasUnsavedChanges ? 'Push to GitHub' : 'No Changes')}
                </Button>
              </Tooltip>
            )}
            
            <Button
              variant="contained"
              startIcon={
                (isPyodideLoading && language === 'python') || 
                (isCheerpjLoading && language === 'java') || 
                (isEmscriptenLoading && language === 'cpp') 
                  ? <CircularProgress size={16} color="inherit" /> 
                  : <PlayArrowIcon />
              }
              onClick={executeCode}
              disabled={
                (isPyodideLoading && language === 'python') || 
                (isCheerpjLoading && language === 'java') || 
                (isEmscriptenLoading && language === 'cpp')
              }
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)'
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)'
                }
              }}
            >
              {isPyodideLoading && language === 'python' ? 'Loading Python...' : 
               isCheerpjLoading && language === 'java' ? 'Loading Java...' :
               isEmscriptenLoading && language === 'cpp' ? 'Loading C++...' : 'Run'}
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
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
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
            
            {/* Real AI Copilot Integration - Always Enabled for Cursor-like Experience */}
            <RealAICopilotIntegration
              editorRef={editorRef}
              code={code}
              language={language}
              onCodeChange={setCode}
              context={{
                filePath: fileName,
                projectType: 'web-development',
                framework: language === 'javascript' ? 'react' : language === 'typescript' ? 'react-ts' : 'general'
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

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onClose={() => setShowNewFileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="success" />
          Create New File
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new file in your local workspace. The file will be stored in your file explorer.
          </Typography>
          
          <TextField
            fullWidth
            label="File Name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="e.g., myComponent.js, styles.css, README.md"
            sx={{ mb: 3 }}
            helperText="Add file extension (.js, .css, .html, etc.) or it will default to .js"
          />
          
          <FormControl fullWidth>
            <InputLabel>Folder Location</InputLabel>
            <Select
              value={newFileFolder}
              onChange={(e) => setNewFileFolder(e.target.value)}
              label="Folder Location"
            >
              {availableFolders.length > 0 ? (
                availableFolders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>
                    📁 {folder.name}
                    {folder.path && folder.path !== folder.name && (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({folder.path})
                      </Typography>
                    )}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={0}>📁 All Resources (Root)</MenuItem>
              )}
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.dark">
              💡 <strong>Tip:</strong> The file will be created with a starter template based on its extension and automatically opened in the IDE for editing.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowNewFileDialog(false);
              setNewFileName('');
              setNewFileFolder(availableFolders.length > 0 ? availableFolders[0].id : 0);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateNewFile}
            variant="contained"
            startIcon={<NoteAddIcon />}
            sx={{ 
              background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)'
              }
            }}
          >
            Create File
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
