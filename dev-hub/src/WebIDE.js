import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, IconButton, Button, Drawer, 
  TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Divider, Chip, Alert, CircularProgress
} from '@mui/material';
import { llmIntegration } from './llm-integration';
import MonacoEditor from '@monaco-editor/react';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const WebIDE = ({ selectedFile, onFileChange }) => {
  const defaultCode = `// Welcome to the Web IDE!
// Start coding here...

function helloWorld() {
  console.log("Hello, World!");
  return "Welcome to DevHub IDE!";
}

// Example: Generate a simple calculator
function calculator(a, b, operation) {
  switch(operation) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default: return "Invalid operation";
  }
}

helloWorld();`;

  const [code, setCode] = useState(defaultCode);
  
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('untitled.js');

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
        'json': 'json',
        'md': 'markdown'
      };
      setLanguage(languageMap[extension] || 'javascript');
    } else {
      setCode(defaultCode);
      setFileName('untitled.js');
      setLanguage('javascript');
    }
  }, [selectedFile, defaultCode]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // Listen for global AI code application
  useEffect(() => {
    const handleSetIdeCode = (event) => {
      const { code } = event.detail;
      if (code && editorRef.current) {
        editorRef.current.setValue(code);
        setCode(code);
        setAlertMessage('Code applied from AI assistant!');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    };

    window.addEventListener('setIdeCode', handleSetIdeCode);
    return () => window.removeEventListener('setIdeCode', handleSetIdeCode);
  }, []);

  const executeCode = async () => {
    try {
      setOutput('Executing code...\n');
      
      // Create a safe execution environment
      const sandbox = {
        console: {
          log: (...args) => {
            setOutput(prev => prev + args.join(' ') + '\n');
          },
          error: (...args) => {
            setOutput(prev => prev + 'ERROR: ' + args.join(' ') + '\n');
          }
        },
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval
      };

      // Execute the code
      const result = new Function('console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', code);
      result(sandbox.console, sandbox.setTimeout, sandbox.setInterval, sandbox.clearTimeout, sandbox.clearInterval);
      
      setOutput(prev => prev + 'Code executed successfully!\n');
    } catch (error) {
      setOutput(prev => prev + `Error: ${error.message}\n`);
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
  };



  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon color="primary" />
            Web IDE
            {selectedFile && (
              <>
                <span style={{ margin: '0 8px' }}>•</span>
                <span style={{ fontWeight: 'normal', color: '#666' }}>{fileName}</span>
              </>
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                label="Language"
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
              </Select>
            </FormControl>
            
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
            >
              Run
            </Button>
            

          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Code Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MonacoEditor
            height="60vh"
            language={language}
            value={code}
            onChange={(value) => {
          setCode(value);
          // Update the file content in the parent component
          if (onFileChange && selectedFile) {
            onFileChange(value);
          }
        }}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              theme: 'vs-dark'
            }}
          />
          
          {/* Output */}
          <Box sx={{ flex: 1, p: 2, bgcolor: 'grey.900', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Output:</Typography>
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              {output || 'No output yet. Click "Run" to execute your code.'}
            </Box>
          </Box>
        </Box>


      </Box>

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
          severity="success"
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

export default WebIDE; 