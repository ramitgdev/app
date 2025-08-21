import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { Tree, getDescendants } from "@minoru/react-dnd-treeview";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useGoogleLogin } from '@react-oauth/google';
import { ThemeProvider } from '@mui/material/styles';
import { modernTheme } from './ModernTheme';
// --- NEW: Material-UI imports ---
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Paper, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, TextField, InputAdornment, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip, Avatar, Stack, Snackbar, Alert, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, CssBaseline, Container, Grid, Card, CardContent, CardActions, Tabs, Tab, ListItemAvatar, CircularProgress, SpeedDial, SpeedDialAction, SpeedDialIcon, Fab, Badge, LinearProgress, Accordion, AccordionSummary, AccordionDetails, ListItemSecondaryAction
} from '@mui/material';

import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import ShareIcon from '@mui/icons-material/Share';
import GitHubIcon from '@mui/icons-material/GitHub';
import LogoutIcon from '@mui/icons-material/Logout';
import SendIcon from '@mui/icons-material/Send';
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import StorageIcon from '@mui/icons-material/Storage';
import './AppModern.css';
import MonacoEditor from '@monaco-editor/react';
import { TreeView, TreeItem } from '@mui/lab';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DrawIcon from '@mui/icons-material/Draw';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VideocamIcon from '@mui/icons-material/Videocam';
import WaveformIcon from '@mui/icons-material/GraphicEq';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BrushIcon from '@mui/icons-material/Brush';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';
import CreateIcon from '@mui/icons-material/Create';
import BuildIcon from '@mui/icons-material/Build';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import OptimizeIcon from '@mui/icons-material/Tune';
import RefactorIcon from '@mui/icons-material/Transform';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import EnhancedAudioRecorder from './EnhancedAudioRecorder';
import AICodeReviewer from './AICodeReviewer';
import { initiateGitHubLogin, handleGitHubCallback } from './github-oauth';
import { GitHubAPI, sanitizeRepoName, convertFilesToGitHubFormat, validateGitHubToken } from './github-utils';
import GoogleSlidesEditor from './GoogleSlidesEditor';
import FlowchartEditor from './FlowchartEditor';
import CanvaEditor from './CanvaEditor';
import GoogleDriveInterface from './GoogleDriveInterface';
import GoogleDrivePicker from './GoogleDrivePicker';

import { llmIntegration } from './llm-integration';
import './test-claude-integration';

import WebIDE from './WebIDE';
import EnhancedWebIDE from './EnhancedWebIDE';
import EnhancedChatSystem from './EnhancedChatSystem';

// Import workspace file operations
import { 
  loadWorkspaceData, 
  createWorkspaceFile, 
  updateWorkspaceFile, 
  deleteWorkspaceFile,
  convertDatabaseFileToLocal 
} from './workspace-file-operations';

// Import Supabase client
import { supabase } from './supabaseClient';
import supabaseWorkspaceStorage from './supabase-workspace-storage';
// import supabaseFileStorage from './supabase-file-storage'; // Not used in this file

import EnhancedAIAssistant from './EnhancedAIAssistant';
import StorageTest from './StorageTest';
import EnvTest from './env-test';
import SupabaseFileMigration from './SupabaseFileMigration';

// Make supabase available globally for debugging
window.supabase = supabase;
window.supabaseWorkspaceStorage = supabaseWorkspaceStorage;

// Use the modern theme
const theme = modernTheme;

// Embedded Google Docs Editor Component
function EmbeddedGoogleDocsEditor({ docUrl, googleToken, onExit }) {
  const [docId, setDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!docUrl || !googleToken) return;
    
    setLoading(true);
    setError('');
    
    // Extract document ID from URL
    const match = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Doc URL');
      setLoading(false);
      return;
    }
    
    setDocId(match[1]);
    setLoading(false);
  }, [docUrl, googleToken]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading Google Docs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!docId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Please enter a valid Google Doc URL</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Google Docs Editor
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            onClick={() => window.open(`https://docs.google.com/document/d/${docId}/edit`, '_blank')}
            startIcon={<GoogleIcon />}
          >
            Open in New Tab
          </Button>
          <Button 
            variant="outlined" 
            sx={{ 
              color: 'secondary.main',
              borderColor: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.dark',
                backgroundColor: 'secondary.light',
                color: 'secondary.contrastText',
              }
            }}
            onClick={onExit}
            startIcon={<CloseIcon />}
          >
            Exit
          </Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <iframe
          src={`https://docs.google.com/document/d/${docId}/edit?usp=sharing`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
          title="Google Docs Editor"
        />
      </Box>
    </Box>
  );
}

// Embedded Google Sheets Editor Component
function EmbeddedGoogleSheetsEditor({ sheetUrl, googleToken, onExit }) {
  const [sheetId, setSheetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setSheetError] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI spreadsheet assistant. I can help you edit cells, add data, create formulas, analyze your spreadsheet, and provide insights. What would you like me to help you with?",
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [sheetData, setSheetData] = useState(null);

  useEffect(() => {
    if (!sheetUrl || !googleToken) return;
    setLoading(true);
    setSheetError('');
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setSheetError('Invalid Google Sheet URL');
      setLoading(false);
      return;
    }
    setSheetId(match[1]);
    setLoading(false);
  }, [sheetUrl, googleToken]);

  // Local function to extract sheet operations from user input
  const extractSheetOperationLocal = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Extract cell reference - look for patterns like "cell B29", "B29", etc.
    let cell = 'A1'; // default
    const cellPatterns = [
      /(?:on|in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i,
      /(?:add|insert|put|update|set)\s+(?:a\s+)?(?:formula\s+)?(?:to\s+)?(?:cell\s+)?([A-Z]+\d+)/i,
      /([A-Z]+\d+)/i
    ];
    
    for (const pattern of cellPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        cell = match[1];
        break;
      }
    }
    
    // Check if this is a formula request
    const isFormulaRequest = lowerInput.includes('formula') || 
                            lowerInput.includes('calculate') || 
                            lowerInput.includes('average') || 
                            lowerInput.includes('sum') ||
                            lowerInput.includes('count') ||
                            lowerInput.includes('max') ||
                            lowerInput.includes('min');
    
    let data = '';
    let isFormula = false;
    
    if (isFormulaRequest) {
      // Handle formula requests
      if (lowerInput.includes('average') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=AVERAGE(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('sum') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=SUM(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('count') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=COUNT(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('max') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=MAX(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('min') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=MIN(B1:B28)';
        isFormula = true;
      } else {
        // Generic formula construction based on keywords
        if (lowerInput.includes('average')) {
          data = '=AVERAGE()';
          isFormula = true;
        } else if (lowerInput.includes('sum')) {
          data = '=SUM()';
          isFormula = true;
        } else if (lowerInput.includes('count')) {
          data = '=COUNT()';
          isFormula = true;
        }
      }
    } else {
      // Handle regular data requests
      const dataMatch = input.match(/(?:add|insert|put|update|set)\s+(?:data\s+)?(?:to\s+)?(?:cell\s+)?[A-Z]+\d+[:\s]+(.+)/i);
      data = dataMatch ? dataMatch[1].trim() : '';
      isFormula = data.startsWith('=');
    }
    
    // Extract row data
    const rowMatch = input.match(/(?:add|insert)\s+(?:row\s+)?(?:with\s+)?(?:data\s+)?(.+)/i);
    const rowData = rowMatch ? rowMatch[1].split(',').map(d => d.trim()) : [];
    
    // Extract column data
    const colMatch = input.match(/(?:add|insert)\s+(?:column\s+)?(?:with\s+)?(?:data\s+)?(.+)/i);
    const colData = colMatch ? colMatch[1].split(',').map(d => d.trim()) : [];
    
    return {
      cell,
      data,
      isFormula,
      rowData,
      colData,
      type: rowData.length > 0 ? 'row' : colData.length > 0 ? 'column' : 'cell'
    };
  };

  // Fetch sheet data when sheetId changes
  useEffect(() => {
    if (sheetId && googleToken) {
      fetchSheetData();
    }
  }, [sheetId, googleToken]);

  const fetchSheetData = async () => {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=true`,
        {
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sheet data: ${response.status}`);
      }

      const data = await response.json();
      setSheetData(data);
      console.log('Sheet data fetched:', data);
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      setSheetError(`Failed to fetch sheet data: ${error.message}`);
    }
  };

  const updateCell = async (range, value, formula = null) => {
    try {
      const body = {
        values: [[formula || value]]
      };

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=${formula ? 'USER_ENTERED' : 'RAW'}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update cell: ${response.status}`);
      }

      // Refresh sheet data
      await fetchSheetData();
      return true;
    } catch (error) {
      console.error('Error updating cell:', error);
      return false;
    }
  };

  const addRow = async (values, rowIndex = null) => {
    try {
      const range = rowIndex ? `A${rowIndex}:Z${rowIndex}` : 'A:Z';
      const body = {
        values: [values]
      };

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add row: ${response.status}`);
      }

      await fetchSheetData();
      return true;
    } catch (error) {
      console.error('Error adding row:', error);
      return false;
    }
  };

  const addColumn = async (values, columnIndex = null) => {
    try {
      const columnLetter = columnIndex ? String.fromCharCode(65 + columnIndex) : 'Z';
      const range = `${columnLetter}1:${columnLetter}`;
      const body = {
        values: values.map(value => [value])
      };

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add column: ${response.status}`);
      }

      await fetchSheetData();
      return true;
    } catch (error) {
      console.error('Error adding column:', error);
      return false;
    }
  };

  const handleAISend = async () => {
    if (!aiInput.trim() || isAILoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    const currentInput = aiInput;
    setAiInput('');
    setIsAILoading(true);

    try {
      // Check if this is a data operation that should be handled by the Global AI Agent
      const input = currentInput.toLowerCase();
      const isDataOperation = input.includes('add') || input.includes('insert') || input.includes('put') || 
                              input.includes('update') || input.includes('set') || input.includes('create');
      
      if (isDataOperation) {
        // Route to Global AI Agent for data operations
        const intent = {
          type: 'apply_sheet_data',
          request: currentInput,
          operation: extractSheetOperationLocal(currentInput)
        };
        
        // Dispatch event to Global AI Agent
        const event = new CustomEvent('globalAISheetOperation', { 
          detail: { intent, sheetUrl, sheetId } 
        });
        window.dispatchEvent(event);
        
        response = `🔄 **Routing to Global AI Agent...**
        
I've sent your request to the Global AI Agent for processing. The agent will:
• Analyze your request
• Apply the changes to your Google Sheet
• Provide feedback on the operation

You can also use the Global AI Agent directly from the main interface for more advanced operations!`;
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        setAiMessages(prev => [...prev, assistantMessage]);
        return;
      }

      // Handle local operations (analysis, help, etc.)
      let response = '';
      let actionTaken = false;

      if (input.includes('analyze') || input.includes('summarize') || input.includes('insights')) {
        // Analyze sheet content
        if (sheetData && sheetData.sheets && sheetData.sheets[0]) {
          const sheet = sheetData.sheets[0];
          const gridData = sheet.data?.[0];
          if (gridData && gridData.rowData) {
            const rows = gridData.rowData.filter(row => row.values && row.values.some(cell => cell.formattedValue));
            const totalRows = rows.length;
            const totalColumns = gridData.columnMetadata?.length || 0;
            const nonEmptyCells = rows.reduce((count, row) => 
              count + (row.values?.filter(cell => cell.formattedValue).length || 0), 0);
            
            response = `📊 **Sheet Analysis:**
• **Total Rows:** ${totalRows}
• **Total Columns:** ${totalColumns}
• **Non-empty Cells:** ${nonEmptyCells}
• **Sheet Name:** ${sheet.properties?.title || 'Untitled'}

${rows.length > 0 ? `**Sample Data (first 3 rows):**
${rows.slice(0, 3).map((row, i) => 
  `Row ${i + 1}: ${row.values?.map(cell => cell.formattedValue || '').join(' | ')}`
).join('\n')}` : 'Sheet appears to be empty'}`;
          } else {
            response = "Sheet appears to be empty or couldn't be analyzed.";
          }
        } else {
          response = "Unable to analyze sheet. Please make sure the sheet contains data.";
        }
        actionTaken = true;
      } else if (input.includes('help') || input.includes('what can you do')) {
        response = `🤖 **I can help you with Google Sheets! Here's what I can do:**

📝 **Data Operations (via Global AI Agent):**
• Add data to specific cells: "Add data to cell A1: Hello World"
• Insert formulas: "Add formula to cell B1: =SUM(A1:A10)"
• Add new rows: "Add row with data: Name, Age, City"
• Add new columns: "Add column with data: Header1, Header2, Header3"

📊 **Analysis:**
• Analyze sheet content: "Analyze this sheet"
• Get insights: "Summarize the data"
• Count rows/columns: "How many rows are there?"

🔧 **Tips:**
• Use cell references like A1, B2, C3
• Formulas should start with = (e.g., =SUM(), =AVERAGE())
• Data operations are handled by the Global AI Agent for better integration
• I can read your sheet content to provide better assistance

What would you like me to help you with?`;
        actionTaken = true;
      } else {
        // General response for other queries
        response = `I understand you want to work with your Google Sheet. I can help you:
• Analyze your sheet content and provide insights
• Answer questions about your data
• Provide guidance on sheet operations

For data operations (adding/editing cells, formulas, rows, columns), I'll route your request to the Global AI Agent which has full access to modify your sheet.

Try asking me to "analyze this sheet" or ask for help with specific operations!`;
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        actionTaken,
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading Google Sheets...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }
  if (!sheetId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Please enter a valid Google Sheet URL</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          AI-Enhanced Google Sheets Editor
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant={showAIChat ? "contained" : "outlined"} 
            onClick={() => setShowAIChat(!showAIChat)}
            startIcon={<SmartToyIcon />}
          >
            AI Assistant
          </Button>
          <Button variant="outlined" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, '_blank')}>
            Open in New Tab
          </Button>
          <Button variant="outlined" onClick={onExit}>Exit</Button>
        </Stack>
      </Box>
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Sheet Editor */}
        <Box sx={{ flex: showAIChat ? 2 : 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', transition: 'flex 0.3s ease' }}>
          <iframe
            src={`https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            allowFullScreen
            title="Google Sheets Editor"
          />
        </Box>

        {/* AI Assistant Sidebar */}
        {showAIChat && (
          <Box sx={{ 
            flex: 1, 
            borderLeft: '1px solid #e0e0e0', 
            bgcolor: 'background.paper',
            display: 'flex', 
            flexDirection: 'column',
            minWidth: 350
          }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" fontWeight={600}>
                🤖 AI Spreadsheet Assistant
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                I can help you edit cells, add formulas, and analyze your data
              </Typography>
            </Box>

            {/* Chat Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {aiMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
              {isAILoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              )}
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask me to add data, formulas, or analyze your sheet..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAISend()}
                  disabled={isAILoading}
                />
                <Button
                  variant="contained"
                  onClick={handleAISend}
                  disabled={!aiInput.trim() || isAILoading}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <SendIcon />
                </Button>
              </Box>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                Try: "Add data to cell A1: Hello World" or "Analyze this sheet"
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Embedded Google Slides Editor Component
function EmbeddedGoogleSlidesEditor({ slidesUrl, googleToken, onExit }) {
  const [presentationId, setPresentationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slidesUrl || !googleToken) return;
    setLoading(true);
    setError('');
    const match = slidesUrl.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Slides URL');
      setLoading(false);
      return;
    }
    setPresentationId(match[1]);
    setLoading(false);
  }, [slidesUrl, googleToken]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading Google Slides...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }
  if (!presentationId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Please enter a valid Google Slides URL</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Google Slides Editor
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => window.open(`https://docs.google.com/presentation/d/${presentationId}/edit`, '_blank')}>
            Open in New Tab
          </Button>
          <Button variant="outlined" onClick={onExit}>Exit</Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <iframe
          src={`https://docs.google.com/presentation/d/${presentationId}/edit?usp=sharing`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
          title="Google Slides Editor"
        />
      </Box>
    </Box>
  );
}

// Embedded Google Drawings Editor Component
function EmbeddedGoogleDrawingsEditor({ drawingUrl, googleToken, onExit }) {
  const [drawingId, setDrawingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!drawingUrl || !googleToken) return;
    setLoading(true);
    setError('');
    const match = drawingUrl.match(/\/drawings\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Drawing URL');
      setLoading(false);
      return;
    }
    setDrawingId(match[1]);
    setLoading(false);
  }, [drawingUrl, googleToken]);

  if (loading) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Typography>Loading Google Drawing...</Typography></Box>);
  if (error) return (<Box sx={{ p: 2, color: 'error.main' }}><Typography>{error}</Typography></Box>);
  if (!drawingId) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Typography>Please enter a valid Google Drawing URL</Typography></Box>);

  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>Google Drawings Editor</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => window.open(`https://docs.google.com/drawings/d/${drawingId}/edit`, '_blank')}>Open in New Tab</Button>
          <Button variant="outlined" onClick={onExit}>Exit</Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <iframe
          src={`https://docs.google.com/drawings/d/${drawingId}/edit?usp=sharing`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
          title="Google Drawings Editor"
        />
      </Box>
    </Box>
  );
}

// Embedded Google Sites Viewer
function EmbeddedGoogleSitesViewer({ siteUrl, onExit }) {
  const [authUserIndex, setAuthUserIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  if (!siteUrl) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Please enter a valid Google Sites URL</Typography>
      </Box>
    );
  }
  const urlWithAuth = siteUrl.includes('authuser=') ? siteUrl : (siteUrl + (siteUrl.includes('?') ? `&authuser=${authUserIndex}` : `?authuser=${authUserIndex}`));
  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>Google Sites</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">Account</Typography>
          <TextField size="small" value={authUserIndex} onChange={(e) => setAuthUserIndex(Number(e.target.value) || 0)} select sx={{ width: 88 }}>
            {[0,1,2,3].map(idx => (<MenuItem key={idx} value={idx}>{`authuser=${idx}`}</MenuItem>))}
          </TextField>
          <Button variant="outlined" onClick={() => setReloadKey(k => k + 1)}>Reload</Button>
          <Button variant="outlined" onClick={() => window.open(urlWithAuth, '_blank')}>Open in New Tab</Button>
          <Button variant="outlined" onClick={onExit}>Exit</Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <iframe key={reloadKey} src={urlWithAuth} width="100%" height="100%" style={{ border: 'none' }} title="Google Sites" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        If editing is blocked in the embed, use "Open in New Tab" to edit with your full Google session.
      </Typography>
    </Box>
  );
}

// Embedded Looker Studio Viewer
function EmbeddedLookerStudioViewer({ reportUrl, onExit }) {
  const [authUserIndex, setAuthUserIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  if (!reportUrl) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Please enter a valid Looker Studio URL</Typography>
      </Box>
    );
  }
  const toEmbedUrl = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('lookerstudio.google.com')) {
        if (!u.pathname.includes('/embed/')) {
          u.pathname = u.pathname.replace('/reporting/', '/embed/reporting/');
        }
        if (!u.searchParams.has('authuser')) u.searchParams.set('authuser', String(authUserIndex));
        return u.toString();
      }
    } catch {}
    return url;
  };
  const embedUrl = toEmbedUrl(reportUrl);
  const newTabUrl = reportUrl.includes('authuser=') ? reportUrl : (reportUrl + (reportUrl.includes('?') ? `&authuser=${authUserIndex}` : `?authuser=${authUserIndex}`));
  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>Looker Studio</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">Account</Typography>
          <TextField size="small" value={authUserIndex} onChange={(e) => setAuthUserIndex(Number(e.target.value) || 0)} select sx={{ width: 88 }}>
            {[0,1,2,3].map(idx => (<MenuItem key={idx} value={idx}>{`authuser=${idx}`}</MenuItem>))}
          </TextField>
          <Button variant="outlined" onClick={() => setReloadKey(k => k + 1)}>Reload</Button>
          <Button variant="outlined" onClick={() => window.open(newTabUrl, '_blank')}>Open in New Tab</Button>
          <Button variant="outlined" onClick={onExit}>Exit</Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <iframe key={reloadKey} src={embedUrl} width="100%" height="100%" style={{ border: 'none' }} title="Looker Studio" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        Editing Looker Studio reports is not supported in iframes. Use "Open in New Tab" to edit.
      </Typography>
    </Box>
  );
}

// Embedded Google Forms Editor Component
function EmbeddedGoogleFormsEditor({ formUrl, googleToken, onExit }) {
  const [formId, setFormId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authUserIndex, setAuthUserIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!formUrl || !googleToken) return;
    setLoading(true);
    setError('');
    const match = formUrl.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Form URL');
      setLoading(false);
      return;
    }
    setFormId(match[1]);
    setLoading(false);
  }, [formUrl, googleToken]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading Google Form...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }
  if (!formId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Please enter a valid Google Form URL</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Google Forms Editor
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">Account</Typography>
          <TextField
            size="small"
            value={authUserIndex}
            onChange={(e) => setAuthUserIndex(Number(e.target.value) || 0)}
            select
            sx={{ width: 88 }}
          >
            {[0,1,2,3].map(idx => (
              <MenuItem key={idx} value={idx}>{`authuser=${idx}`}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={() => setReloadKey(k => k + 1)}>Reload</Button>
          <Button variant="outlined" onClick={() => window.open(`https://docs.google.com/forms/d/${formId}/edit?authuser=${authUserIndex}`, '_blank')}>
            Open in New Tab
          </Button>
          <Button variant="outlined" onClick={onExit}>Exit</Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <iframe
          key={reloadKey}
          src={`https://docs.google.com/forms/d/${formId}/edit?usp=sharing&authuser=${authUserIndex}`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
          title="Google Forms Editor"
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        If you see "You need access", try changing the account selector above. Some browsers block third-party cookies; opening in a new tab will also use your signed-in Google session.
      </Typography>
    </Box>
  );
}

// Local GitHub Editor Component
function LocalGitHubEditor({ repoFullName, filePath, githubToken, onExit }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update via DevHub');

  useEffect(() => {
    if (!repoFullName || !filePath) return;
    
    setLoading(true);
    setError('');
    
    // Fetch file content from GitHub API
    if (githubToken) {
      fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching file:', err);
        setError(`Failed to load file: ${err.message}`);
        setLoading(false);
      });
    } else {
      // Fallback: simulate content for demo
      setContent(`// ${filePath}
// This is a simulated file content
// In a real implementation, this would be fetched from GitHub API

function example() {
  console.log('Hello from ${filePath}');
}

export default example;`);
      setLoading(false);
    }
  }, [repoFullName, filePath, githubToken]);

  const handleSave = async () => {
    if (!githubToken) {
      alert('GitHub token required to save changes. Please connect your GitHub account first.');
      return;
    }

    try {
      setLoading(true);
      
      // Get current file SHA
      const shaResponse = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!shaResponse.ok) {
        throw new Error('Could not get file SHA');
      }
      
      const shaData = await shaResponse.json();
      
      // Update file
      const updateResponse = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: btoa(unescape(encodeURIComponent(content))),
          sha: shaData.sha,
          branch: 'main'
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update file');
      }
      
      alert('File updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error saving file:', err);
      alert(`Failed to save: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading file...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {repoFullName}/{filePath}
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Commit message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            sx={{ width: 200 }}
          />
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
          <Button 
            variant="outlined" 
            sx={{ 
              color: 'secondary.main',
              borderColor: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.dark',
                backgroundColor: 'secondary.light',
                color: 'secondary.contrastText',
              }
            }}
            onClick={onExit}
            startIcon={<CloseIcon />}
          >
            Exit
          </Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1 }}>
        <MonacoEditor
          height="100%"
          language="javascript"
          value={content}
          onChange={setContent}
          options={{ 
            fontSize: 14, 
            minimap: { enabled: false },
            wordWrap: 'on',
            theme: 'vs-dark'
          }}
        />
      </Box>
    </Box>
  );
}

// Collapsible Section Component
function CollapsibleSection({ title, children, expanded, onToggle, icon, color = "primary" }) {
  return (
    <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
      <Box 
        onClick={onToggle}
        sx={{ 
          p: 2, 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: expanded ? (color === 'secondary' ? 'secondary.light' : `${color}.50`) : 'transparent',
          '&:hover': { bgcolor: color === 'secondary' ? 'secondary.light' : `${color}.25` }
        }}
      >
        {icon}
        <Typography variant="h6" sx={{ ml: 1, flex: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      {expanded && (
        <Box sx={{ p: 2, pt: 0 }}>
          {children}
        </Box>
      )}
    </Card>
  );
}


window.onerror = function (msg, url, line, col, error) {
  console.error("Global error caught:", { msg, url, line, col, error });
};
window.onunhandledrejection = (event) => {
  console.error("Unhandled promise rejection:", event.reason);
};

/*const [googleToken, setGoogleToken] = useState(null);

// Handler to invoke GIS sign-in popup and store token
const loginWithGoogle = useGoogleLogin({
  scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file',
  flow: 'implicit',
  onSuccess: (tokenResponse) => {
    setGoogleToken(tokenResponse.access_token); // save it for Docs API use
  },
  onError: (error) => {
    alert("Google login failed: " + error.error || "Unknown error");
    setGoogleToken(null);
  }
});*/

// ---- Supabase initialization ----

const ROOT_ID = 0;


// Counter for generating unique folder IDs
let folderIdCounter = 1000;

function makeFolder(name, parent, id = null) {
  return {
    id: id ?? ++folderIdCounter, // Use simple counter to ensure INTEGER compatibility
    parent,
    text: name,
    droppable: true
  };
}

// Function to generate unique folder IDs that don't conflict with existing ones
async function generateUniqueFolderIds(workspaceId, count) {
  console.log(`🔍 Generating ${count} unique folder IDs for workspace ${workspaceId}`);
  
  // Get existing folder IDs from the database
  const { data: existingFolders, error } = await supabase
    .from('workspace_folders')
    .select('id')
    .eq('workspace_id', workspaceId);
  
  if (error) {
    console.error('❌ Error fetching existing folders:', error);
    throw error;
  }
  
  const existingIds = new Set(existingFolders?.map(f => f.id) || []);
  console.log(`📁 Found ${existingIds.size} existing folder IDs:`, Array.from(existingIds).slice(0, 10));
  
  // Find the next available ID
  let nextId = Math.max(1000, ...existingIds) + 1;
  console.log(`🆔 Starting from ID: ${nextId}`);
  
  const ids = [];
  for (let i = 0; i < count; i++) {
    // Ensure we don't exceed PostgreSQL INTEGER limits
    if (nextId > 2147483647) {
      nextId = 1000; // Reset if we get too high
    }
    ids.push(nextId++);
  }
  
  console.log(`✅ Generated ${ids.length} unique folder IDs:`, ids.slice(0, 5));
  return ids;
}
function makeFileNode(res) {
  return {
    id: res.id,
    parent: res.folder,
    text: res.title,
    droppable: false,
    origResource: res
  };
}
function combineToTree(folders, resources) {
  return [
    ...folders.map(f => ({ ...f, droppable: true })),
    ...resources.map(makeFileNode)
  ];
}
function folderOptionsFlat(folders, parent = ROOT_ID, level = 0, visited = new Set()) {
  if (visited.has(parent)) return [];
  visited.add(parent);
  const result = [];
  folders.filter(f => f.parent === parent).forEach(f => {
    result.push(
      <option key={f.id} value={f.id}>
        {Array(level * 2).fill("\u00A0").join("")}{f.text}
      </option>
    );
    result.push(...folderOptionsFlat(folders, f.id, level + 1, new Set([...visited])));
  });
  return result;
}
function folderPathArr(folders, folderId) {
  const path = [];
  let fid = folderId;
  const visited = new Set();
  while (fid && !visited.has(fid)) {
    visited.add(fid);
    const fol = folders.find(f => f.id === fid);
    if (!fol) break;
    path.unshift(fol);
    fid = fol.parent;
  }
  if (!path.find(f => f.id === ROOT_ID)) {
    const root = folders.find(f => f.id === ROOT_ID);
    if (root) path.unshift(root);
  }
  return path;
}
function getDescendantFolderIds(folders, startId, visited = new Set()) {
  if (visited.has(startId)) return [];
  visited.add(startId);
  let ids = [startId];
  for (const f of folders.filter(f => f.parent === startId)) {
    ids = ids.concat(getDescendantFolderIds(folders, f.id, visited));
  }
  return ids;
}
function getDescendantFolders(folders, id) {
  return getDescendantFolderIds(folders, id).slice(1);
}

// ---- Workspace-scoped local storage keys ----
function saveData(wsKey, key, data) {
  try {
    // Only store minimal metadata (no large blobs or file contents)
    const minimalData = Array.isArray(data)
      ? data.map(item => {
          if (item && typeof item === 'object') {
            // Remove large fields if present
            const { content, body, ...rest } = item;
            return rest;
          }
          return item;
        })
      : data;
    localStorage.setItem(`${key}-${wsKey}`, JSON.stringify(minimalData));
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      console.warn("Storage quota exceeded for localStorage. This is expected for large imports - data will be saved to Supabase instead.");
      // Don't show alert for large imports - they should use Supabase
      return false; // Indicate failure
    } else {
      throw error;
    }
  }
  return true; // Indicate success
}
function loadData(wsKey, key, defaultValue) {
  const data = localStorage.getItem(`${key}-${wsKey}`);
  return data ? JSON.parse(data) : defaultValue;
}

// ---- Supabase auth helpers ----
function useSupabaseAuthUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let ignore = false;
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!ignore && session?.user) setUser(session.user);
    }
    loadSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);
  return user;
}

// ---- Workspace Creation UI ----
function WorkspaceCreator({ currentUser, onCreated }) {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  async function createWorkspace() {
    if (!name) return;
    const { data, error } = await supabase
      .from('workspaces')
      .insert([{ name, owner_id: currentUser.id }])
      .select().single();
    if (error) setMsg(error.message);
    else {
      // Add owner as a member
      const memberRes = await supabase.from('workspace_members').insert([{
        workspace_id: data.id,
        user_email: currentUser.email,
        user_id: currentUser.id,
        status: 'accepted'
      }]);
      if (memberRes.error) {
        setMsg('Workspace created, but failed to add owner as member: ' + memberRes.error.message);
        console.error('Failed to add owner as member:', memberRes.error);
      } else {
        setMsg("Workspace created!");
        setName("");
        onCreated && onCreated(data);
      }
    }
  }
  return (
    <Card className="mui-card" sx={{ my: 2, p: 2, maxWidth: 400 }}>
      <Typography variant="h6" fontWeight={700} mb={1}>Create Workspace</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Workspace Name"
          size="small"
          sx={{ flex: 1 }}
        />
        <Button variant="contained" color="primary" onClick={createWorkspace} startIcon={<AddIcon />}>Create</Button>
      </Stack>
      {msg && <Typography variant="body2" color="primary" mt={1}>{msg}</Typography>}
    </Card>
  );
}

// --- Email notification helpers (placeholder) ---
async function sendEmailNotification(to, subject, message) {
  // TODO: Integrate with Supabase email, SendGrid, or another email service
  // For now, just log to console
  console.log(`Email to ${to}: ${subject}\n${message}`);
}

// --- Update WorkspaceShare to send email on invite ---
function WorkspaceShare({ workspaceId, currentUser, onShared, onInviteSuccess, workspaceName }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [showInvitedList, setShowInvitedList] = useState(false);

  // Fetch invited members
  useEffect(() => {
    async function fetchInvitedMembers() {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_email,
          role,
          invited_at,
          accepted_at,
          users!workspace_members_invited_by_fkey(full_name, email)
        `)
        .eq('workspace_id', workspaceId);
      
      if (!error && data) {
        setInvitedMembers(data);
      }
    }
    fetchInvitedMembers();
  }, [workspaceId]);

  async function handleInvite() {
    if (!inviteEmail) return;
    
    setLoading(true);
    setInviteMsg("");

    try {
      // Get workspace and inviter details
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('name, description')
        .eq('id', workspaceId)
        .single();
      
      if (workspaceError) {
        setInviteMsg(`Error: Workspace not found`);
        return;
      }

      // Add user to workspace_members
      const inviteData = { 
        workspace_id: workspaceId,
        user_email: inviteEmail, 
        invited_by: currentUser.id,
        role: 'member',
        invited_at: new Date().toISOString(),
        accepted_at: null
      };
      
      console.log('Creating invite with data:', inviteData);
      
      console.log('About to insert invite data:', inviteData);
      
      const { data: inviteResult, error: memberError } = await supabase
        .from('workspace_members')
        .upsert([inviteData])
        .select();

      if (memberError) {
        console.error('Error creating invite:', memberError);
        console.error('Error details:', memberError.details);
        console.error('Error hint:', memberError.hint);
        setInviteMsg(`Error: ${memberError.message}`);
        return;
      }

      console.log('Invite created successfully:', inviteResult);

      // Verify the invite was actually created
      const { data: verifyInvite, error: verifyError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_email', inviteEmail);

      console.log('Verification - invite in database:', verifyInvite);
      if (verifyError) {
        console.error('Verification error:', verifyError);
      }

      // Send email via Express server
      try {
        const response = await fetch('http://localhost:3000/api/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: inviteEmail,
            workspace_id: workspaceId,
            inviter_id: currentUser.id,
            message: inviteMessage
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Email sent successfully:', result);
        } else {
          console.log('Email service not available (server not running), but invite was created in database');
        }
      } catch (emailError) {
        console.log('Email service error (server not running):', emailError.message);
        console.log('Invite was created in database successfully');
      }

      setInviteMsg(`Successfully invited ${inviteEmail} to "${workspace.name}"!`);
    setInviteEmail("");
      setInviteMessage("");
      
      // Refresh invited members list
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_email,
          role,
          invited_at,
          accepted_at,
          users!workspace_members_invited_by_fkey(full_name, email)
        `)
        .eq('workspace_id', workspaceId);
      
      if (!error && data) {
        setInvitedMembers(data);
      }
    onInviteSuccess && onInviteSuccess();

    } catch (error) {
      setInviteMsg(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(memberId, userEmail) {
    if (!window.confirm(`Are you sure you want to remove ${userEmail} from this workspace?`)) return;
    
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId);
    
    if (!error) {
      setInvitedMembers(invitedMembers.filter(m => m.id !== memberId));
      setInviteMsg(`${userEmail} removed from workspace`);
    } else {
      setInviteMsg(`Error removing member: ${error.message}`);
    }
  }

  return (
    <Dialog open onClose={onShared} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ShareIcon />
          Share Workspace: {workspaceName}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Invite New Members</Typography>
        <TextField
          autoFocus
          margin="dense"
              label="Email address"
          type="email"
          fullWidth
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
            />
            <TextField
              margin="dense"
              label="Personal message (optional)"
              multiline
              rows={2}
              fullWidth
              value={inviteMessage}
              onChange={e => setInviteMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
            />
            {inviteMsg && (
              <Alert severity={inviteMsg.includes('Error') ? 'error' : 'success'} sx={{ mt: 1 }}>
                {inviteMsg}
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Workspace Members</Typography>
              <Button
                size="small"
                onClick={() => setShowInvitedList(!showInvitedList)}
                startIcon={showInvitedList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showInvitedList ? 'Hide' : 'Show'} Members
              </Button>
            </Box>
            
            {showInvitedList && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                {invitedMembers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No members invited yet
                  </Typography>
                ) : (
                  <List dense>
                    {invitedMembers.map((member) => (
                      <ListItem key={member.id} divider>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.user_email}
                          secondary={
                            <Box>
                              <Chip 
                                size="small" 
                                label={member.accepted_at ? 'Active' : 'Pending'} 
                                color={member.accepted_at ? 'success' : 'warning'}
                                sx={{ mr: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {member.accepted_at ? 'Joined' : 'Invited'} on{' '}
                                {new Date(member.accepted_at || member.invited_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveMember(member.id, member.user_email)}
                            disabled={member.user_email === currentUser.email}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onShared} startIcon={<CloseIcon />}>Close</Button>
        <Button 
          onClick={handleInvite} 
          variant="contained" 
          startIcon={<ShareIcon />}
          disabled={!inviteEmail || loading}
        >
          {loading ? 'Sending...' : 'Send Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- GITHUB IMPORT FEATURE ----
function ImportGithubIntoApp({ addFoldersAndResources, folderOptions, workspaceId }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [folder, setFolder] = useState(ROOT_ID);
  const [status, setStatus] = useState("");
  return (
    <div>
      <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
        placeholder="GitHub repo URL" style={{width: 220, marginRight: 7}}/>
      <select value={folder} onChange={e => setFolder(Number(e.target.value))}>
        {folderOptions}
      </select>
      <button
        onClick={async () => {
          setStatus("Importing...");
          const { count, error } = await importGithubTreeWithFoldersAccurate(
            repoUrl, folder, addFoldersAndResources, workspaceId
          );
          setStatus(error ? `Error: ${error}` : `Imported ${count} files!`);
          setRepoUrl("");
        }}>
        Import
      </button>
      <span style={{ marginLeft: 10, color: status.includes("Error") ? "#c51313" : "green"}}>
        {status}
      </span>
    </div>
  );
}

/**
 * 100% precise fix: 
 * - Each folder is addressed by its repo-root-relative path.
 * - Each file is placed by its full parent path.
 * - No folder or file can ever be "mis-parented" due to naming collision.
 */
async function importGithubTreeWithFoldersAccurate(
  githubUrl, targetRootFolderId, addFoldersAndResources, workspaceId
) {
  // Parse owner/repo
  const m = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\/|$)/);
  if (!m) return { error: "Invalid GitHub repo URL" };
  const [_, owner, repo] = m;
  
  // Validate workspace ID
  if (!workspaceId) return { error: "No workspace selected" };
  
  // Step 1: create top-level folder for repo name
  const repoFolderName = repo;

  // Step 2: Fetch branch/tree
  const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoInfoRes.ok) return { error: "Repo not found or API error" };
  const repoInfo = await repoInfoRes.json();
  const branch = repoInfo.default_branch || "main";
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  if (!treeRes.ok) return { error: "GitHub tree fetch error" };
  const tree = await treeRes.json();

  // Step 3: Check if this repo is already imported
  const existingFolders = await supabaseWorkspaceStorage.loadFolders(workspaceId);
  const repoAlreadyExists = existingFolders.some(folder => 
    folder.text === repoFolderName && folder.parent === targetRootFolderId
  );
  
  if (repoAlreadyExists) {
    return { error: `Repository "${repoFolderName}" is already imported. Please delete the existing folder first.` };
  }
  
  // Count how many folders we'll need and generate IDs
  const folderCount = tree.tree.filter(item => item.type === "tree").length + 1; // +1 for root folder
  
  // Generate all folder IDs at once
  const folderIds = await generateUniqueFolderIds(workspaceId, folderCount);
  let idIndex = 0;
  
  const repoRootId = folderIds[idIndex++];
  // pathToId maps full relative _folder path_ to a node id. 
  // "" is the repo root.
  const pathToId = { "": repoRootId };
  const folders = [{
    id: repoRootId,
    parent: targetRootFolderId,
    text: repoFolderName,
    droppable: true
  }];

  // Step 4: Build a nested tree structure from the flat tree
  const folderMap = { "": { id: repoRootId, parent: targetRootFolderId, text: repoFolderName, droppable: true, children: [] } };
  for (const item of tree.tree) {
    if (item.type === "tree") {
      const parentPath = item.path.includes("/") ? item.path.split("/").slice(0, -1).join("/") : "";
      const thisId = folderIds[idIndex++];
      folderMap[item.path] = {
        id: thisId,
        parent: pathToId[parentPath] || repoRootId,
        text: item.path.split("/").pop(),
        droppable: true,
        children: []
      };
      pathToId[item.path] = thisId;
      // Add to parent's children
      if (folderMap[parentPath]) folderMap[parentPath].children.push(folderMap[item.path]);
    }
  }
  // Step 4: Add files to their parent folders
  const files = [];
  for (const item of tree.tree) {
    if (item.type === "blob") {
      const parentPath = item.path.includes("/") ? item.path.split("/").slice(0, -1).join("/") : "";
      const fileNode = {
        id: crypto.randomUUID(), // Use UUID for files (workspace_files table uses UUID primary key)
        title: item.path.split("/").pop(),
        platform: "GitHub",
        url: `https://github.com/${owner}/${repo}/blob/${branch}/${item.path}`,
        folder: pathToId[parentPath] || repoRootId,
        notes: "",
        tags: ""
      };
      files.push(fileNode);
      // Optionally, add to folderMap[parentPath].children for a true nested structure
    }
  }
  // Step 5: Flatten folders for the app's tree view
  const allFolders = Object.values(folderMap);
  await addFoldersAndResources(allFolders, files);
  return { count: files.length };
}
function isGoogleDocResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("https://docs.google.com/document/d/");
}

function isGitHubResource(ref) {
  return typeof ref.url === "string" && ref.url.includes("github.com");
}

function isGoogleSlidesResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("https://docs.google.com/presentation/d/");
}

function isFlowchartResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("flowchart://") || 
         (ref.type && ref.type === 'flowchart');
}

function isCanvaResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("canva://") || 
         (ref.type && ref.type === 'canva');
}

function isLucidchartResource(ref) {
  return typeof ref.url === "string" && ref.url.startsWith("lucidchart://") || 
         (ref.type && ref.type === 'lucidchart');
}

function isGoogleDriveResource(ref) {
  return ref && ref.url && (
    ref.url.includes('drive.google.com') || 
    ref.url.includes('docs.google.com') || 
    ref.url.includes('sheets.google.com') || 
    ref.url.includes('slides.google.com')
  );
}

function extractGitHubInfo(url) {
  try {
    // Handle various GitHub URL formats
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
  if (match) {
    return {
        owner: match[1],
        repo: match[2],
        branch: match[3],
        filePath: match[4],
        repoFullName: `${match[1]}/${match[2]}`
      };
    }
    
    // Handle raw.githubusercontent.com URLs
    const rawMatch = url.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/);
    if (rawMatch) {
      return {
        owner: rawMatch[1],
        repo: rawMatch[2],
        branch: rawMatch[3],
        filePath: rawMatch[4],
        repoFullName: `${rawMatch[1]}/${rawMatch[2]}`
      };
    }
    
    // Handle api.github.com URLs
    const apiMatch = url.match(/api\.github\.com\/repos\/([^\/]+)\/([^\/]+)\/contents\/(.+)/);
    if (apiMatch) {
      return {
        owner: apiMatch[1],
        repo: apiMatch[2],
        branch: 'main', // Default branch
        filePath: apiMatch[3],
        repoFullName: `${apiMatch[1]}/${apiMatch[2]}`
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting GitHub info:', error);
  return null;
  }
}
// import { useState, useEffect } from "react";
/*function GoogleDocEditor({ docUrl, googleToken, fetchGoogleDoc, insertTextGoogleDoc }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insertVal, setInsertVal] = useState('');
  const [inserting, setInserting] = useState(false);

  let documentId = "";
  const match = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match) documentId = match[1];

  useEffect(() => {
    if (!documentId || !googleToken) return;
    setLoading(true);
    setError('');
    fetchGoogleDoc(documentId)
      .then(doc => setContent(doc))
      .catch(e => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [documentId, googleToken, fetchGoogleDoc]);

  const handleInsert = async () => {
    setInserting(true);
    setError('');
    try {
      await insertTextGoogleDoc(documentId, insertVal);
      setInsertVal('');
      setContent(await fetchGoogleDoc(documentId));
    } catch (e) {
      setError(String(e.message || e));
    }
    setInserting(false);
  };

  if (!documentId) return <div style={{ color: "#c00" }}>Invalid Google Doc URL.</div>;

  return (
    <div>
      <div>
        <input
          placeholder="Insert text at start of doc"
          value={insertVal}
          onChange={e => setInsertVal(e.target.value)}
          style={{ width: 240 }}
          disabled={inserting || loading}
        />
        <button style={{ marginLeft: 6 }} onClick={handleInsert} disabled={!insertVal || inserting || loading}>Insert</button>
      </div>
      {error && <div style={{ color: "#c00", margin: "10px 0" }}>{error}</div>}
      {loading ? <div>Loading doc…</div> : content &&
      <pre style={{ maxHeight: 120, background: "#fcfcfc", border: "1px solid #dde", padding: 6, fontSize: "0.93em", marginTop: 8, overflow: "auto" }}>
        <b>Doc Title:</b> {content.title}{"\n"}
        <b>Body (JSON):</b> {JSON.stringify(content.body, null, 2)}
      </pre>}
      <div>
        <a target="_blank" href={docUrl} rel="noopener noreferrer">Open in Google Docs →</a>
      </div>
    </div>
  );
}*/
function GoogleDocEditor({ docUrl, googleToken }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insertVal, setInsertVal] = useState('');
  const [inserting, setInserting] = useState(false);

  let documentId = "";
  const match = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match) documentId = match[1];

  useEffect(() => {
    if (!documentId || !googleToken) return;
    setLoading(true);
    setError('');
    fetchGoogleDoc(documentId, googleToken)
      .then(doc => setContent(doc))
      .catch(e => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [documentId, googleToken]);

  const handleInsert = async () => {
    setInserting(true);
    setError('');
    try {
      await insertTextGoogleDoc(documentId, insertVal, googleToken);
      setInsertVal('');
      setContent(await fetchGoogleDoc(documentId, googleToken));
    } catch (e) {
      setError(String(e.message || e));
    }
    setInserting(false);
  };

  if (!documentId) return <div style={{ color: "#c00" }}>Invalid Google Doc URL.</div>;
  return (
    <div>
      <div>
        <input
          placeholder="Insert text at start of doc"
          value={insertVal}
          onChange={e => setInsertVal(e.target.value)}
          style={{ width: 240 }}
          disabled={inserting || loading}
        />
        <button style={{ marginLeft: 6 }} onClick={handleInsert} disabled={!insertVal || inserting || loading}>Insert</button>
      </div>
      {error && <div style={{ color: "#c00", margin: "10px 0" }}>{error}</div>}
      {loading ? <div>Loading doc…</div> : content &&
        <pre style={{ maxHeight: 120, background: "#fcfcfc", border: "1px solid #dde", padding: 6, fontSize: "0.93em", marginTop: 8, overflow: "auto" }}>
          <b>Doc Title:</b> {content.title}{"\n"}
          <b>Body (JSON):</b> {JSON.stringify(content.body, null, 2)}
        </pre>}
      {/* Embed the Google Docs editor in an iframe below the API controls */}
      <div style={{ marginTop: 18, border: '1px solid #dde', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <iframe
          title="Google Docs Editor"
          src={`https://docs.google.com/document/d/${documentId}/edit`}
          width="100%"
          height="600"
          style={{ border: 'none' }}
          allowFullScreen
        />
      </div>
    </div>
  );
}


async function fetchGoogleDoc(documentId, googleToken) {
  const res = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

async function insertTextGoogleDoc(documentId, text, googleToken) {
  const res = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${googleToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          insertText: {
            text,
            location: { index: 1 }
          }
        }]
      })
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Extract readable text content from Google Doc API response
function extractGoogleDocText(docData) {
  if (!docData || !docData.body || !docData.body.content) {
    return '';
  }

  let text = '';
  
  function processContent(content) {
    for (const element of content) {
      if (element.paragraph) {
        // Process paragraph elements
        if (element.paragraph.elements) {
          for (const elem of element.paragraph.elements) {
            if (elem.textRun && elem.textRun.content) {
              text += elem.textRun.content;
            }
          }
        }
      } else if (element.table) {
        // Process table elements
        if (element.table.tableRows) {
          for (const row of element.table.tableRows) {
            if (row.tableCells) {
              for (const cell of row.tableCells) {
                if (cell.content) {
                  processContent(cell.content);
                }
              }
            }
          }
        }
      } else if (element.tableOfContents) {
        // Process table of contents
        if (element.tableOfContents.content) {
          processContent(element.tableOfContents.content);
        }
      }
    }
  }

  processContent(docData.body.content);
  return text.trim();
}

async function fetchWorkspaceChats(workspaceId, myId, recipientId) {
  let query = supabase
    .from('workspace_chats')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', {ascending: true});
  if (recipientId) {
    query = query.or(`and(sender_id.eq.${myId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${myId})`);
  }
  const { data } = await query;
  return data || [];
}
async function sendWorkspaceChat(workspaceId, senderId, recipientId, text) {
  await supabase
    .from('workspace_chats')
    .insert([{workspace_id: workspaceId, sender_id: senderId, recipient_id: recipientId, message: text}]);
}

// --- GitHub Editor Component ---
function GitHubEditor({ repoFullName, filePath, githubToken, branch = 'main' }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [commitMsg, setCommitMsg] = useState('Update via DevHub');

  // Fetch file content from GitHub
  useEffect(() => {
    if (!repoFullName || !filePath || !githubToken) return;
    setLoading(true);
    setError('');
    fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`, {
      headers: { Authorization: `token ${githubToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setContent(atob(data.content.replace(/\n/g, '')));
        } else {
          setError(data.message || 'Failed to load file');
        }
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [repoFullName, filePath, githubToken, branch]);

  // Save (commit & push) changes to GitHub
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Get the current file SHA
      const res = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`, {
        headers: { Authorization: `token ${githubToken}` }
      });
      const data = await res.json();
      if (!data.sha) throw new Error('Could not get file SHA');
      // Commit the new content
      const updateRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMsg,
          content: btoa(unescape(encodeURIComponent(content))),
          sha: data.sha,
          branch
        })
      });
      const updateData = await updateRes.json();
      if (updateData.commit) {
        alert('File updated and pushed!');
      } else {
        throw new Error(updateData.message || 'Failed to update file');
      }
    } catch (e) {
      setError(String(e));
    }
    setSaving(false);
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <h3>GitHub Editor: {repoFullName}/{filePath}</h3>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? <div>Loading…</div> : (
        <MonacoEditor
          height="400px"
          language="javascript"
          value={content}
          onChange={setContent}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      )}
      <div style={{ marginTop: 12 }}>
        <input
          type="text"
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          style={{ width: 320, marginRight: 8 }}
          placeholder="Commit message"
        />
        <button onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Commit & Push'}
        </button>
      </div>
    </div>
  );
}

// --- GitHub OAuth Login ---
function GitHubLogin({ onToken }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  // Simple OAuth flow using a popup
  const handleLogin = () => {
    const clientId = "Iv1.0b2e6e6b7e7e6e6b"; // TODO: Replace with your GitHub OAuth App Client ID
    const redirectUri = window.location.origin + "/github-callback";
    const state = Math.random().toString(36).substring(2);
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&state=${state}`;
    const popup = window.open(url, "github-login", "width=600,height=700");
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "github_token") {
        setToken(event.data.token);
        onToken(event.data.token);
      }
    }, { once: true });
  };

  return (
    <div style={{ margin: '18px 0' }}>
      <button onClick={handleLogin}>Sign in with GitHub</button>
      {token && <div style={{ color: 'green', marginTop: 8 }}>GitHub Authenticated!</div>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}

// --- GitHub Repo File Tree ---
function GitHubRepoFileTree({ repoFullName, githubToken, branch = 'main', onFileSelect }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!repoFullName || !githubToken) return;
    setLoading(true);
    setError('');
    fetch(`https://api.github.com/repos/${repoFullName}/git/trees/${branch}?recursive=1`, {
      headers: { Authorization: `token ${githubToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.tree) setTree(data.tree);
        else setError(data.message || 'Failed to load tree');
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [repoFullName, githubToken, branch]);

  // Build a nested tree structure from the flat tree
  function buildTree(tree) {
    const root = { id: '', name: repoFullName, children: [] };
    const nodes = { '': root };
    for (const item of tree) {
      const parts = item.path.split('/');
      let parent = '';
      for (let i = 0; i < parts.length; i++) {
        const id = parts.slice(0, i + 1).join('/');
        if (!nodes[id]) {
          nodes[id] = {
            id,
            name: parts[i],
            children: [],
            type: i === parts.length - 1 ? item.type : 'tree',
          };
          nodes[parent].children.push(nodes[id]);
        }
        parent = id;
      }
    }
    return root;
  }
  const nestedTree = buildTree(tree);

  function renderTree(node) {
    if (!node) return null;
    return (
      <TreeItem
        key={node.id}
        nodeId={node.id || '/'}
        label={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {node.type === 'tree' ? <FolderIcon fontSize="small" /> : <InsertDriveFileIcon fontSize="small" />}
            <span style={{ marginLeft: 6 }}>{node.name}</span>
          </span>
        }
        onClick={e => {
          e.stopPropagation();
          if (node.type !== 'tree') onFileSelect(node.id);
        }}
      >
        {node.children && node.children.map(child => renderTree(child))}
      </TreeItem>
    );
  }

  return (
    <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8, background: '#fafbfc' }}>
      {loading && <div>Loading repo tree…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && (
        <TreeView defaultCollapseIcon={<FolderIcon />} defaultExpandIcon={<FolderIcon />}>
          {renderTree(nestedTree)}
        </TreeView>
      )}
    </div>
  );
}

// --- GitHub Workspace Panel ---
function GitHubWorkspacePanel() {
  const [githubToken, setGithubToken] = useState("");
  const [repo, setRepo] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [branch, setBranch] = useState("main");

  return (
    <Card className="mui-card" sx={{ p: 3, maxWidth: 900, margin: '32px auto' }}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary">GitHub In-App Editor</Typography>
      <GitHubLogin onToken={setGithubToken} />
      {githubToken && (
        <>
          <TextField
            label="Repo (owner/name)"
            value={repo}
            onChange={e => setRepo(e.target.value)}
            sx={{ mb: 2, width: 320 }}
            size="small"
            placeholder="e.g. vercel/next.js"
          />
          <TextField
            label="Branch"
            value={branch}
            onChange={e => setBranch(e.target.value)}
            sx={{ mb: 2, ml: 2, width: 160 }}
            size="small"
            placeholder="main"
          />
          {repo && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ minWidth: 260, maxWidth: 320 }}>
                <Typography fontWeight={600} mb={1}>Files</Typography>
                <GitHubRepoFileTree
                  repoFullName={repo}
                  githubToken={githubToken}
                  branch={branch}
                  onFileSelect={setSelectedFile}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                {selectedFile ? (
                  <GitHubEditor
                    repoFullName={repo}
                    filePath={selectedFile}
                    githubToken={githubToken}
                    branch={branch}
                  />
                ) : (
                  <Typography color="text.secondary" mt={4}>Select a file to edit.</Typography>
                )}
              </Box>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}

function MarketplacePanel({ currentUser }) {
  const [products, setProducts] = useState([
    // Example product
    {
      id: 1,
      name: 'AI Image Generator',
      description: 'Generate images from text prompts using state-of-the-art AI.',
      uploader: 'alice@example.com',
      reviews: [
        { user: 'bob@example.com', rating: 5, comment: 'Amazing results!' }
      ],
      fileUrl: '',
      uploadDate: new Date().toISOString(),
    },
  ]);
  const [uploadForm, setUploadForm] = useState({ name: '', description: '', file: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', productId: null });
  const [showReview, setShowReview] = useState(null);

  // Upload handler (in-memory for now)
  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.description || !uploadForm.file) return;
    setProducts([
      ...products,
      {
        id: Date.now(),
        name: uploadForm.name,
        description: uploadForm.description,
        uploader: currentUser?.email || 'anonymous',
        reviews: [],
        fileUrl: URL.createObjectURL(uploadForm.file),
        uploadDate: new Date().toISOString(),
      },
    ]);
    setUploadForm({ name: '', description: '', file: null });
  };

  // Review handler (in-memory for now)
  const handleReview = () => {
    if (!reviewForm.comment || !reviewForm.productId) return;
    setProducts(products.map(p =>
      p.id === reviewForm.productId
        ? { ...p, reviews: [...p.reviews, { user: currentUser?.email || 'anonymous', rating: reviewForm.rating, comment: reviewForm.comment }] }
        : p
    ));
    setShowReview(null);
    setReviewForm({ rating: 5, comment: '', productId: null });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight={800} mb={3} color="primary.main">AI Product Marketplace</Typography>
      <Card className="mui-card" sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Upload Your AI Product</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Product Name"
            value={uploadForm.name}
            onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
            sx={{ width: 180 }}
            size="small"
          />
          <TextField
            label="Description"
            value={uploadForm.description}
            onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
            sx={{ width: 320 }}
            size="small"
          />
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={e => setUploadForm(f => ({ ...f, file: e.target.files[0] }))}
            />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!uploadForm.name || !uploadForm.description || !uploadForm.file}
          >Post</Button>
        </Stack>
      </Card>
      <Grid container spacing={3}>
        {products.map(product => (
          <Grid item xs={12} md={6} key={product.id}>
            <Card className="mui-card" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{product.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{product.description}</Typography>
              <Typography variant="caption" color="text.secondary">Uploaded by {product.uploader} on {new Date(product.uploadDate).toLocaleDateString()}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={1}>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<DownloadIcon />}
                  href={product.fileUrl}
                  download={product.name.replace(/\s+/g, '_')}
                  disabled={!product.fileUrl}
                >Download</Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<CommentIcon />}
                  onClick={() => { setShowReview(product.id); setReviewForm(f => ({ ...f, productId: product.id })); }}
                >Review</Button>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <StarIcon sx={{ color: '#FFD700' }} />
                <Typography variant="body2">{product.reviews.length > 0 ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1) : 'No ratings yet'} ({product.reviews.length} reviews)</Typography>
              </Stack>
              <Box sx={{ maxHeight: 100, overflowY: 'auto', bgcolor: '#f9f9fb', p: 1, borderRadius: 2, border: '1px solid #dde' }}>
                {product.reviews.map((r, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="primary.main">{r.user}</Typography>
                    <Typography variant="body2">{r.comment}</Typography>
                    <Typography variant="caption" color="text.secondary">Rating: {r.rating}/5</Typography>
                  </Box>
                ))}
                {product.reviews.length === 0 && <Typography color="text.secondary">No reviews yet.</Typography>}
              </Box>
              {showReview === product.id && (
                <Box sx={{ mt: 2, bgcolor: '#f5f7fa', p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" mb={1}>Leave a Review</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      label="Comment"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      sx={{ width: 220 }}
                      size="small"
                    />
                    <TextField
                      label="Rating"
                      type="number"
                      value={reviewForm.rating}
                      onChange={e => setReviewForm(f => ({ ...f, rating: Math.max(1, Math.min(5, Number(e.target.value))) }))}
                      sx={{ width: 80 }}
                      size="small"
                      inputProps={{ min: 1, max: 5 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleReview}>Submit</Button>
                    <Button variant="text" sx={{ color: 'secondary.main' }} onClick={() => setShowReview(null)}>Cancel</Button>
                  </Stack>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// --- Google Meet: use official link and add Google Calendar event button ---
function GoogleMeetAndCalendar() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState('Team Meeting');
  const [calendarDesc, setCalendarDesc] = useState('Discuss project updates.');
  const [calendarTime, setCalendarTime] = useState('');
  const handleCalendar = () => {
    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(calendarTitle)}&details=${encodeURIComponent(calendarDesc)}&dates=${calendarTime}`;
    window.open(url, '_blank');
  };
  return (
    <Card className="mui-card mui-section" sx={{ mb: 3, p: 2, maxWidth: 500 }}>
      <Typography fontWeight={700} mb={1}><GoogleIcon sx={{ mr: 1 }} />Start a Google Meet</Typography>
      <Button
        variant="contained"
        color="success"
        startIcon={<GoogleIcon />}
        onClick={() => window.open('https://meet.google.com/new', '_blank')}
      >Start Google Meet</Button>
      <Divider sx={{ my: 2 }} />
      <Typography fontWeight={700} mb={1}><GoogleIcon sx={{ mr: 1 }} />Add to Google Calendar</Typography>
      <Stack direction="row" spacing={1} mb={1}>
        <TextField label="Title" value={calendarTitle} onChange={e => setCalendarTitle(e.target.value)} size="small" />
        <TextField label="Description" value={calendarDesc} onChange={e => setCalendarDesc(e.target.value)} size="small" />
        <TextField label="Time (YYYYMMDDTHHmmssZ/YYYYMMDDTHHmmssZ)" value={calendarTime} onChange={e => setCalendarTime(e.target.value)} size="small" sx={{ width: 320 }} />
      </Stack>
      <Button variant="contained" color="primary" onClick={handleCalendar}>Create Calendar Event</Button>
    </Card>
  );
}



// Sidebar Application Interface Component
function SidebarAppInterface({ appType, onClose, googleToken }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate contextual AI response based on app type and user input
      const aiResponse = generateAIResponse(inputMessage, appType);
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput, appType) => {
    const input = userInput.toLowerCase();
    
    // Flowchart-specific responses
    if (appType === 'flowchart') {
      if (input.includes('flowchart') || input.includes('diagram')) {
        return `Great! For creating a flowchart, I recommend starting with:
        
1. **Define the process** - What are the main steps?
2. **Use standard symbols** - Rectangles for processes, diamonds for decisions
3. **Keep it simple** - Start with 5-7 steps maximum
4. **Use Lucidchart's templates** - They have great starter templates

Would you like me to help you structure a specific flowchart?`;
      }
      if (input.includes('system') || input.includes('architecture')) {
        return `For system architecture diagrams, consider:
        
- **User Interface Layer** (Frontend)
- **Business Logic Layer** (Backend)
- **Data Layer** (Database)
- **External Integrations** (APIs)

I can help you design the flow between these components!`;
      }
    }
    
    // Slides-specific responses
    if (appType === 'slides') {
      if (input.includes('presentation') || input.includes('slide')) {
        return `For creating compelling presentations:
        
1. **Start with a story** - Problem → Solution → Impact
2. **Use the 10-20-30 rule** - 10 slides, 20 minutes, 30pt font
3. **Visual hierarchy** - One main point per slide
4. **Include data** - Charts and metrics build credibility

What type of presentation are you working on?`;
      }
      if (input.includes('pitch') || input.includes('pitch deck')) {
        return `For pitch decks, structure your slides like this:
        
1. **Problem** (1 slide) - What pain point are you solving?
2. **Solution** (1-2 slides) - How does your product solve it?
3. **Market** (1 slide) - Size and opportunity
4. **Business Model** (1 slide) - How do you make money?
5. **Team** (1 slide) - Why are you the right people?
6. **Ask** (1 slide) - What do you need from investors?

Need help with any specific slide?`;
      }
    }
    
    // Canva-specific responses
    if (appType === 'canva') {
      if (input.includes('design') || input.includes('layout')) {
        return `For effective design in Canva:
        
1. **Choose a template** - Start with something close to your vision
2. **Use consistent colors** - Pick 2-3 colors and stick to them
3. **Typography hierarchy** - One main font, one accent font
4. **White space** - Don't overcrowd your design
5. **Grid system** - Align elements for professional look

What type of design are you creating?`;
      }
      if (input.includes('color') || input.includes('palette')) {
        return `Color psychology tips:
        
- **Blue** - Trust, professionalism, stability
- **Green** - Growth, nature, money
- **Red** - Energy, urgency, passion
- **Yellow** - Optimism, creativity, warmth
- **Purple** - Luxury, creativity, mystery

For your project, consider what emotion you want to convey!`;
      }
    }
    
    // General responses
    if (input.includes('help') || input.includes('how')) {
      return `I'm here to help you with your ${appType} project! I can assist with:
      
- Planning and structure
- Best practices and tips
- Content suggestions
- Design recommendations
- Technical guidance

What specific aspect would you like help with?`;
    }
    
    if (input.includes('model') || input.includes('ai')) {
      return `I'm an AI assistant designed to help you with your ${appType} projects. While I'm not ChatGPT, I'm trained to provide helpful, contextual advice for:
      
- Project planning and structure
- Best practices and workflows
- Content creation and design
- Technical guidance and tips

How can I help you with your current project?`;
    }
    
    // Default response
    return `I understand you're working on ${appType}. That's a great choice! I can help you with:
    
- Planning your project structure
- Best practices and tips
- Content and design suggestions
- Technical guidance

What specific aspect of your ${appType} project would you like to discuss?`;
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
      {/* Main Application Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" fontWeight={600}>
            {appType === 'flowchart' ? 'Flowchart Editor' : 
             appType === 'slides' ? 'Google Slides Editor' : 
             appType === 'canva' ? 'Design Editor' : 'Application'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Application Frame */}
        <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {/* Editors are now opened in new tabs for creation */}
        </Box>
      </Box>

      {/* ChatGPT-like Sidebar */}
      <Box sx={{
        width: 400,
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Chat Header */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'white'
        }}>
          <Typography variant="h6" fontWeight={600}>
            AI Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask me anything about your {appType} project
          </Typography>
        </Box>

        {/* Chat Messages */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {chatMessages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Box sx={{
                maxWidth: '80%',
                p: 2,
                borderRadius: 2,
                backgroundColor: message.role === 'user' ? '#1976d2' : 'white',
                color: message.role === 'user' ? 'white' : 'text.primary',
                boxShadow: 1
              }}>
                <Typography variant="body2">
                  {message.content}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: 1
              }}>
                <CircularProgress size={20} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me about your project..."
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
    </Box>
  );
}

// ---- GitHub Helper Functions ----
// (extractGitHubInfo function is defined above at line 861)

// Enhanced File Explorer Component
function EnhancedFileExplorer({ 
  folders, 
  resources, 
  activeFolder, 
  setActiveFolder, 
  editResource, 
  removeResource, 
  addChildFolder, 
  renameFolder, 
  deleteFolder, 
  hasAnyChildren,
  viewState,
  setViewState,
  renderTreeNode,
  setFolders,
  setResources
}) {
  const { isFullscreen, isWideMode } = viewState;
  
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
  // Global variables that need to be available
  const globalGithubToken = localStorage.getItem('github_token');
  const setGoogleDocUrl = () => {}; // Placeholder - this should be passed as prop if needed
  const setActiveDevelopmentTab = () => {}; // Placeholder - this should be passed as prop if needed
  const setSelectedResource = () => {}; // Placeholder - this should be passed as prop if needed

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setViewState(prev => ({ ...prev, isFullscreen: false }));
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, setViewState]);

  const renderHeader = () => (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider', 
      backgroundColor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📁 File Explorer
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                sx={{ 
                  color: isWideMode ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                <OpenInFullIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
                sx={{ 
                  color: isFullscreen ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  // Enhanced renderTreeNode with drag and drop
  const renderTreeNodeWithDragDrop = (node, folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren, depth = 0) => {
    if (!node) return null;
    const childFolders = folders.filter(f => f.parent === node.id && f.id !== node.id);
    const childFiles = resources.filter(r => r.folder === node.id);
    const isExpanded = expandedFolders.has(node.id);
    const hasChildren = childFolders.length > 0 || childFiles.length > 0;
    
    // Helper functions that need to be available
    const toggleFolderExpansion = (folderId) => {
      setExpandedFolders(prev => 
        prev.has(folderId) ? new Set([...prev].filter(id => id !== folderId)) : new Set([...prev, folderId])
      );
    };
    
    const isGoogleDocResource = (resource) => {
      return resource.platform === 'gdocs' || resource.url?.includes('docs.google.com');
    };
    
    const isGitHubResource = (resource) => {
      return resource.platform === 'github' || resource.url?.includes('github.com');
    };
    
    const extractGitHubInfo = (url) => {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)\/blob\/([^\/]+)\/(.+)/);
      if (match) {
        return {
          repoFullName: match[1],
          branch: match[2],
          filePath: match[3]
        };
      }
      return null;
    };
    
    const handleDragStart = (e, item, type) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, type, text: item.text || item.title }));
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetFolderId) => {
      e.preventDefault();
      try {
        const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
        
        if (dragData.type === 'folder') {
          // Move folder
          if (dragData.id !== targetFolderId && dragData.id !== ROOT_ID) {
            const updatedFolders = folders.map(f => 
              f.id === dragData.id ? { ...f, parent: targetFolderId } : f
            );
            setFolders(updatedFolders);
          }
        } else if (dragData.type === 'file') {
          // Move file
          const updatedResources = resources.map(r => 
            r.id === dragData.id ? { ...r, folder: targetFolderId } : r
          );
          setResources(updatedResources);
        }
      } catch (error) {
        console.error('Error handling drop:', error);
      }
    };

    return (
      <div key={node.id}>
        <Box 
          className={node.id === activeFolder ? 'mui-folder' : ''} 
          sx={{ 
            ml: depth * 2, 
            fontWeight: node.id === 0 ? 800 : 600, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            px: 1, 
            py: 0.5,
            border: '2px dashed transparent',
            '&:hover': {
              border: '2px dashed #1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }} 
          onClick={() => setActiveFolder(node.id)}
          draggable={node.id !== ROOT_ID}
          onDragStart={(e) => handleDragStart(e, node, 'folder')}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node.id)}
        >
          {hasChildren && (
            <IconButton 
              size="small" 
              onClick={e => { e.stopPropagation(); toggleFolderExpansion(node.id); }}
              sx={{ mr: 0.5, p: 0.25 }}
            >
              {isExpanded ? '▼' : '▶'}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 20, mr: 0.5 }} />}
          <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography sx={{ flex: 1 }} fontWeight={node.id === 0 ? 800 : 600}>
            {node.text}
            {node.id !== ROOT_ID && (
              <Chip 
                label="Drag to move" 
                size="small" 
                sx={{ ml: 1, fontSize: '0.6rem', height: 16 }}
                color="primary"
                variant="outlined"
              />
            )}
          </Typography>
          <Tooltip title="Add subfolder">
            <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); addChildFolder(node.id); }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {node.id !== 0 && (
            <>
              <Tooltip title="Rename">
                <IconButton size="small" color="info" onClick={e => { e.stopPropagation(); renameFolder(node.id); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" sx={{ color: 'error.main' }} onClick={e => { e.stopPropagation(); deleteFolder(node.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
        {/* Only render children if expanded */}
        {isExpanded && (
          <>
            {/* Render child files */}
            {childFiles.map(childFile => (
              <Box 
                key={childFile.id} 
                className="mui-resource" 
                sx={{ 
                  ml: (depth + 1) * 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'grab', 
                  px: 1, 
                  py: 0.5, 
                  bgcolor: '#fff7de', 
                  border: '1px dotted #eee',
                  '&:hover': {
                    border: '2px dashed #1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }} 
                onClick={async () => {
                  // Check if it's a Google Doc and open in editor
                  if (isGoogleDocResource(childFile)) {
                    setGoogleDocUrl(childFile.url);
                    setActiveDevelopmentTab('gdocs');
                  } else if (isGitHubResource(childFile)) {
                    // Open GitHub files in Web IDE with GitHub integration
                    const githubInfo = extractGitHubInfo(childFile.url);
                    if (githubInfo) {
                      // Create a GitHub-aware resource for the Web IDE
                      const githubResource = {
                        ...childFile,
                        isGitHubFile: true,
                        githubInfo: githubInfo,
                        title: githubInfo.filePath.split('/').pop() || childFile.title,
                        platform: 'github'
                      };
                      
                      // Try to fetch the file content from GitHub
                      try {
                        const response = await fetch(`https://api.github.com/repos/${githubInfo.repoFullName}/contents/${githubInfo.filePath}`, {
                          headers: globalGithubToken ? {
                            'Authorization': `token ${globalGithubToken}`
                          } : {}
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          
                          // GitHub API returns base64 encoded content for files
                          if (data.content && data.encoding === 'base64') {
                            const content = atob(data.content.replace(/\s/g, ''));
                            githubResource.notes = content;
                            githubResource.originalContent = content; // Store original for comparison
                          } else if (data.download_url) {
                            // Fallback: fetch from download_url for raw content
                            const rawResponse = await fetch(data.download_url);
                            if (rawResponse.ok) {
                              const content = await rawResponse.text();
                              githubResource.notes = content;
                              githubResource.originalContent = content;
                            }
                        } else {
                            githubResource.notes = `// Could not decode content from GitHub\n// Repository: ${githubInfo.repoFullName}\n// File: ${githubInfo.filePath}\n// Response type: ${data.type}`;
                        }
                      } else {
                          githubResource.notes = `// Could not fetch content from GitHub\n// Repository: ${githubInfo.repoFullName}\n// File: ${githubInfo.filePath}\n// Please check your GitHub token or repository access.`;
                        }
                      } catch (error) {
                        console.error('Error fetching GitHub file:', error);
                        githubResource.notes = `// Error fetching content from GitHub\n// Repository: ${githubInfo.repoFullName}\n// File: ${githubInfo.filePath}\n// Error: ${error.message}`;
                      }
                      
                      setSelectedResource(githubResource);
                      setActiveDevelopmentTab('web-ide');
                    } else {
                      // Fallback if GitHub info extraction fails
                      setSelectedResource(childFile);
                      setActiveDevelopmentTab('web-ide');
                    }
                  } else {
                    // Open local files in Web IDE
                    setSelectedResource(childFile);
                    setActiveDevelopmentTab('web-ide');
                  }
                }} 
                title="Click to edit"
                draggable
                onDragStart={(e) => handleDragStart(e, childFile, 'file')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, childFile.folder)}
              >
                <Box sx={{ width: 20, mr: 0.5 }} />
                {isGoogleDocResource(childFile) ? (
                  <GoogleIcon sx={{ mr: 1, color: 'primary.main' }} />
                ) : isGitHubResource(childFile) ? (
                  <GitHubIcon sx={{ mr: 1, color: 'secondary.main' }} />
                ) : (
                  <InsertDriveFileIcon sx={{ mr: 1, color: 'warning.main' }} />
                )}
                <Typography sx={{ flex: 1 }}>
                  {childFile.title}
                  <Chip 
                    label="Drag to move" 
                    size="small" 
                    sx={{ ml: 1, fontSize: '0.6rem', height: 16 }}
                    color="secondary"
                    variant="outlined"
                  />
                </Typography>
                <Tooltip title="Edit resource">
                  <IconButton size="small" color="info" onClick={e => { e.stopPropagation(); editResource(childFile); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete resource">
                  <IconButton size="small" sx={{ color: 'error.main' }} onClick={e => { e.stopPropagation(); removeResource(childFile.id); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
            {/* Recursively render child folders */}
            {childFolders.map(childFolder =>
              renderTreeNodeWithDragDrop(childFolder, folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren, depth + 1)
            )}
          </>
        )}
      </div>
    );
  };

  const renderContent = () => (
    <Box sx={{ 
      flex: 1, 
      overflowY: 'auto', 
      backgroundColor: 'grey.50',
      p: 2
    }}>
      {folders.find(f => f.id === ROOT_ID) && 
        renderTreeNodeWithDragDrop(folders.find(f => f.id === ROOT_ID), folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren)
      }
    </Box>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Fullscreen Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              📁 File Explorer - Fullscreen Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                  sx={{ 
                    color: isWideMode ? 'primary.main' : 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Exit fullscreen (ESC)">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Fullscreen Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  // Wide mode overlay
  if (isWideMode && !isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          width: '80vw',
          maxWidth: '1200px',
          height: '80vh',
          maxHeight: '800px',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Wide Mode Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📁 File Explorer - Wide Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Normal width">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: true }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Close wide mode">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Wide Mode Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      {renderHeader()}
      {renderContent()}
    </Card>
  );
}

// Enhanced Team Component
function EnhancedTeam({ 
  collaborators, 
  selectedWksp, 
  setShowShare,
  viewState,
  setViewState
}) {
  const { isFullscreen, isWideMode } = viewState;

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setViewState(prev => ({ ...prev, isFullscreen: false }));
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, setViewState]);

  const renderHeader = () => (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider', 
      backgroundColor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            👥 Team
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                sx={{ 
                  color: isWideMode ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                <OpenInFullIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
                sx={{ 
                  color: isFullscreen ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const renderContent = () => (
    <Box sx={{ 
      flex: 1, 
      overflowY: 'auto', 
      backgroundColor: 'grey.50',
      p: 2
    }}>
      <List dense>
        <ListItem>
          <ListItemIcon>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {collaborators.users.find(u=>u.id === collaborators.ownerId)?.email?.[0]?.toUpperCase() || '?'}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" fontWeight={600}>
                {collaborators.users.find(u=>u.id === collaborators.ownerId)?.email || "Unknown"}
              </Typography>
            }
            secondary="Owner"
          />
        </ListItem>
        {collaborators.members.map(mem => {
          const user = collaborators.users.find(u => u.id === mem.user_id);
          const isAccepted = !!mem.user_id;
          const isOnline = user?.isOnline || false;
          return (
            <ListItem key={mem.id}>
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, bgcolor: isAccepted ? 'success.main' : 'warning.main' }}>
                  {mem.user_email?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {mem.user_email}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color={isOnline ? 'success.main' : 'text.secondary'}>
                    {isAccepted ? (isOnline ? '● Online' : '● Offline') : '● Pending'}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ShareIcon />}
        onClick={() => setShowShare(selectedWksp.id)}
        sx={{ mt: 1 }}
      >
        Invite
      </Button>
    </Box>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Fullscreen Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              👥 Team - Fullscreen Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                  sx={{ 
                    color: isWideMode ? 'primary.main' : 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Exit fullscreen (ESC)">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Fullscreen Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  // Wide mode overlay
  if (isWideMode && !isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          width: '80vw',
          maxWidth: '1200px',
          height: '80vh',
          maxHeight: '800px',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Wide Mode Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              👥 Team - Wide Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Normal width">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: true }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Close wide mode">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Wide Mode Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      {renderHeader()}
      {renderContent()}
    </Card>
  );
}

// Enhanced AI Tools Component
function EnhancedAiTools({ 
  setShowEnhancedAI, 
  setShowStorageTest, 
  selectedWksp, 
  resources, 
  setGlobalSnackbar,
  user,
  viewState,
  setViewState
}) {
  const { isFullscreen, isWideMode } = viewState;

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setViewState(prev => ({ ...prev, isFullscreen: false }));
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, setViewState]);

  const renderHeader = () => (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider', 
      backgroundColor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            🤖 AI Tools
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                sx={{ 
                  color: isWideMode ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                <OpenInFullIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
                sx={{ 
                  color: isFullscreen ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const renderContent = () => (
    <Box sx={{ 
      flex: 1, 
      overflowY: 'auto', 
      backgroundColor: 'grey.50',
      p: 2
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Enhanced AI Assistant Button */}
        <Button
          variant="contained"
          startIcon={<SmartToyIcon />}
          onClick={() => setShowEnhancedAI(true)}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            mb: 2
          }}
        >
          🚀 Enhanced AI Assistant
        </Button>

        {/* Storage Test Button */}
        <Button
          variant="outlined"
          startIcon={<StorageIcon />}
          onClick={() => setShowStorageTest(true)}
          sx={{
            borderColor: 'success.main',
            color: 'success.main',
            '&:hover': { 
              borderColor: 'success.dark',
              bgcolor: 'success.light',
              color: 'success.dark'
            },
            mb: 2
          }}
        >
          🗄️ Test Storage Integration
        </Button>

        {/* File Migration Button */}
        <SupabaseFileMigration 
          open={false}
          onClose={() => {}}
          workspaceId={selectedWksp.id}
          localResources={resources}
          onMigrationComplete={(result) => {
            console.log('Migration completed:', result);
            setGlobalSnackbar({
              open: true,
              message: `Migration completed: ${result.success} files migrated`,
              severity: 'success'
            });
          }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create files, generate projects, and manage your workspace with AI
        </Typography>
        
        <AICodeReviewer 
          workspaceId={selectedWksp.id} 
          currentUser={user}
        />
      </Box>
    </Box>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Fullscreen Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              🤖 AI Tools - Fullscreen Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                  sx={{ 
                    color: isWideMode ? 'primary.main' : 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Exit fullscreen (ESC)">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Fullscreen Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  // Wide mode overlay
  if (isWideMode && !isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          width: '80vw',
          maxWidth: '1200px',
          height: '80vh',
          maxHeight: '800px',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Wide Mode Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🤖 AI Tools - Wide Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Normal width">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: true }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Close wide mode">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Wide Mode Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      {renderHeader()}
      {renderContent()}
    </Card>
  );
}

// Enhanced Resources Component
function EnhancedResources({ 
  folderResources, 
  setSelectedResource,
  viewState,
  setViewState
}) {
  const { isFullscreen, isWideMode } = viewState;

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setViewState(prev => ({ ...prev, isFullscreen: false }));
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, setViewState]);

  const renderHeader = () => (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider', 
      backgroundColor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📄 Resources
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                sx={{ 
                  color: isWideMode ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                <OpenInFullIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
                sx={{ 
                  color: isFullscreen ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const renderContent = () => (
    <Box sx={{ 
      flex: 1, 
      overflowY: 'auto', 
      backgroundColor: 'grey.50',
      p: 2
    }}>
      {folderResources.slice(0, 5).map(ref => (
        <Card key={ref.id} sx={{ mb: 1, p: 1, cursor: 'pointer' }} onClick={() => setSelectedResource(ref)}>
          <Typography variant="body2" fontWeight={600} noWrap>{ref.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{ref.platform}</Typography>
        </Card>
      ))}
    </Box>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Fullscreen Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              📄 Resources - Fullscreen Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title={isWideMode ? "Normal width" : "Wide mode"}>
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: !prev.isWideMode }))}
                  sx={{ 
                    color: isWideMode ? 'primary.main' : 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Exit fullscreen (ESC)">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Fullscreen Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  // Wide mode overlay
  if (isWideMode && !isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          width: '80vw',
          maxWidth: '1200px',
          height: '80vh',
          maxHeight: '800px',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Wide Mode Header */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          p: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📄 Resources - Wide Mode
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Normal width">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <OpenInFullIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isFullscreen: true }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Close wide mode">
                <IconButton
                  onClick={() => setViewState(prev => ({ ...prev, isWideMode: false }))}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Wide Mode Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    );
  }

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      {renderHeader()}
      {renderContent()}
    </Card>
  );
}

// ---- Main App ----
export default function App() {
  const user = useSupabaseAuthUser();
  const [collaborators, setCollaborators] = useState({members: [], ownerId: null, users: []});  
  const [googleToken, setGoogleToken] = useState(null);
  const loginWithGoogle = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/forms.body.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file',
    prompt: 'consent', // Force consent screen to show every time
    access_type: 'offline', // Get refresh token
    onSuccess: (tokenResponse) => {
      console.log('Google login successful, token received with scopes:', tokenResponse.scope);
      setGoogleToken(tokenResponse.access_token);
      // Clear any old cached tokens
      localStorage.removeItem('google_oauth_token');
      sessionStorage.removeItem('google_oauth_token');
      setGlobalSnackbar({
        open: true,
        message: 'Google authentication successful! You can now access Google Drive.',
        severity: 'success'
      });
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setGlobalSnackbar({
        open: true,
        message: "Google login failed. Please try again.",
        severity: 'error'
      });
      setGoogleToken(null);
    }
  });

  const [workspaces, setWorkspaces] = useState([]);
  const [showShare, setShowShare] = useState(null);
  const [selectedWksp, setSelectedWksp] = useState(null);
  const [mainTab, setMainTab] = useState(0);
  
  // New UI state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    fileExplorer: true,
    collaborators: false,
    chat: false,
    aiTools: false,
    resources: true,
    development: true
  });
  
  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Development workspace state
  const [activeDevelopmentTab, setActiveDevelopmentTab] = useState('github');
  const [selectedResource, setSelectedResource] = useState(null);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubFile, setGithubFile] = useState('');
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState('');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [googleDrawingUrl, setGoogleDrawingUrl] = useState('');
  const [googleSiteUrl, setGoogleSiteUrl] = useState('');
  const [lookerStudioUrl, setLookerStudioUrl] = useState('');
  const [showGoogleSiteDialog, setShowGoogleSiteDialog] = useState(false);
  const [newGoogleSiteTitle, setNewGoogleSiteTitle] = useState('');
  const [isCreatingGoogleSite, setIsCreatingGoogleSite] = useState(false);
  const [showLookerReportDialog, setShowLookerReportDialog] = useState(false);
  const [newLookerReportTitle, setNewLookerReportTitle] = useState('');
  const [isCreatingLookerReport, setIsCreatingLookerReport] = useState(false);
  // Google Sheets creation state
  const [showGoogleSheetDialog, setShowGoogleSheetDialog] = useState(false);
  const [newGoogleSheetTitle, setNewGoogleSheetTitle] = useState('');
  const [isCreatingGoogleSheet, setIsCreatingGoogleSheet] = useState(false);
  // Google Slides creation state
  const [showGoogleSlidesDialog, setShowGoogleSlidesDialog] = useState(false);
  const [newGoogleSlidesTitle, setNewGoogleSlidesTitle] = useState('');
  const [isCreatingGoogleSlides, setIsCreatingGoogleSlides] = useState(false);
  // Google Forms creation state
  const [showGoogleFormDialog, setShowGoogleFormDialog] = useState(false);
  const [newGoogleFormTitle, setNewGoogleFormTitle] = useState('');
  const [isCreatingGoogleForm, setIsCreatingGoogleForm] = useState(false);
  // Google Drawings creation state
  const [showGoogleDrawingDialog, setShowGoogleDrawingDialog] = useState(false);
  const [newGoogleDrawingTitle, setNewGoogleDrawingTitle] = useState('');
  const [isCreatingGoogleDrawing, setIsCreatingGoogleDrawing] = useState(false);

  // Google Drawings creation function (Drive)
  const createNewGoogleDrawing = async (title) => {
    if (!googleToken) {
      setGlobalSnackbar({ open: true, message: 'Please sign in to Google first to create a Google Drawing.', severity: 'error' });
      return;
    }
    setIsCreatingGoogleDrawing(true);
    try {
      const driveRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title || `New Drawing ${new Date().toLocaleString()}`,
          mimeType: 'application/vnd.google-apps.drawing'
        })
      });
      if (!driveRes.ok) {
        const driveTxt = await driveRes.text();
        throw new Error(driveTxt);
      }
      const created = await driveRes.json();
      const url = `https://docs.google.com/drawings/d/${created.id}/edit`;
      setGoogleDrawingUrl(url);
      setActiveDevelopmentTab('gdrawings');
      setShowGoogleDrawingDialog(false);
      setNewGoogleDrawingTitle('');
      setGlobalSnackbar({ open: true, message: 'Google Drawing created and opened.', severity: 'success' });
    } catch (e) {
      console.error('Create Drawing failed:', e);
      setGlobalSnackbar({ open: true, message: 'Failed to create Google Drawing.', severity: 'error' });
    } finally {
      setIsCreatingGoogleDrawing(false);
    }
  };

  // Google Sites creation (Drive placeholder, Sites API creation not available via public REST; create a folder or shortcut)
  const createNewGoogleSite = async (title) => {
    setIsCreatingGoogleSite(true);
    try {
      // Best-effort placeholder: create a Drive shortcut to Sites home or create a folder with the site title
      const name = title || `New Site ${new Date().toLocaleString()}`;
      const driveRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' })
      });
      if (!driveRes.ok) throw new Error(await driveRes.text());
      // Open Sites editor home with prefilled name (no official deep-link for new site with title)
      const url = 'https://sites.google.com/new';
      setGoogleSiteUrl(url);
      setActiveDevelopmentTab('gsites');
      setShowGoogleSiteDialog(false);
      setNewGoogleSiteTitle('');
      setGlobalSnackbar({ open: true, message: 'Opening Google Sites to create a new site.', severity: 'info' });
    } catch (e) {
      console.error('Create Site placeholder failed:', e);
      setGlobalSnackbar({ open: true, message: 'Failed to initiate Google Site creation.', severity: 'error' });
    } finally {
      setIsCreatingGoogleSite(false);
    }
  };

  // Looker Studio creation (no public REST to create reports; open new report page)
  const createNewLookerReport = async (title) => {
    setIsCreatingLookerReport(true);
    try {
      const url = 'https://lookerstudio.google.com/reporting/create';
      setLookerStudioUrl(url);
      setActiveDevelopmentTab('glooker');
      setShowLookerReportDialog(false);
      setNewLookerReportTitle('');
      setGlobalSnackbar({ open: true, message: 'Opening Looker Studio to create a new report.', severity: 'info' });
    } catch (e) {
      console.error('Create Looker report failed:', e);
      setGlobalSnackbar({ open: true, message: 'Failed to open Looker Studio.', severity: 'error' });
    } finally {
      setIsCreatingLookerReport(false);
    }
  };
  const [githubToken, setGithubToken] = useState(null);
  const [useEnhancedIDE, setUseEnhancedIDE] = useState(true); // Default to enhanced IDE
  // --- GOOGLE OAUTH STATE AND INIT ---

  // At the top of the App component, add:
  const [searchQuery, setSearchQuery] = useState("");

  // In the App component, add a state for search scope in the search tab:
  const [searchTabScope, setSearchTabScope] = useState('everywhere'); // 'everywhere' or 'folder'

  // Hackathon assistant state

  const [currentEditor, setCurrentEditor] = useState(null);

  // Global AI Assistant state
  const [showGlobalAIChat, setShowGlobalAIChat] = useState(false);
  const [globalChatMessages, setGlobalChatMessages] = useState([
    {
      id: 1,
      role: 'assistant',
              content: "Hello! I'm your global AI assistant powered by Groq. I can help you with code analysis & optimization, create and edit files, create and analyze Google Docs, generate projects, execute code, and manage your workspace across all tabs. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [globalChatInput, setGlobalChatInput] = useState('');
  const [isGlobalChatLoading, setIsGlobalChatLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [docActionMessage, setDocActionMessage] = useState('');
  const [showDocActionAlert, setShowDocActionAlert] = useState(false);
  const [editorData, setEditorData] = useState(null);

  // Global AI File Management state
  const [showGlobalFileCreator, setShowGlobalFileCreator] = useState(false);
  const [globalFileCreatorData, setGlobalFileCreatorData] = useState({
    fileName: '',
    fileType: 'js',
    content: '',
    folder: 0
  });
  const [showGlobalProjectGenerator, setShowGlobalProjectGenerator] = useState(false);
  const [globalProjectData, setGlobalProjectData] = useState({
    projectName: '',
    projectType: 'web-app',
    techStack: [],
    description: ''
  });
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  const [globalSnackbar, setGlobalSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [globalLastCreatedFiles, setGlobalLastCreatedFiles] = useState([]);

  // Global AI GitHub integration state
  const [globalGithubToken, setGlobalGithubToken] = useState(localStorage.getItem('github_token'));
  const [globalGithubUser, setGlobalGithubUser] = useState(null);
  const [showGlobalGithubDialog, setShowGlobalGithubDialog] = useState(false);
  const [globalGithubRepoName, setGlobalGithubRepoName] = useState('');
  const [globalGithubRepoDescription, setGlobalGithubRepoDescription] = useState('');
  const [globalIsPrivateRepo, setGlobalIsPrivateRepo] = useState(false);
  const [globalIsGithubLoading, setGlobalIsGithubLoading] = useState(false);

  // Google Docs creation state
  const [showGoogleDocDialog, setShowGoogleDocDialog] = useState(false);
  const [newGoogleDocTitle, setNewGoogleDocTitle] = useState('');
  const [isCreatingGoogleDoc, setIsCreatingGoogleDoc] = useState(false);
  
  // Sidebar interface state
  const [sidebarApp, setSidebarApp] = useState(null);
  // Enhanced AI Assistant state
  const [showEnhancedAI, setShowEnhancedAI] = useState(false);
  const [showStorageTest, setShowStorageTest] = useState(false);

  // New AI features state
  const [showAdvancedAI, setShowAdvancedAI] = useState(false);
  const [aiOrchestratorData, setAiOrchestratorData] = useState(null);
  const [crossPlatformCode, setCrossPlatformCode] = useState({});
  const [aiProcessingStatus, setAiProcessingStatus] = useState({
    isProcessing: false,
    progress: 0,
    currentStep: ''
  });

  // Enhanced view states for sidebar sections
  const [fileExplorerView, setFileExplorerView] = useState({ isFullscreen: false, isWideMode: false });
  const [teamView, setTeamView] = useState({ isFullscreen: false, isWideMode: false });
  const [aiToolsView, setAiToolsView] = useState({ isFullscreen: false, isWideMode: false });
  const [resourcesView, setResourcesView] = useState({ isFullscreen: false, isWideMode: false });

  // Debug currentEditor changes
  useEffect(() => {
    console.log('Current editor changed to:', currentEditor);
  }, [currentEditor]);

  // Listen for Google Docs action results
  useEffect(() => {
    const handleDocSuccess = (event) => {
      setDocActionMessage(event.detail.message);
      setShowDocActionAlert(true);
      setTimeout(() => setShowDocActionAlert(false), 3000);
    };

    const handleDocError = (event) => {
      setDocActionMessage(event.detail.message);
      setShowDocActionAlert(true);
      setTimeout(() => setShowDocActionAlert(false), 3000);
    };

    window.addEventListener('showDocSuccess', handleDocSuccess);
    window.addEventListener('showDocError', handleDocError);
    
    return () => {
      window.removeEventListener('showDocSuccess', handleDocSuccess);
      window.removeEventListener('showDocError', handleDocError);
    };
  }, []);

  // Listen for Google Sheets action results
  useEffect(() => {
    const handleSheetSuccess = (event) => {
      setDocActionMessage(event.detail.message);
      setShowDocActionAlert(true);
      setTimeout(() => setShowDocActionAlert(false), 3000);
    };

    const handleSheetError = (event) => {
      setDocActionMessage(event.detail.message);
      setShowDocActionAlert(true);
      setTimeout(() => setShowDocActionAlert(false), 3000);
    };

    window.addEventListener('showSheetSuccess', handleSheetSuccess);
    window.addEventListener('showSheetError', handleSheetError);
    
    return () => {
      window.removeEventListener('showSheetSuccess', handleSheetSuccess);
      window.removeEventListener('showSheetError', handleSheetError);
    };
  }, []);

  // Listen for Global AI Sheet Operations
  useEffect(() => {
    const handleGlobalAISheetOperation = (event) => {
      const { intent, sheetUrl, sheetId } = event.detail;
      
      // Set the Google Sheet URL if not already set
      if (!googleSheetUrl && sheetUrl) {
        setGoogleSheetUrl(sheetUrl);
      }
      
      // Process the intent through the Global AI Agent
      if (intent.type === 'apply_sheet_data') {
        globalHandleSheetDataApplication(intent);
      }
    };

    window.addEventListener('globalAISheetOperation', handleGlobalAISheetOperation);
    
    return () => {
      window.removeEventListener('globalAISheetOperation', handleGlobalAISheetOperation);
    };
  }, [googleSheetUrl, googleToken]);

  // Global AI Assistant functions
  const handleGlobalChatSend = async () => {
    if (!globalChatInput.trim() || isGlobalChatLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: globalChatInput,
      timestamp: new Date()
    };

    setGlobalChatMessages(prev => [...prev, userMessage]);
    const currentInput = globalChatInput;
    setGlobalChatInput('');
    setIsGlobalChatLoading(true);

    try {
      // Check if Groq is configured
      if (!llmIntegration.isGroqConfigured()) {
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `🔧 AI Assistant Not Configured

To use the AI assistant, you need to set up a free Groq API key:

1. Go to https://console.groq.com/keys
2. Sign up and create a new API key
3. Create a .env file in your project root
4. Add: REACT_APP_GROQ_API_KEY=your_key_here
5. Restart your development server

The key should start with 'gsk_'. Once configured, I'll be able to help you with code, debugging, and more!`,
          timestamp: new Date()
        };
        setGlobalChatMessages(prev => [...prev, errorMessage]);
        setIsGlobalChatLoading(false);
        return;
      }

      // Analyze the user's intent for file operations
      const intent = globalAnalyzeUserIntent(currentInput);
      
      if (intent.type === 'create_file') {
        globalHandleFileCreation(intent);
        return;
      } else if (intent.type === 'create_multiple_files') {
        globalHandleMultipleFileCreation(intent);
        return;
      } else if (intent.type === 'create_project') {
        globalHandleProjectCreation(intent);
        return;
      } else if (intent.type === 'edit_file') {
        globalHandleFileEdit(intent);
        return;
      } else if (intent.type === 'create_google_doc') {
        globalHandleGoogleDocCreation(intent);
        return;
      } else if (intent.type === 'create_google_sheet') {
        globalHandleGoogleSheetCreation(intent);
        return;
      } else if (intent.type === 'analyze_google_doc') {
        globalHandleGoogleDocAnalysis(intent);
        return;
      } else if (intent.type === 'analyze_google_sheet') {
        globalHandleGoogleSheetAnalysis(intent);
        return;
      } else if (intent.type === 'apply_sheet_data') {
        globalHandleSheetDataApplication(intent);
        return;
      } else if (intent.type === 'explain_code' || intent.type === 'fix_code' || intent.type === 'optimize_code' || intent.type === 'refactor_code' || intent.type === 'comment_code') {
        globalHandleCodeAction(intent.type, intent);
        return;
      } else if (intent.type === 'execute_code') {
        globalHandleCodeExecution(intent);
        return;
      } else if (intent.type === 'workspace_analysis') {
        globalHandleWorkspaceAnalysis(currentInput);
        return;
      }

      // Build context based on current tab
      let context = `Current tab: ${activeDevelopmentTab}. `;
      
      // Add workspace context for better file suggestions
      const workspaceContext = getGlobalWorkspaceContext();
      context += `${workspaceContext}. `;
      
      // Add Google Doc context if available
      const googleDocContext = await getGoogleDocContext();
      if (googleDocContext) {
        context += `Current Google Doc: "${googleDocContext.title}" - Content preview: ${googleDocContext.content.substring(0, 500)}${googleDocContext.content.length > 500 ? '...' : ''}. `;
      }
      
      // Add Google Sheets context if available
      const googleSheetContext = await getGoogleSheetContext();
      if (googleSheetContext) {
        context += `Current Google Sheet: "${googleSheetContext.title}" - Sheet ID: ${googleSheetContext.sheetId} - Data preview: ${googleSheetContext.dataPreview}. `;
      }
      
      // Add tab-specific context with current file information
      if (activeDevelopmentTab === 'web-ide') {
        // Get current code from WebIDE if available
        const codeEditor = document.querySelector('.monaco-editor');
        let currentCode = '';
        if (codeEditor) {
          // Try to get code from Monaco editor
          currentCode = codeEditor.textContent || '';
        }
        
        // Get current language setting from Web IDE
        const currentLanguage = getCurrentWebIDELanguage();
        context += `User is in the Web IDE with language set to: ${currentLanguage}. `;
        
        // Also check selected resource
        if (selectedResource && selectedResource.notes) {
          currentCode = selectedResource.notes;
          context += `User is editing file: ${selectedResource.title}. Current code:\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\`\n\n`;
        } else if (currentCode) {
          context += `Current code in editor:\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\`\n\n`;
        } else {
          context += `No code is currently loaded in the editor.\n\n`;
        }
      } else if (activeDevelopmentTab === 'github') {
        context += `User is in the GitHub editor. `;
      } else if (activeDevelopmentTab === 'gdocs') {
        context += `User is in Google Docs editor. `;
        if (googleDocContext) {
          context += `Full Google Doc content:\n\`\`\`\n${googleDocContext.content}\n\`\`\`\n\n`;
        }
      } else if (activeDevelopmentTab === 'gsheets') {
        context += `User is in Google Sheets editor. `;
        if (googleSheetContext) {
          context += `Current Google Sheet: "${googleSheetContext.title}" - Sheet ID: ${googleSheetContext.sheetId}. `;
        }
      } else if (activeDevelopmentTab === 'gdrive') {
        context += `User is in Google Drive management interface. Google authentication: ${googleToken ? 'Connected' : 'Not connected'}. `;
      } else if (activeDevelopmentTab === 'hackathon') {
        context += `User is in the Hackathon AI assistant. `;
      }

      context += `User message: ${currentInput}`;

      // Get current Web IDE language for AI prompts
      const currentLanguage = getCurrentWebIDELanguage();
      console.log('Global AI Assistant - Current Web IDE language:', currentLanguage);
      
      const response = await llmIntegration.chatWithAI(
        context,
        globalChatMessages.slice(-5).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        currentLanguage
      );

      // Check if the response contains file structure suggestions
      if (response.includes('file explorer') || response.includes('File Explorer') || 
          response.includes('new file') || response.includes('created') ||
          response.includes('jsx') || response.includes('js') || response.includes('json') ||
          response.includes('package.json') || response.includes('app.js') ||
          response.includes('components/') || response.includes('screens/') || response.includes('utils/')) {
        
        // Automatically trigger file creation
        const fileCreationIntent = {
          type: 'create_multiple_files',
          content: response
        };
        globalHandleMultipleFileCreation(fileCreationIntent);
      }

      // Check if response contains code suggestions
      const codeBlockRegex = /```(?:javascript|js|python|java|cpp|html|css|typescript|ts|tsx|jsx|csharp|php|ruby|go|rust|swift|kotlin|scala|r|matlab|sql|bash|shell|powershell|yaml|json|xml|html|css|scss|less|sass|stylus|markdown|md|text|plaintext)?\n?([\s\S]*?)```/gi;
      const codeMatches = [...response.matchAll(codeBlockRegex)];
      let codeSuggestion = null;
      
      if (codeMatches.length > 0) {
        codeSuggestion = codeMatches[0][1].trim();
        console.log('Code extracted successfully:', codeSuggestion);
      } else {
        console.log('No code blocks found in response');
        console.log('Response preview:', response.substring(0, 200) + '...');
        console.log('Looking for code blocks with pattern: ```...```');
      }

      // Check if response contains document content (non-code text suggestions)
      let documentSuggestion = null;
      const responseText = response.toLowerCase();
      const inputText = currentInput.toLowerCase();
      
      // Detect document content requests and extract the actual content to add
      if ((inputText.includes('add') && (inputText.includes('google doc') || inputText.includes('document') || inputText.includes('doc'))) &&
          !codeMatches.length) { // Not code
        
        // For simple "add X to doc" requests, extract just the content
        // Pattern: "add [content] to the google doc"
        const addMatch = currentInput.match(/add\s+["']?(.*?)["']?\s+to\s+(?:the\s+)?(?:google\s+)?doc/i);
        if (addMatch && addMatch[1] && addMatch[1].length < 50) { // Only for short additions
          documentSuggestion = addMatch[1].trim();
          console.log('Extracted short content to add:', documentSuggestion);
        } else {
          // For longer content or unclear extractions, use the full AI response
          documentSuggestion = response.trim();
          console.log('Using full AI response for document:', documentSuggestion.substring(0, 100) + '...');
        }
      } else if (((inputText.includes('write') || inputText.includes('create') || inputText.includes('draft') || inputText.includes('design') || inputText.includes('generate')) && 
          (inputText.includes('document') || inputText.includes('doc') || inputText.includes('text') || inputText.includes('content') || inputText.includes('proposal') || inputText.includes('plan'))) &&
          !codeMatches.length) { // Not code
        // For content creation requests, use the full AI response
        documentSuggestion = response.trim();
        console.log('Document creation detected, using full response:', documentSuggestion.substring(0, 100) + '...');
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        codeSuggestion: codeSuggestion,
        documentSuggestion: documentSuggestion,
        timestamp: new Date()
      };

      // Only switch tabs if explicitly requested or when applying code
      const shouldSwitchTab = analyzeResponseForTabSwitch(response, currentInput);
      console.log('Tab switch analysis:', { 
        userInput: currentInput, 
        shouldSwitchTab, 
        currentTab: activeDevelopmentTab,
        hasDocumentSuggestion: !!documentSuggestion,
        hasCodeSuggestion: !!codeSuggestion 
      });
      
      if (shouldSwitchTab) {
        setActiveDevelopmentTab(shouldSwitchTab);
        assistantMessage.tabSwitched = shouldSwitchTab;
      }

      setGlobalChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in global AI chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setGlobalChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const analyzeResponseForTabSwitch = (response, userInput) => {
    const responseText = response.toLowerCase();
    const inputText = userInput.toLowerCase();
    
    // Explicit tab switching requests
    if (inputText.includes('switch to') || inputText.includes('go to') || inputText.includes('open')) {
      if (inputText.includes('ide') || inputText.includes('code editor')) {
        return 'web-ide';
      }
      if (inputText.includes('document') || inputText.includes('docs') || inputText.includes('google doc')) {
        return 'gdocs';
      }
      if (inputText.includes('github') || inputText.includes('repository')) {
        return 'github';
      }
      if (inputText.includes('hackathon') || inputText.includes('project')) {
        return 'hackathon';
      }
    }
    
    // Google Docs operations - detect "add to google doc" requests
    if ((inputText.includes('add') && (inputText.includes('google doc') || inputText.includes('document') || inputText.includes('doc'))) ||
        (inputText.includes('write') && inputText.includes('google doc')) ||
        (inputText.includes('insert') && inputText.includes('doc'))) {
      return 'gdocs';
    }
    
    // Google Drive operations - detect "google drive" requests
    if (inputText.includes('google drive') || inputText.includes('drive.google.com') || 
        inputText.includes('upload to drive') || inputText.includes('save to drive') ||
        inputText.includes('create folder') || inputText.includes('organize files')) {
      return 'gdrive';
    }
    
    // Switch to IDE if providing code suggestions
    if (responseText.includes('```') && (inputText.includes('write') || inputText.includes('create') || inputText.includes('generate'))) {
      return 'web-ide';
    }
    
    // Switch to Google Docs if providing document content (any length now)
    if ((inputText.includes('write') || inputText.includes('create') || inputText.includes('draft') || inputText.includes('design') || inputText.includes('generate')) && 
        (inputText.includes('document') || inputText.includes('doc') || inputText.includes('text') || inputText.includes('content') || inputText.includes('proposal') || inputText.includes('plan')) &&
        !responseText.includes('```')) { // Not code
      return 'gdocs';
    }
    
    // Switch to Google Sheets if providing spreadsheet operations
    if ((inputText.includes('add') || inputText.includes('insert') || inputText.includes('create') || inputText.includes('analyze')) && 
        (inputText.includes('sheet') || inputText.includes('spreadsheet') || inputText.includes('cell') || inputText.includes('formula') || inputText.includes('data') || inputText.includes('row') || inputText.includes('column'))) {
      return 'gsheets';
    }
    
    return null;
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const applyCodeToIDE = (code) => {
    // Switch to web-ide tab if not already there
    if (activeDevelopmentTab !== 'web-ide') {
      setActiveDevelopmentTab('web-ide');
    }
    
    // Wait for tab switch then apply code
    setTimeout(() => {
      // Try to find Monaco editor instance and set the code
      const event = new CustomEvent('setIdeCode', { detail: { code } });
      window.dispatchEvent(event);
    }, 100);
  };

  // Get current Web IDE language for AI prompts
  const getCurrentWebIDELanguage = () => {
    return window.currentWebIDELanguage || window.getWebIDELanguage?.() || 'javascript';
  };

  const applyTextToGoogleDoc = async (text) => {
    console.log('applyTextToGoogleDoc called with:', text);
    console.log('Current googleToken:', !!googleToken);
    console.log('Current googleDocUrl:', googleDocUrl);
    console.log('Current tab:', activeDevelopmentTab);
    
    // Switch to gdocs tab if not already there
    if (activeDevelopmentTab !== 'gdocs') {
      console.log('Switching to gdocs tab...');
      setActiveDevelopmentTab('gdocs');
    }
    
    // Wait for tab switch then apply text
    setTimeout(async () => {
      try {
        if (!googleToken) {
          throw new Error('Google token not available. Please authenticate with Google.');
        }
        
        if (!googleDocUrl) {
          throw new Error('Google Doc URL not configured. Please set a Google Doc URL first.');
        }
        
        // Extract document ID from URL
        const match = googleDocUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) {
          throw new Error('Invalid Google Doc URL format.');
        }
        
        const documentId = match[1];
        console.log('Attempting to insert text to document:', documentId);
        console.log('Text to insert:', text);
        
        await insertTextGoogleDoc(documentId, text, googleToken);
        
        console.log('Text inserted successfully!');
        // Show success message
        const event = new CustomEvent('showDocSuccess', { 
          detail: { message: `Successfully added "${text}" to Google Doc!` } 
        });
        window.dispatchEvent(event);
        
      } catch (error) {
        console.error('Error applying text to Google Doc:', error);
        const event = new CustomEvent('showDocError', { 
          detail: { message: `Failed to apply text: ${error.message}` } 
        });
        window.dispatchEvent(event);
      }
    }, 500); // Longer timeout for Google Docs tab switch
  };

  const applyDataToGoogleSheet = async (data, range = 'A1', isFormula = false) => {
    console.log('applyDataToGoogleSheet called with:', { data, range, isFormula });
    console.log('Current googleToken:', !!googleToken);
    console.log('Current googleSheetUrl:', googleSheetUrl);
    console.log('Current tab:', activeDevelopmentTab);
    
    // Switch to gsheets tab if not already there
    if (activeDevelopmentTab !== 'gsheets') {
      console.log('Switching to gsheets tab...');
      setActiveDevelopmentTab('gsheets');
    }
    
    // Wait for tab switch then apply data
    setTimeout(async () => {
      try {
        if (!googleToken) {
          throw new Error('Google token not available. Please authenticate with Google.');
        }
        
        if (!googleSheetUrl) {
          throw new Error('Google Sheet URL not configured. Please set a Google Sheet URL first.');
        }
        
        // Extract sheet ID from URL
        const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) {
          throw new Error('Invalid Google Sheet URL format.');
        }
        
        const sheetId = match[1];
        console.log('Attempting to update sheet:', sheetId);
        console.log('Data to insert:', data);
        console.log('Range:', range);
        console.log('Is formula:', isFormula);
        
        // Use the updateCell function from the EmbeddedGoogleSheetsEditor
        const body = {
          values: [[isFormula ? data : data]]
        };

        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=${isFormula ? 'USER_ENTERED' : 'RAW'}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${googleToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update sheet: ${response.status}`);
        }
        
        console.log('Data applied successfully!');
        // Show success message
        const event = new CustomEvent('showSheetSuccess', { 
          detail: { message: `Successfully ${isFormula ? 'added formula' : 'added data'} to cell ${range}!` } 
        });
        window.dispatchEvent(event);
        
      } catch (error) {
        console.error('Error applying data to Google Sheet:', error);
        const event = new CustomEvent('showSheetError', { 
          detail: { message: `Failed to apply data: ${error.message}` } 
        });
        window.dispatchEvent(event);
      }
    }, 500); // Longer timeout for Google Sheets tab switch
  };

  const renderGlobalChatMessage = (message) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          mb: 2,
          justifyContent: isUser ? 'flex-end' : 'flex-start'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            maxWidth: '80%',
            flexDirection: isUser ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: isUser ? 'primary.main' : 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            {isUser ? <PersonIcon /> : <SmartToyIcon />}
          </Box>
          
          <Paper
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.main' : 'grey.100',
              color: isUser ? 'white' : 'text.primary',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            
            {message.codeSuggestion && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Code Suggestion:
                </Typography>
                <Paper
                  sx={{
                    p: 1,
                    mt: 1,
                    bgcolor: 'grey.900',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <pre style={{ margin: 0 }}>{message.codeSuggestion}</pre>
                </Paper>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => applyCodeToIDE(message.codeSuggestion)}
                  sx={{ mt: 1 }}
                  startIcon={<CodeIcon />}
                >
                  Apply to IDE
                </Button>
              </Box>
            )}

            {message.documentSuggestion && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Document Content:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mt: 1,
                    bgcolor: 'grey.50',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                    {message.documentSuggestion}
                  </Typography>
                </Paper>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={() => applyTextToGoogleDoc(message.documentSuggestion)}
                  sx={{ mt: 1 }}
                  startIcon={<ArticleIcon />}
                >
                  Apply to Google Doc
                </Button>
              </Box>
            )}
            
            {message.fileSuggestion && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Files Created:
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {message.fileSuggestion.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.title}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {message.editedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  File Edited:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`📝 ${message.editedFile.name}`}
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<EditIcon />}
                  />
                </Box>
              </Box>
            )}

            {message.googleDoc && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {message.googleDoc.created ? 'Google Doc Created:' : 'Google Doc Analyzed:'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${message.googleDoc.created ? '✨ ' : '📄 '}${message.googleDoc.title}`}
                    size="small"
                    color={message.googleDoc.created ? "success" : "info"}
                    variant="outlined"
                    icon={message.googleDoc.created ? <NoteAddIcon /> : <ArticleIcon />}
                    onClick={() => message.googleDoc.url && window.open(message.googleDoc.url, '_blank')}
                    sx={{ cursor: message.googleDoc.url ? 'pointer' : 'default' }}
                  />
                  {message.googleDoc.contentLength && (
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      {message.googleDoc.contentLength} characters
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {message.codeAction && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Code Action Applied:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${message.codeAction.action === 'explain_code' ? '🤖' : 
                            message.codeAction.action === 'fix_code' ? '🔧' :
                            message.codeAction.action === 'optimize_code' ? '⚡' :
                            message.codeAction.action === 'refactor_code' ? '🏗️' : '📝'} ${message.codeAction.fileName}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<CodeIcon />}
                  />
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    {message.codeAction.language}
                  </Typography>
                </Box>
              </Box>
            )}

            {message.codeExecution && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Code Executed:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`🚀 ${message.codeExecution.fileName}`}
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<PlayArrowIcon />}
                  />
                </Box>
              </Box>
            )}

            {message.actions && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {message.actions.map((action, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (action === 'github_push') {
                        globalPushFilesToGitHub();
                      }
                    }}
                    startIcon={action === 'github_push' ? <GitHubIcon /> : null}
                  >
                    {action === 'github_push' ? 'Push to GitHub' : action}
                  </Button>
                ))}
              </Box>
            )}
            
            {message.tabSwitched && (
              <Chip
                label={`Switched to ${message.tabSwitched} tab`}
                size="small"
                color="primary"
                sx={{ mt: 1 }}
              />
            )}
            
            {isAssistant && (
              <IconButton
                size="small"
                onClick={() => copyToClipboard(message.content, message.id)}
                sx={{ position: 'absolute', top: 4, right: 4 }}
              >
                {copiedMessageId === message.id ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            )}
          </Paper>
        </Box>
      </Box>
    );
  };

  // Global AI File Management Functions
  const globalAnalyzeUserIntent = (input) => {
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
    
    // File editing patterns
    if ((lowerInput.includes('edit') || lowerInput.includes('modify') || lowerInput.includes('update') || lowerInput.includes('change') || lowerInput.includes('implement') || lowerInput.includes('fix')) && 
        (lowerInput.includes('file') || lowerInput.includes('code') || lowerInput.includes('function') || lowerInput.includes('in this file') || lowerInput.includes('in the file'))) {
      return { type: 'edit_file', fileName: extractFileNameForEditing(input), request: input };
    }
    
    // Google Doc creation patterns
    if ((lowerInput.includes('create') || lowerInput.includes('make') || lowerInput.includes('new')) && 
        (lowerInput.includes('google doc') || lowerInput.includes('google document') || lowerInput.includes('gdoc') || (lowerInput.includes('doc') && (lowerInput.includes('google') || lowerInput.includes('drive'))))) {
      return { type: 'create_google_doc', title: extractGoogleDocTitle(input), request: input };
    }
    
    // Google Doc analysis patterns
    if ((lowerInput.includes('analyze') || lowerInput.includes('summarize') || lowerInput.includes('review') || lowerInput.includes('read') || lowerInput.includes('what') || lowerInput.includes('tell me about')) && 
        (lowerInput.includes('doc') || lowerInput.includes('document') || lowerInput.includes('google doc'))) {
      return { type: 'analyze_google_doc', request: input };
    }
    
    // Google Sheet creation patterns
    if ((lowerInput.includes('create') || lowerInput.includes('make') || lowerInput.includes('new')) && 
        (lowerInput.includes('google sheet') || lowerInput.includes('google spreadsheet') || lowerInput.includes('gsheet') || (lowerInput.includes('sheet') && (lowerInput.includes('google') || lowerInput.includes('drive'))))) {
      return { type: 'create_google_sheet', title: extractGoogleSheetTitle(input), request: input };
    }
    
    // Google Sheet analysis patterns
    if ((lowerInput.includes('analyze') || lowerInput.includes('summarize') || lowerInput.includes('review') || lowerInput.includes('read') || lowerInput.includes('what') || lowerInput.includes('tell me about')) && 
        (lowerInput.includes('sheet') || lowerInput.includes('spreadsheet') || lowerInput.includes('google sheet'))) {
      return { type: 'analyze_google_sheet', request: input };
    }
    
    // Google Sheet data operations patterns
    if ((lowerInput.includes('add') || lowerInput.includes('insert') || lowerInput.includes('put') || lowerInput.includes('update') || lowerInput.includes('set') || lowerInput.includes('on') || lowerInput.includes('in') || lowerInput.includes('at')) && 
        (lowerInput.includes('cell') || lowerInput.includes('data') || lowerInput.includes('formula') || lowerInput.includes('row') || lowerInput.includes('column') || lowerInput.includes('b29') || lowerInput.includes('b1') || lowerInput.includes('b28'))) {
      return { type: 'apply_sheet_data', request: input, operation: extractSheetOperation(input) };
    }
    
    // Google Sheet formula patterns (more specific)
    if ((lowerInput.includes('formula') || lowerInput.includes('calculate') || lowerInput.includes('average') || lowerInput.includes('sum') || lowerInput.includes('count') || lowerInput.includes('max') || lowerInput.includes('min')) && 
        (lowerInput.includes('cell') || lowerInput.includes('b29') || lowerInput.includes('b1') || lowerInput.includes('b28'))) {
      return { type: 'apply_sheet_data', request: input, operation: extractSheetOperation(input) };
    }
    
    // Code action patterns (like Web IDE)
    if (lowerInput.includes('explain') && (lowerInput.includes('code') || lowerInput.includes('this'))) {
      return { type: 'explain_code', request: input };
    }
    if (lowerInput.includes('fix') && (lowerInput.includes('code') || lowerInput.includes('bug') || lowerInput.includes('error'))) {
      return { type: 'fix_code', request: input };
    }
    if (lowerInput.includes('optimize') && (lowerInput.includes('code') || lowerInput.includes('performance'))) {
      return { type: 'optimize_code', request: input };
    }
    if (lowerInput.includes('refactor') && (lowerInput.includes('code') || lowerInput.includes('restructure'))) {
      return { type: 'refactor_code', request: input };
    }
    if ((lowerInput.includes('add comments') || lowerInput.includes('comment')) && lowerInput.includes('code')) {
      return { type: 'comment_code', request: input };
    }
    if ((lowerInput.includes('run') || lowerInput.includes('execute')) && lowerInput.includes('code')) {
      return { type: 'execute_code', request: input };
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

  const extractGoogleDocTitle = (input) => {
    // Look for titles in quotes or after "called", "named", "titled"
    const patterns = [
      /"([^"]+)"/,  // Text in quotes
      /'([^']+)'/,  // Text in single quotes
      /(?:called|named|titled)\s+([^.,!?]+)/i,  // After "called", "named", "titled"
      /google\s+doc\s+([^.,!?]+)/i,  // After "google doc"
      /new\s+(?:doc|document)\s+([^.,!?]+)/i  // After "new doc/document"
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1].trim()) {
        return match[1].trim();
      }
    }
    return '';
  };

  const extractGoogleSheetTitle = (input) => {
    // Look for titles in quotes or after "called", "named", "titled"
    const patterns = [
      /"([^"]+)"/,  // Text in quotes
      /'([^']+)'/,  // Text in single quotes
      /(?:called|named|titled)\s+([^.,!?]+)/i,  // After "called", "named", "titled"
      /google\s+sheet\s+([^.,!?]+)/i,  // After "google sheet"
      /new\s+(?:sheet|spreadsheet)\s+([^.,!?]+)/i  // After "new sheet/spreadsheet"
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1].trim()) {
        return match[1].trim();
      }
    }
    return '';
  };

  const extractSheetOperation = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Extract cell reference - look for patterns like "cell B29", "B29", etc.
    let cell = 'A1'; // default
    const cellPatterns = [
      /(?:on|in|to|at)\s+(?:cell\s+)?([A-Z]+\d+)/i,
      /(?:add|insert|put|update|set)\s+(?:a\s+)?(?:formula\s+)?(?:to\s+)?(?:cell\s+)?([A-Z]+\d+)/i,
      /(?:my\s+)?(?:google\s+)?(?:sheet\s+)?(?:on\s+)?(?:cell\s+)?([A-Z]+\d+)/i,
      /([A-Z]+\d+)/i
    ];
    
    for (const pattern of cellPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        cell = match[1];
        break;
      }
    }
    
    // Check if this is a formula request
    const isFormulaRequest = lowerInput.includes('formula') || 
                            lowerInput.includes('calculate') || 
                            lowerInput.includes('average') || 
                            lowerInput.includes('sum') ||
                            lowerInput.includes('count') ||
                            lowerInput.includes('max') ||
                            lowerInput.includes('min');
    
    let data = '';
    let isFormula = false;
    
    if (isFormulaRequest) {
      // Handle formula requests with specific range detection
      if (lowerInput.includes('average') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=AVERAGE(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('sum') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=SUM(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('count') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=COUNT(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('max') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=MAX(B1:B28)';
        isFormula = true;
      } else if (lowerInput.includes('min') && lowerInput.includes('b1') && lowerInput.includes('b28')) {
        data = '=MIN(B1:B28)';
        isFormula = true;
      } else {
        // Generic formula construction based on keywords
        if (lowerInput.includes('average')) {
          data = '=AVERAGE()';
          isFormula = true;
        } else if (lowerInput.includes('sum')) {
          data = '=SUM()';
          isFormula = true;
        } else if (lowerInput.includes('count')) {
          data = '=COUNT()';
          isFormula = true;
        }
      }
    } else {
      // Handle regular data requests
      const dataMatch = input.match(/(?:add|insert|put|update|set)\s+(?:data\s+)?(?:to\s+)?(?:cell\s+)?[A-Z]+\d+[:\s]+(.+)/i);
      data = dataMatch ? dataMatch[1].trim() : '';
      isFormula = data.startsWith('=');
    }
    
    // Extract row data
    const rowMatch = input.match(/(?:add|insert)\s+(?:row\s+)?(?:with\s+)?(?:data\s+)?(.+)/i);
    const rowData = rowMatch ? rowMatch[1].split(',').map(d => d.trim()) : [];
    
    // Extract column data
    const colMatch = input.match(/(?:add|insert)\s+(?:column\s+)?(?:with\s+)?(?:data\s+)?(.+)/i);
    const colData = colMatch ? colMatch[1].split(',').map(d => d.trim()) : [];
    
    return {
      cell,
      data,
      isFormula,
      rowData,
      colData,
      type: rowData.length > 0 ? 'row' : colData.length > 0 ? 'column' : 'cell'
    };
  };

  const extractFileNameForEditing = (input) => {
    // Look for file names mentioned in the input
    const patterns = [
      /(?:in|edit|modify|update|change|implement|fix)\s+(?:the\s+)?(?:file\s+)?([a-zA-Z0-9._/-]+\.(?:js|ts|jsx|tsx|html|css|json|md|py|java|cpp|c|h))/i,
      /(?:file\s+)([a-zA-Z0-9._/-]+\.(?:js|ts|jsx|tsx|html|css|json|md|py|java|cpp|c|h))/i,
      /([a-zA-Z0-9._/-]+\.(?:js|ts|jsx|tsx|html|css|json|md|py|java|cpp|c|h))/i
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return '';
  };

  const globalFindFileByName = (fileName) => {
    if (!fileName) return null;
    
    // First try exact match
    let file = resources.find(r => r.title === fileName);
    if (file) return file;
    
    // Try partial match (case insensitive)
    file = resources.find(r => r.title.toLowerCase().includes(fileName.toLowerCase()));
    if (file) return file;
    
    // Try without extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    file = resources.find(r => r.title.toLowerCase().includes(nameWithoutExt.toLowerCase()));
    if (file) return file;
    
    return null;
  };

  const globalGetFileContent = (file) => {
    return file?.notes || '';
  };

  const globalUpdateFileContent = (fileId, newContent) => {
    setResources(prev => prev.map(resource => 
      resource.id === fileId 
        ? { ...resource, notes: newContent }
        : resource
    ));
  };

  const getGlobalWorkspaceContext = () => {
    const googleDriveResources = resources.filter(r => isGoogleDriveResource(r));
    const googleDocResources = resources.filter(r => isGoogleDocResource(r));
    
    return `Workspace has ${folders.length} folders and ${resources.length} files. Active folder: ${folders.find(f => f.id === activeFolder)?.text || 'Root'}. Google Drive resources: ${googleDriveResources.length}, Google Docs: ${googleDocResources.length}. Google authentication: ${googleToken ? 'Connected' : 'Not connected'}`;
  };

  // Get current Google Doc content if available
  const getGoogleDocContext = async () => {
    if (!googleDocUrl || !googleToken) {
      return null;
    }

    try {
      const match = googleDocUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) return null;

      const documentId = match[1];
      const docData = await fetchGoogleDoc(documentId, googleToken);
      const docText = extractGoogleDocText(docData);
      
      return {
        documentId,
        title: docData.title || 'Untitled Document',
        content: docText,
        url: googleDocUrl
      };
    } catch (error) {
      console.error('Error fetching Google Doc content:', error);
      return null;
    }
  };

  // Get current Google Sheet context if available
  const getGoogleSheetContext = async () => {
    if (!googleSheetUrl || !googleToken) {
      return null;
    }

    try {
      const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) return null;

      const sheetId = match[1];
      
      // Fetch sheet metadata
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sheet data: ${response.status}`);
      }

      const sheetData = await response.json();
      const sheetTitle = sheetData.properties?.title || 'Untitled Sheet';
      const sheetCount = sheetData.sheets?.length || 0;
      
      // Get a preview of the first sheet's data
      let dataPreview = 'No data available';
      if (sheetData.sheets && sheetData.sheets[0]) {
        const firstSheet = sheetData.sheets[0];
        if (firstSheet.data && firstSheet.data[0] && firstSheet.data[0].rowData) {
          const rows = firstSheet.data[0].rowData.filter(row => 
            row.values && row.values.some(cell => cell.formattedValue)
          );
          if (rows.length > 0) {
            const sampleData = rows.slice(0, 3).map(row => 
              row.values?.map(cell => cell.formattedValue || '').join(' | ')
            ).join('\n');
            dataPreview = `Sample data:\n${sampleData}`;
          }
        }
      }
      
      return {
        sheetId,
        title: sheetTitle,
        sheetCount,
        dataPreview,
        url: googleSheetUrl
      };
    } catch (error) {
      console.error('Error fetching Google Sheet context:', error);
      return null;
    }
  };

  const globalHandleFileCreation = async (intent) => {
    if (intent.fileName) {
      setGlobalFileCreatorData(prev => ({ ...prev, fileName: intent.fileName }));
    }
    setShowGlobalFileCreator(true);
  };

  const globalHandleProjectCreation = async (intent) => {
    if (intent.projectName) {
      setGlobalProjectData(prev => ({ ...prev, projectName: intent.projectName }));
    }
    setShowGlobalProjectGenerator(true);
  };

  const globalHandleWorkspaceAnalysis = async (input) => {
    const context = getGlobalWorkspaceContext();
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

    setGlobalChatMessages(prev => [...prev, assistantMessage]);
  };

  const globalHandleGoogleDocAnalysis = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      const googleDocContext = await getGoogleDocContext();
      
      if (!googleDocContext) {
        setGlobalSnackbar({
          open: true,
          message: 'No Google Doc is currently open. Please open a Google Doc first.',
          severity: 'error'
        });
        return;
      }

      if (!googleDocContext.content.trim()) {
        setGlobalSnackbar({
          open: true,
          message: 'The Google Doc appears to be empty.',
          severity: 'info'
        });
        return;
      }

      // Create AI prompt for Google Doc analysis
      const analysisPrompt = `You are analyzing a Google Doc. Please provide a comprehensive analysis based on the user's request.

GOOGLE DOC DETAILS:
Title: ${googleDocContext.title}
Content Length: ${googleDocContext.content.length} characters

FULL CONTENT:
\`\`\`
${googleDocContext.content}
\`\`\`

USER REQUEST: ${intent.request}

Please provide a detailed analysis, summary, or response based on the document content and the user's specific request.`;

      const response = await llmIntegration.chatWithAI(analysisPrompt, []);
      
      // Add assistant message with Google Doc context
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `📄 **Google Doc Analysis: "${googleDocContext.title}"**

${response}

📊 **Document Stats:**
- Length: ${googleDocContext.content.length} characters
- Word count: ~${Math.ceil(googleDocContext.content.split(/\s+/).length)} words
- URL: [Open in Google Docs](${googleDocContext.url})`,
        timestamp: new Date(),
        type: 'google_doc_analysis',
        googleDoc: {
          title: googleDocContext.title,
          url: googleDocContext.url,
          contentLength: googleDocContext.content.length
        }
      };
      
      setGlobalChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error analyzing Google Doc:', error);
      setGlobalSnackbar({
        open: true,
        message: 'Error analyzing Google Doc',
        severity: 'error'
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalHandleGoogleSheetAnalysis = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      const googleSheetContext = await getGoogleSheetContext();
      
      if (!googleSheetContext) {
        setGlobalSnackbar({
          open: true,
          message: 'No Google Sheet is currently open. Please open a Google Sheet first.',
          severity: 'error'
        });
        return;
      }

      // Create AI prompt for Google Sheet analysis
      const analysisPrompt = `You are analyzing a Google Sheet. Please provide a comprehensive analysis based on the user's request.

GOOGLE SHEET DETAILS:
Title: ${googleSheetContext.title}
Sheet ID: ${googleSheetContext.sheetId}
Number of Sheets: ${googleSheetContext.sheetCount}

DATA PREVIEW:
\`\`\`
${googleSheetContext.dataPreview}
\`\`\`

USER REQUEST: ${intent.request}

Please provide a detailed analysis, summary, or response based on the sheet data and the user's specific request. If the user is asking about data operations, formulas, or sheet structure, provide specific guidance.`;

      const response = await llmIntegration.chatWithAI(analysisPrompt, []);
      
      // Add assistant message with Google Sheet context
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `📊 **Google Sheet Analysis: "${googleSheetContext.title}"**

${response}

📈 **Sheet Stats:**
- Sheet ID: ${googleSheetContext.sheetId}
- Number of Sheets: ${googleSheetContext.sheetCount}
- URL: [Open in Google Sheets](${googleSheetContext.url})`,
        timestamp: new Date(),
        type: 'google_sheet_analysis',
        googleSheet: {
          title: googleSheetContext.title,
          url: googleSheetContext.url,
          sheetId: googleSheetContext.sheetId
        }
      };
      
      setGlobalChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error analyzing Google Sheet:', error);
      setGlobalSnackbar({
        open: true,
        message: 'Error analyzing Google Sheet',
        severity: 'error'
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalHandleSheetDataApplication = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      if (!googleToken) {
        setGlobalSnackbar({
          open: true,
          message: 'Please sign in to Google first to edit Google Sheets.',
          severity: 'error'
        });
        return;
      }

      if (!googleSheetUrl) {
        setGlobalSnackbar({
          open: true,
          message: 'No Google Sheet is currently open. Please open a Google Sheet first.',
          severity: 'error'
        });
        return;
      }

      // Get current sheet context for better AI understanding
      const googleSheetContext = await getGoogleSheetContext();
      if (!googleSheetContext) {
        setGlobalSnackbar({
          open: true,
          message: 'Unable to get Google Sheet context.',
          severity: 'error'
        });
        return;
      }

      const operation = intent.operation;
      let success = false;
      let message = '';

      // Create comprehensive AI prompt for sheet operations
      const operationPrompt = `🎯 GOOGLE SHEET OPERATION INSTRUCTIONS

You are editing a Google Sheet with the following details:
📊 Sheet Title: "${googleSheetContext.title}"
🔗 Sheet ID: ${googleSheetContext.sheetId}
📈 Number of Sheets: ${googleSheetContext.sheetCount}

OPERATION REQUEST: ${intent.request}

EXTRACTED OPERATION DETAILS:
📍 Target Cell: ${operation.cell}
📝 Data/Formula: ${operation.data}
🔧 Is Formula: ${operation.isFormula}
📋 Operation Type: ${operation.type}

IMPORTANT: You are directly editing a Google Sheet. The operation will be applied to the specified cell location. Ensure you understand:
1. The target cell location (${operation.cell})
2. Whether this is a formula (${operation.isFormula})
3. The exact data to be inserted

Please confirm this operation is correct before proceeding.`;

      console.log('🤖 AI Operation Prompt:', operationPrompt);

      // Switch to Google Sheets tab if not already there
      if (activeDevelopmentTab !== 'gsheets') {
        setActiveDevelopmentTab('gsheets');
      }

      // Wait for tab switch then apply data
      setTimeout(async () => {
        try {
          // Extract sheet ID from URL
          const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
          if (!match) {
            throw new Error('Invalid Google Sheet URL format.');
          }

          const sheetId = match[1];
          
          // Get sheet context for this operation
          const sheetContext = await getGoogleSheetContext();

          // Log the operation details for debugging
          console.log('🔍 Google Sheet Operation Details:', {
            operation,
            cell: operation.cell,
            data: operation.data,
            isFormula: operation.isFormula,
            type: operation.type
          });

          if (operation.type === 'cell') {
            // Update a single cell
            const body = {
              values: [[operation.data]]
            };

            console.log(`📝 Applying to cell ${operation.cell}:`, operation.data);
            console.log(`🔧 Is formula: ${operation.isFormula}`);

            const response = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${operation.cell}?valueInputOption=${operation.isFormula ? 'USER_ENTERED' : 'RAW'}`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${googleToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to update cell: ${response.status}`);
            }

            success = true;
            message = `✅ Successfully ${operation.isFormula ? 'added formula' : 'added data'} to cell ${operation.cell} in Google Sheet "${googleSheetContext.title}": "${operation.data}"`;

          } else if (operation.type === 'row') {
            // Add a new row
            const body = {
              values: [operation.rowData]
            };

            const response = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:Z?valueInputOption=RAW`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${googleToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to add row: ${response.status}`);
            }

            success = true;
            message = `✅ Successfully added row with data: ${operation.rowData.join(', ')}`;

          } else if (operation.type === 'column') {
            // Add a new column
            const columnData = operation.colData.map(value => [value]);
            const body = {
              values: columnData
            };

            const response = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:Z?valueInputOption=RAW`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${googleToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to add column: ${response.status}`);
            }

            success = true;
            message = `✅ Successfully added column with data: ${operation.colData.join(', ')}`;
          }

          if (success) {
            // Add success message to chat
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant',
              content: `🎯 **Google Sheet Operation Completed Successfully!**

${message}

**Operation Summary:**
- 📍 Target Cell: ${operation.cell}
- 📝 Data/Formula: \`${operation.data}\`
- 🔧 Type: ${operation.isFormula ? 'Formula' : 'Data'}
- 📊 Sheet: "${sheetContext.title}"

The operation has been applied to your Google Sheet. You can now see the changes in the Google Sheets editor.`,
              timestamp: new Date(),
              type: 'sheet_data_applied',
              operation: operation,
              googleSheet: {
                title: sheetContext.title,
                url: sheetContext.url,
                sheetId: sheetContext.sheetId
              }
            };
            
            setGlobalChatMessages(prev => [...prev, assistantMessage]);
            
            // Show success notification
            setGlobalSnackbar({
              open: true,
              message: message,
              severity: 'success'
            });
          }

        } catch (error) {
          console.error('Error applying sheet data:', error);
          
          const errorMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `❌ Failed to apply changes to Google Sheet: ${error.message}`,
            timestamp: new Date(),
            type: 'sheet_data_error'
          };
          
          setGlobalChatMessages(prev => [...prev, errorMessage]);
          
          setGlobalSnackbar({
            open: true,
            message: `Error applying changes: ${error.message}`,
            severity: 'error'
          });
        }
      }, 500);

    } catch (error) {
      console.error('Error in sheet data application:', error);
      setGlobalSnackbar({
        open: true,
        message: 'Error processing sheet operation',
        severity: 'error'
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalHandleGoogleSheetCreation = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      if (!googleToken) {
        setGlobalSnackbar({
          open: true,
          message: 'Please sign in to Google first to create a Google Sheet.',
          severity: 'error'
        });
        return;
      }

      const sheetTitle = intent.title || `AI Created Sheet - ${new Date().toLocaleDateString()}`;
      
      // Call the existing createNewGoogleSheet function
      await createNewGoogleSheet(sheetTitle);
      
      // Add assistant message about the creation
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `📊 **Google Sheet Created Successfully!**

I've created a new Google Sheet titled **"${sheetTitle}"** in your Google Drive and opened it in the editor.

The sheet is now ready for you to:
• Add data and formulas
• Create charts and visualizations
• Organize information in tables
• Use the AI assistant to help with data operations

You can now start working with your new spreadsheet!`,
        timestamp: new Date(),
        type: 'google_sheet_creation',
        googleSheet: {
          title: sheetTitle,
          created: true
        }
      };
      
      setGlobalChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error creating Google Sheet:', error);
      setGlobalSnackbar({
        open: true,
        message: 'Error creating Google Sheet',
        severity: 'error'
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalHandleGoogleDocCreation = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      if (!googleToken) {
        setGlobalSnackbar({
          open: true,
          message: 'Please sign in to Google first to create a Google Doc.',
          severity: 'error'
        });
        return;
      }

      const docTitle = intent.title || `AI Created Document - ${new Date().toLocaleDateString()}`;
      
      // Call the existing createNewGoogleDoc function
      await createNewGoogleDoc(docTitle);
      
      // Add assistant message about the creation
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `✅ **Google Doc Created Successfully!**

I've created a new Google Doc titled **"${docTitle}"** in your Google Drive and opened it in the editor.

🔗 You can now:
- Edit the document content directly
- Share it with collaborators
- Ask me to analyze or help with the content
- Switch to other tabs and come back anytime

The document is ready for you to start working on!`,
        timestamp: new Date(),
        type: 'google_doc_creation',
        googleDoc: {
          title: docTitle,
          created: true
        }
      };
      
      setGlobalChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error creating Google Doc:', error);
      setGlobalSnackbar({
        open: true,
        message: 'Error creating Google Doc. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalHandleFileEdit = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      let targetFile = null;
      
      // If specific file name provided, search for it
      if (intent.fileName) {
        targetFile = globalFindFileByName(intent.fileName);
      }
      
      // If no file found and no specific name, try to find from context
      if (!targetFile) {
        // Get list of recent files or suggest files to edit
        const availableFiles = resources.filter(r => 
          r.title.match(/\.(js|ts|jsx|tsx|html|css|json|md|py|java|cpp|c|h)$/i)
        ).slice(0, 10);
        
        if (availableFiles.length === 0) {
          setGlobalSnackbar({ 
            open: true, 
            message: 'No code files found in workspace to edit', 
            severity: 'error' 
          });
          return;
        }
        
        // Ask user to select a file if multiple options
        if (availableFiles.length > 1 && !intent.fileName) {
          const fileList = availableFiles.map(f => `- ${f.title}`).join('\n');
          const selectMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `I found multiple files that could be edited. Please specify which file you'd like me to work on:

${fileList}

Please say something like "edit App.js" or "implement the function in utils.js"`,
            timestamp: new Date(),
            type: 'file_selection'
          };
          setGlobalChatMessages(prev => [...prev, selectMessage]);
          return;
        }
        
        // Use the first file if only one option
        targetFile = availableFiles[0];
      }
      
      if (!targetFile) {
        setGlobalSnackbar({ 
          open: true, 
          message: `File "${intent.fileName}" not found in workspace`, 
          severity: 'error' 
        });
        return;
      }
      
      // Get current file content
      const currentContent = globalGetFileContent(targetFile);
      
      // Create AI prompt for editing
      const editPrompt = `You are editing the file "${targetFile.title}". 

CURRENT FILE CONTENT:
\`\`\`
${currentContent}
\`\`\`

USER REQUEST: ${intent.request}

Please provide the COMPLETE updated file content with the requested changes implemented. Make sure to:
1. Keep all existing code that should remain
2. Implement the requested changes accurately
3. Follow best practices and maintain code style
4. Add appropriate comments if implementing new functions
5. Ensure the code is syntactically correct

Return ONLY the complete updated file content, no explanations or markdown formatting:`;

      const response = await llmIntegration.chatWithAI(editPrompt, []);
      
      // Update the file content
      globalUpdateFileContent(targetFile.id, response);
      
      // Show success message
      setGlobalSnackbar({ 
        open: true, 
        message: `Successfully updated ${targetFile.title}`, 
        severity: 'success' 
      });
      
      // Add assistant message
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `✅ **File Updated Successfully!**

📁 **File**: ${targetFile.title}
🔧 **Changes**: ${intent.request}

I've implemented the requested changes in your file. You can now view the updated content in your workspace.`,
        timestamp: new Date(),
        type: 'file_edited',
        editedFile: {
          name: targetFile.title,
          id: targetFile.id
        }
      };
      setGlobalChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error editing file:', error);
      setGlobalSnackbar({ 
        open: true, 
        message: 'Error editing file', 
        severity: 'error' 
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalHandleMultipleFileCreation = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      // Ask AI to parse the file structure and create files
      const prompt = `Extract file names from this text and create appropriate, unique content for each file:

${intent.content}

IMPORTANT: Create DIFFERENT content for each file based on its name and purpose.

Return ONLY this JSON format:
{"files":[
  {"name":"app.js","content":"// Main application file\\nconsole.log('App started');"},
  {"name":"styles.css","content":"/* Main styles */\\nbody { margin: 0; }"},
  {"name":"package.json","content":"{\\n  \\"name\\": \\"my-app\\",\\n  \\"version\\": \\"1.0.0\\"\\n}"}
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
            folder: projectFolderId
          }));
          
          // Add to workspace
          if (addFoldersAndResources) {
            addFoldersAndResources([projectFolder], []);
          }
          if (setResources) {
            setResources(prev => [...prev, ...newFiles]);
          }
          
          // Store files for potential GitHub push
          setGlobalLastCreatedFiles(newFiles);
          
          setGlobalSnackbar({ open: true, message: `Created ${newFiles.length} files in folder "${folderName}" successfully`, severity: 'success' });
          
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
            fileSuggestion: newFiles,
            actions: ['github_push']
          };
          setGlobalChatMessages(prev => [...prev, successMessage]);
        } else {
          console.log('No files extracted from AI response');
          throw new Error('No files found in AI response');
        }
      } catch (parseError) {
        console.error('Failed to parse file structure:', parseError);
        setGlobalSnackbar({ open: true, message: 'Failed to create files. Please try again.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error creating multiple files:', error);
      setGlobalSnackbar({ open: true, message: 'Error creating files', severity: 'error' });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalCreateFile = async () => {
    if (!globalFileCreatorData.fileName) {
      setGlobalSnackbar({ open: true, message: 'Please enter a file name', severity: 'error' });
      return;
    }

    try {
      // Generate content if not provided
      let content = globalFileCreatorData.content;
      if (!content) {
        content = await globalGenerateFileContent(globalFileCreatorData.fileName, globalFileCreatorData.fileType);
      }

      // Create the file resource
      const newFile = {
        id: Date.now() + Math.random(),
        title: globalFileCreatorData.fileName,
        url: `file://${globalFileCreatorData.fileName}`,
        tags: [globalFileCreatorData.fileType],
        notes: content,
        platform: 'local',
        folder: globalFileCreatorData.folder
      };

      // Add to resources
      if (setResources) {
        setResources(prev => [...prev, newFile]);
      }

      setGlobalSnackbar({ open: true, message: `Created ${globalFileCreatorData.fileName}`, severity: 'success' });
      setShowGlobalFileCreator(false);
      setGlobalFileCreatorData({ fileName: '', fileType: 'js', content: '', folder: activeFolder });

      // Add success message
      const successMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `✅ Created file: **${globalFileCreatorData.fileName}**

The file has been added to your workspace. You can now edit it or use it in your project.`,
        timestamp: new Date(),
        type: 'file_created'
      };
      setGlobalChatMessages(prev => [...prev, successMessage]);

    } catch (error) {
      console.error('Error creating file:', error);
      setGlobalSnackbar({ open: true, message: 'Error creating file', severity: 'error' });
    }
  };

  const globalGenerateFileContent = async (fileName, fileType) => {
    const prompt = `Generate appropriate content for a file named "${fileName}" with type "${fileType}". 
    Create practical, runnable code or content that follows best practices.`;
    
    try {
      return await llmIntegration.chatWithAI(prompt, []);
    } catch (error) {
      console.error('Error generating file content:', error);
      return `// ${fileName}\n// Generated by AI Assistant\n\n// TODO: Add your code here`;
    }
  };

  // Global AI GitHub integration functions
  const globalHandleGitHubLogin = async () => {
    try {
      setGlobalIsGithubLoading(true);
      const token = await initiateGitHubLogin();

      const api = new GitHubAPI(token);
      const userInfo = await api.getUserInfo();

      setGlobalGithubToken(token);
      setGlobalGithubUser(userInfo);
      localStorage.setItem('github_token', token);

      setGlobalSnackbar({ open: true, message: `GitHub connected successfully as @${userInfo.login}!`, severity: 'success' });
    } catch (error) {
      console.error('GitHub login error:', error);
      setGlobalSnackbar({ open: true, message: 'GitHub login failed', severity: 'error' });
      setGlobalGithubToken(null);
      setGlobalGithubUser(null);
      localStorage.removeItem('github_token');
    } finally {
      setGlobalIsGithubLoading(false);
    }
  };

  const globalPushFilesToGitHub = async () => {
    if (!globalGithubToken || !globalGithubUser) {
      setGlobalSnackbar({
        open: true,
        message: 'Please connect to GitHub first.',
        severity: 'error'
      });
      return;
    }

    if (globalLastCreatedFiles.length === 0) {
      setGlobalSnackbar({ open: true, message: 'No files to push. Create some files first!', severity: 'error' });
      return;
    }

    setShowGlobalGithubDialog(true);
  };

  const globalCreateGitHubRepository = async () => {
    if (!globalGithubRepoName.trim()) {
      setGlobalSnackbar({ open: true, message: 'Please enter a repository name', severity: 'error' });
      return;
    }

    try {
      setGlobalIsGithubLoading(true);
      const api = new GitHubAPI(globalGithubToken);

      // Create repository
      const repoData = await api.createRepository(
        sanitizeRepoName(globalGithubRepoName),
        globalGithubRepoDescription,
        globalIsPrivateRepo
      );

      // Convert files to GitHub format
      const githubFiles = convertFilesToGitHubFormat(globalLastCreatedFiles);

      // Push files to the repository
      await api.pushMultipleFiles(
        globalGithubUser.login,
        repoData.name,
        githubFiles,
        `Initial commit: Added ${githubFiles.length} files`
      );

      setGlobalSnackbar({
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
      setGlobalChatMessages(prev => [...prev, successMessage]);

      // Reset dialog
      setShowGlobalGithubDialog(false);
      setGlobalGithubRepoName('');
      setGlobalGithubRepoDescription('');
      setGlobalIsPrivateRepo(false);

    } catch (error) {
      console.error('GitHub repository creation failed:', error);
      setGlobalSnackbar({
        open: true,
        message: `Failed to create repository: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setGlobalIsGithubLoading(false);
    }
  };

  // Global AI Code Actions (like Enhanced Web IDE)
  const globalHandleCodeAction = async (actionType, intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      // Get current file content if available
      let currentCode = '';
      let fileName = '';
      let language = 'javascript';
      
      if (selectedResource && selectedResource.notes) {
        currentCode = selectedResource.notes;
        fileName = selectedResource.title || 'untitled';
        
        // Determine language from file extension
        const extension = fileName.split('.').pop()?.toLowerCase();
        const langMap = {
          'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
          'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
          'css': 'css', 'html': 'html', 'json': 'json', 'md': 'markdown'
        };
        language = langMap[extension] || 'javascript';
      } else if (activeDevelopmentTab === 'web-ide') {
        // Try to get code from Web IDE
        const codeEditor = document.querySelector('.monaco-editor');
        if (codeEditor) {
          currentCode = codeEditor.textContent || '';
        }
      }
      
      if (!currentCode.trim()) {
        setGlobalSnackbar({
          open: true,
          message: 'No code found to analyze. Please open a file in the Web IDE or select a file with code content.',
          severity: 'warning'
        });
        return;
      }
      
      const actionPrompts = {
        explain_code: `Explain this ${language} code in clear, simple terms:\n\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\nProvide a step-by-step explanation of what this code does, its purpose, and how it works.`,
        fix_code: `Analyze this ${language} code and fix any bugs or issues:\n\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\nReturn the corrected code with explanations of what was fixed. If no issues are found, suggest potential improvements.`,
        optimize_code: `Optimize this ${language} code for better performance and readability:\n\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\nProvide the optimized version with explanations of the improvements made.`,
        refactor_code: `Refactor this ${language} code to improve structure and maintainability:\n\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\nProvide the refactored code with explanations of the structural improvements.`,
        comment_code: `Add detailed comments to this ${language} code:\n\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\nReturn the code with comprehensive comments explaining each part and function.`
      };
      
      const response = await llmIntegration.chatWithAI(actionPrompts[actionType], []);
      
      const actionLabels = {
        explain_code: '🤖 Code Explanation',
        fix_code: '🔧 Code Fix',
        optimize_code: '⚡ Code Optimization', 
        refactor_code: '🏗️ Code Refactoring',
        comment_code: '📝 Code Comments'
      };
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `${actionLabels[actionType]}

**File**: ${fileName}
**Language**: ${language}

${response}

${actionType !== 'explain_code' ? '\n💡 **Tip**: You can copy the improved code and paste it back into your file.' : ''}`,
        timestamp: new Date(),
        type: actionType,
        codeAction: {
          action: actionType,
          fileName: fileName,
          language: language
        }
      };
      
      setGlobalChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error(`Error in code ${actionType}:`, error);
      setGlobalSnackbar({
        open: true,
        message: `Failed to ${actionType.replace('_', ' ')} code`,
        severity: 'error'
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  const globalHandleCodeExecution = async (intent) => {
    try {
      setIsGlobalChatLoading(true);
      
      // Get current file content
      let currentCode = '';
      let fileName = '';
      
      if (selectedResource && selectedResource.notes) {
        currentCode = selectedResource.notes;
        fileName = selectedResource.title || 'untitled.js';
      } else if (activeDevelopmentTab === 'web-ide') {
        // Try to get code from Web IDE
        const codeEditor = document.querySelector('.monaco-editor');
        if (codeEditor) {
          currentCode = codeEditor.textContent || '';
        }
        fileName = 'current-code.js';
      }
      
      if (!currentCode.trim()) {
        setGlobalSnackbar({
          open: true,
          message: 'No code found to execute. Please open a file in the Web IDE or select a file with JavaScript code.',
          severity: 'warning'
        });
        return;
      }
      
      // Execute JavaScript code in a sandbox
      let output = '';
      const sandbox = {
        console: {
          log: (...args) => output += args.join(' ') + '\n',
          error: (...args) => output += 'ERROR: ' + args.join(' ') + '\n',
          warn: (...args) => output += 'WARNING: ' + args.join(' ') + '\n',
          info: (...args) => output += 'INFO: ' + args.join(' ') + '\n'
        },
        setTimeout, setInterval, clearTimeout, clearInterval,
        Date, Math, JSON, parseInt, parseFloat, isNaN, isFinite
      };

      try {
        output += '🚀 Executing code...\n\n';
        const result = new Function(...Object.keys(sandbox), currentCode);
        result(...Object.values(sandbox));
        output += '\n✅ Code executed successfully!';
      } catch (error) {
        output += `\n❌ Execution Error: ${error.message}`;
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `🚀 **Code Execution Result**

**File**: ${fileName}

**Output:**
\`\`\`
${output}
\`\`\`

💡 **Note**: Code execution runs in a secure sandbox environment with limited capabilities.`,
        timestamp: new Date(),
        type: 'execute_code',
        codeExecution: {
          fileName: fileName,
          output: output
        }
      };
      
      setGlobalChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error executing code:', error);
      setGlobalSnackbar({
        open: true,
        message: 'Failed to execute code',
        severity: 'error'
      });
    } finally {
      setIsGlobalChatLoading(false);
    }
  };

  // Google Docs creation function
  const createNewGoogleDoc = async (title) => {
    if (!googleToken) {
      setGlobalSnackbar({
        open: true,
        message: 'Please sign in to Google first',
        severity: 'error'
      });
      return;
    }

    setIsCreatingGoogleDoc(true);
    
    try {
      const response = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title || `New Document - ${new Date().toLocaleDateString()}`
        })
      });
      
      if (response.ok) {
        const newDoc = await response.json();
        const newDocUrl = `https://docs.google.com/document/d/${newDoc.documentId}/edit`;
        setGoogleDocUrl(newDocUrl);
        setActiveDevelopmentTab('gdocs');
        
        setGlobalSnackbar({
          open: true,
          message: `Google Doc "${newDoc.title}" created and opened!`,
          severity: 'success'
        });

        // Close dialog and reset form
        setShowGoogleDocDialog(false);
        setNewGoogleDocTitle('');
      } else {
        throw new Error(`Failed to create document: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating Google Doc:', error);
      setGlobalSnackbar({
        open: true,
        message: 'Failed to create new Google Doc. Please check your permissions.',
        severity: 'error'
      });
    } finally {
      setIsCreatingGoogleDoc(false);
    }
  };

  // Google Sheets creation function
  const createNewGoogleSheet = async (title) => {
    if (!googleToken) {
      setGlobalSnackbar({ open: true, message: 'Please sign in to Google first to create a Google Sheet.', severity: 'error' });
      return;
    }
    setIsCreatingGoogleSheet(true);
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: { title: title || `New Sheet ${new Date().toLocaleString()}` } })
      });
      if (res.ok) {
        const sheet = await res.json();
        const url = `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit`;
        setGoogleSheetUrl(url);
        setActiveDevelopmentTab('gsheets');
        setShowGoogleSheetDialog(false);
        setNewGoogleSheetTitle('');
        setGlobalSnackbar({ open: true, message: 'Google Sheet created and opened.', severity: 'success' });
      } else {
        const txt = await res.text();
        // Fallback via Drive API if Sheets API is disabled (403)
        if (res.status === 403) {
          const driveRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: title || `New Sheet ${new Date().toLocaleString()}`,
              mimeType: 'application/vnd.google-apps.spreadsheet'
            })
          });
          if (!driveRes.ok) {
            const driveTxt = await driveRes.text();
            throw new Error(`Sheets disabled; Drive fallback failed: ${driveTxt}`);
          }
          const created = await driveRes.json();
          const url = `https://docs.google.com/spreadsheets/d/${created.id}/edit`;
          setGoogleSheetUrl(url);
          setActiveDevelopmentTab('gsheets');
          setShowGoogleSheetDialog(false);
          setNewGoogleSheetTitle('');
          setGlobalSnackbar({ open: true, message: 'Google Sheet created via Drive and opened.', severity: 'success' });
        } else {
          throw new Error(txt);
        }
      }
    } catch (e) {
      console.error('Create Sheet failed:', e);
      setGlobalSnackbar({ open: true, message: 'Failed to create Google Sheet. Enable Sheets API or try again.', severity: 'error' });
    } finally {
      setIsCreatingGoogleSheet(false);
    }
  };

  // Google Slides creation function
  const createNewGoogleSlides = async (title) => {
    if (!googleToken) {
      setGlobalSnackbar({ open: true, message: 'Please sign in to Google first to create Google Slides.', severity: 'error' });
      return;
    }
    setIsCreatingGoogleSlides(true);
    try {
      const res = await fetch('https://slides.googleapis.com/v1/presentations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || `New Slides ${new Date().toLocaleString()}` })
      });
      if (res.ok) {
        const pres = await res.json();
        const url = `https://docs.google.com/presentation/d/${pres.presentationId}/edit`;
        setGoogleSlidesUrl(url);
        setActiveDevelopmentTab('gslides');
        setShowGoogleSlidesDialog(false);
        setNewGoogleSlidesTitle('');
        setGlobalSnackbar({ open: true, message: 'Google Slides created and opened.', severity: 'success' });
      } else {
        const txt = await res.text();
        // Fallback via Drive API if Slides API is disabled (403)
        if (res.status === 403) {
          const driveRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: title || `New Slides ${new Date().toLocaleString()}`,
              mimeType: 'application/vnd.google-apps.presentation'
            })
          });
          if (!driveRes.ok) {
            const driveTxt = await driveRes.text();
            throw new Error(`Slides disabled; Drive fallback failed: ${driveTxt}`);
          }
          const created = await driveRes.json();
          const url = `https://docs.google.com/presentation/d/${created.id}/edit`;
          setGoogleSlidesUrl(url);
          setActiveDevelopmentTab('gslides');
          setShowGoogleSlidesDialog(false);
          setNewGoogleSlidesTitle('');
          setGlobalSnackbar({ open: true, message: 'Google Slides created via Drive and opened.', severity: 'success' });
        } else {
          throw new Error(txt);
        }
      }
    } catch (e) {
      console.error('Create Slides failed:', e);
      setGlobalSnackbar({ open: true, message: 'Failed to create Google Slides. Enable Slides API or try again.', severity: 'error' });
    } finally {
      setIsCreatingGoogleSlides(false);
    }
  };

  // Google Forms creation function (Drive fallback if Forms API unavailable)
  const createNewGoogleForm = async (title) => {
    if (!googleToken) {
      setGlobalSnackbar({ open: true, message: 'Please sign in to Google first to create a Google Form.', severity: 'error' });
      return;
    }
    setIsCreatingGoogleForm(true);
    try {
      // Preferred: Forms API (may require additional enablement and scopes)
      const formsRes = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ info: { title: title || `New Form ${new Date().toLocaleString()}` } })
      });
      if (formsRes.ok) {
        const form = await formsRes.json();
        // The Forms API returns a formId; open edit URL
        const url = `https://docs.google.com/forms/d/${form.formId}/edit`;
        setGoogleFormUrl(url);
        setActiveDevelopmentTab('gforms');
        setShowGoogleFormDialog(false);
        setNewGoogleFormTitle('');
        setGlobalSnackbar({ open: true, message: 'Google Form created and opened.', severity: 'success' });
      } else {
        const txt = await formsRes.text();
        // Fallback via Drive API
        if (formsRes.status === 403 || formsRes.status === 404) {
          const driveRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${googleToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: title || `New Form ${new Date().toLocaleString()}`,
              mimeType: 'application/vnd.google-apps.form'
            })
          });
          if (!driveRes.ok) {
            const driveTxt = await driveRes.text();
            throw new Error(`Forms disabled; Drive fallback failed: ${driveTxt}`);
          }
          const created = await driveRes.json();
          const url = `https://docs.google.com/forms/d/${created.id}/edit`;
          setGoogleFormUrl(url);
          setActiveDevelopmentTab('gforms');
          setShowGoogleFormDialog(false);
          setNewGoogleFormTitle('');
          setGlobalSnackbar({ open: true, message: 'Google Form created via Drive and opened.', severity: 'success' });
        } else {
          throw new Error(txt);
        }
      }
    } catch (e) {
      console.error('Create Form failed:', e);
      setGlobalSnackbar({ open: true, message: 'Failed to create Google Form. Enable Forms API or try again.', severity: 'error' });
    } finally {
      setIsCreatingGoogleForm(false);
    }
  };

  // --- Refresh workspaces from Supabase ---
  
  // Add periodic refresh of team member status
  useEffect(() => {
    if (!selectedWksp || !user) return;
    
    const refreshInterval = setInterval(async () => {
      console.log('Refreshing team member status...');
      const updatedCollaborators = await fetchCollaboratorsWithPresence(selectedWksp.id);
      setCollaborators(updatedCollaborators);
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [selectedWksp, user]);
  
async function fetchCollaborators(workspaceId) {
  const { data } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId);
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();
  let ids = [workspace.owner_id].concat((data || []).map(m => m.user_id).filter(Boolean));
  let { data: users } = await supabase
    .from('users')
    .select('*')
    .in('id', ids);
  return {members: data || [], ownerId: workspace.owner_id, users: users || []};
}

// Fix pending invites to 'active' status (this database uses 'active' not 'accepted')
async function fixExistingAcceptedInvites() {
  console.log('=== FIXING PENDING INVITES TO ACTIVE ===');
  
  const { data: pendingInvites, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('user_email', user.email)
    .eq('status', 'pending');
  
  console.log('Found pending invites to fix:', pendingInvites);
  
  if (pendingInvites && pendingInvites.length > 0) {
    for (const invite of pendingInvites) {
      const { error: updateError } = await supabase
        .from('workspace_members')
        .update({ status: 'active' })
        .eq('id', invite.id);
      
      if (updateError) {
        console.error('Error fixing invite:', updateError);
      } else {
        console.log('Fixed invite for workspace:', invite.workspace_id);
      }
    }
    
    console.log('All pending invites fixed! Refreshing workspaces...');
    fetchWorkspaces();
  }
}

// Clean up orphaned workspace_members records (pointing to non-existent workspaces)
async function cleanUpOrphanedMemberships() {
  console.log('=== CLEANING UP ORPHANED MEMBERSHIPS ===');
  
  // Get all workspace IDs that actually exist
  const { data: existingWorkspaces } = await supabase
    .from('workspaces')
    .select('id');
  const existingIds = (existingWorkspaces || []).map(w => w.id);
  console.log('Existing workspace IDs:', existingIds);
  
  // Get all workspace_members entries
  const { data: allMembers } = await supabase
    .from('workspace_members')
    .select('*');
  
  // Find orphaned entries
  const orphanedEntries = (allMembers || []).filter(member => 
    !existingIds.includes(member.workspace_id)
  );
  console.log('Found orphaned membership entries:', orphanedEntries);
  
  // Delete orphaned entries
  for (const orphan of orphanedEntries) {
    console.log(`Deleting orphaned membership: ${orphan.id} for workspace: ${orphan.workspace_id}`);
    const { data, error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', orphan.id);
    
    if (error) {
      console.error(`Failed to delete ${orphan.id}:`, error);
    } else {
      console.log(`Successfully deleted ${orphan.id}:`, data);
    }
  }
  
  console.log(`Cleaned up ${orphanedEntries.length} orphaned memberships`);
  setGlobalSnackbar({
    open: true,
    message: `Cleaned up ${orphanedEntries.length} orphaned membership records`,
    severity: 'success'
  });
  
  // Refresh workspaces after cleanup
  fetchWorkspaces();
}

// Debug function to check workspace_members table
async function debugWorkspaceMembers() {
  console.log('=== DEBUGGING WORKSPACE MEMBERS ===');
  console.log('Current user:', user?.email, user?.id);
  
  // Get ALL workspace_members entries
  let { data: allMembers, error: allError } = await supabase
    .from('workspace_members')
    .select('*');
  
  console.log('ALL workspace_members entries:', allMembers, 'Error:', allError);
  
  // Filter for current user
  const userEntries = allMembers?.filter(m => 
    m.user_email === user?.email || m.user_id === user?.id
  );
  
  console.log('Entries for current user:', userEntries);
  
  // Log each entry in detail
  userEntries?.forEach((entry, index) => {
    console.log(`Entry ${index}:`, {
      id: entry.id,
      workspace_id: entry.workspace_id,
      user_email: entry.user_email,
      user_id: entry.user_id,
      status: entry.status,
      invited_at: entry.invited_at,
      accepted_at: entry.accepted_at
    });
  });
  
  // Check accepted entries (database uses 'active' for accepted)
  const acceptedEntries = userEntries?.filter(m => m.status === 'active');
  console.log('ACTIVE entries for current user:', acceptedEntries);
}

async function fetchWorkspaces() {
    console.log('Fetching workspaces for user:', user?.email, user?.id);
    
    // Debug workspace members
    await debugWorkspaceMembers();
    
    // Get workspaces owned by the user
    let { data: owned, error: ownedError } = await supabase.from('workspaces').select('*').eq('owner_id', user.id);
    console.log('Owned workspaces:', owned, 'Error:', ownedError);
    
    // Get workspaces where user is a member - regardless of status
    // This will show invited workspaces even if not yet accepted
    let { data: memberRowsByEmail, error: emailError } = await supabase
      .from('workspace_members')
      .select('workspace_id, user_id, status, user_email')
      .eq('user_email', user.email);
    
    let { data: memberRowsByUserId, error: userIdError } = await supabase
      .from('workspace_members')
      .select('workspace_id, user_id, status, user_email')
      .eq('user_id', user.id);
    
    console.log('Member workspaces by email:', memberRowsByEmail, 'Error:', emailError);
    console.log('Member workspaces by user_id:', memberRowsByUserId, 'Error:', userIdError);
    
    // Combine both member queries
    const allMemberRows = [
      ...(memberRowsByEmail || []),
      ...(memberRowsByUserId || [])
    ];
    
    // Get unique workspace IDs from accepted memberships
    let memberWorkspaceIds = [...new Set(allMemberRows.map(wm => wm.workspace_id))];
    console.log('Member workspace IDs (before filtering):', memberWorkspaceIds);
    
    // FILTER OUT workspace IDs that don't exist in the workspaces table
    // We'll do this filtering in the shared workspaces query itself
    
    let shared = [];
    if (memberWorkspaceIds.length > 0) {
      console.log('Querying workspaces table for IDs:', memberWorkspaceIds);
      
      // First, let's see what's actually in the workspaces table
      let { data: allWorkspaces, error: allError } = await supabase
        .from('workspaces')
        .select('id, name, owner_id');
      console.log('ALL workspaces in database:', allWorkspaces, 'Error:', allError);
      console.log('Existing workspace IDs:', (allWorkspaces || []).map(w => w.id));
      
      // Try direct query first (for owned workspaces or open RLS)
      let { data: sharedData, error: sharedError } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', memberWorkspaceIds);
      
      console.log('Direct shared workspaces query result:', sharedData, 'Error:', sharedError);
      
      // If direct query fails due to RLS, try joining through workspace_members
      if (!sharedData || sharedData.length === 0) {
        console.log('Direct query returned empty, trying join through workspace_members...');
        console.log('Join query params:', {
          user_email: user.email,
          status: 'active',
          workspace_ids: memberWorkspaceIds
        });
        
        let { data: joinedData, error: joinedError } = await supabase
          .from('workspace_members')
          .select(`
            workspace_id,
            workspaces (*)
          `)
          .eq('user_email', user.email)
          .in('workspace_id', memberWorkspaceIds);
        
        console.log('Joined query result:', joinedData, 'Error:', joinedError);
        
        if (joinedData) {
          joinedData.forEach((item, index) => {
            console.log(`Join result ${index}:`, {
              workspace_id: item.workspace_id,
              workspaces: item.workspaces
            });
          });
        }
        
        // Extract workspace data from the join
        shared = (joinedData || [])
          .map(item => item.workspaces)
          .filter(workspace => workspace !== null);
        
        console.log('Extracted shared workspaces from join:', shared);
      } else {
        shared = sharedData || [];
      }
      
      // Check which IDs are missing
      const foundIds = shared.map(w => w.id);
      const missingIds = memberWorkspaceIds.filter(id => !foundIds.includes(id));
      console.log('Missing workspace IDs (these might be RLS restricted):', missingIds);
      console.log('Found shared workspaces:', foundIds);
    }
    
    console.log('Shared workspaces:', shared);
    
    // Combine and deduplicate workspaces
    const allWorkspaces = [...owned || [], ...shared].filter((wksp, idx, arr) =>
      arr.findIndex(w => w.id === wksp.id) === idx);
    
    console.log('Final workspaces:', allWorkspaces);
    setWorkspaces(allWorkspaces);
  }
 /* async function fetchCollaborators(workspaceId) {
  // Get all entries in workspace_members for this workspace
  const { data } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId);
  // Also get owner from 'workspaces'
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();
  // Also get user profiles
  let ids = [workspace.owner_id].concat((data || []).map(m => m.user_id).filter(Boolean));
  let { data: users } = await supabase
    .from('users')
    .select('*')
    .in('id', ids);
  return {members: data || [], ownerId: workspace.owner_id, users: users || []};
}*/
// const [collaborators, setCollaborators] = useState({members: [], ownerId: null, users: []});
useEffect(() => {
  if (selectedWksp) {
    fetchCollaboratorsWithPresence(selectedWksp.id).then(setCollaborators);
  }
}, [selectedWksp, showShare]);
useEffect(() => {
  if (selectedWksp) {
    fetchCollaboratorsWithPresence(selectedWksp.id).then(setCollaborators);
  }
}, [selectedWksp, showShare]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
      // Auto-accept any pending invites for this user
      autoAcceptInvites();
    }
    // eslint-disable-next-line
  }, [user]);

  const [isProcessingInvites, setIsProcessingInvites] = useState(false);

  async function autoAcceptInvites() {
    if (!user || !user.email) {
      console.log('No user or email available for autoAcceptInvites');
      return;
    }

    if (isProcessingInvites) {
      console.log('Already processing invites, skipping...');
      return;
    }

    setIsProcessingInvites(true);

    try {
      console.log('Checking for pending invites for:', user.email);
      
      // Find any pending invites for this user
      const { data: pendingInvites, error } = await supabase
        .from('workspace_members')
        .select('workspace_id, id, user_email, accepted_at, invited_at')
        .eq('user_email', user.email)
        .is('accepted_at', null);

      // Also check all workspace_members for this user to see what exists
      const { data: allMemberships, error: allError } = await supabase
        .from('workspace_members')
        .select('workspace_id, id, user_email, accepted_at, invited_at, role, invited_by')
        .eq('user_email', user.email);

      console.log('All memberships for this user:', allMemberships);
      
      // Also check if there are any workspace_members entries for this email at all
      const { data: allEntriesForEmail, error: emailError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_email', user.email);
      
      console.log('All entries for this email:', allEntriesForEmail);

      if (error) {
        console.error('Error checking pending invites:', error);
        return;
      }

      console.log('Found pending invites:', pendingInvites?.length || 0, pendingInvites);

      // Accept all pending invites
      for (const invite of pendingInvites || []) {
        console.log('Processing invite for workspace:', invite.workspace_id);
        
        const { error: updateError } = await supabase
          .from('workspace_members')
          .update({ 
            status: 'active',
            accepted_at: new Date().toISOString(),
            user_id: user.id
          })
          .eq('id', invite.id);

        if (updateError) {
          console.error('Error accepting invite:', updateError);
        } else {
          console.log('Successfully accepted invite for workspace:', invite.workspace_id);
        }
      }

      // Refresh workspaces after accepting invites
      if (pendingInvites && pendingInvites.length > 0) {
        console.log('Refreshing workspaces after accepting invites');
        await fetchWorkspaces();
        console.log('Workspaces refreshed');
      }
    } catch (error) {
      console.error('Error in autoAcceptInvites:', error);
    } finally {
      setIsProcessingInvites(false);
    }
  }

  // ---- Workspace-specific folders/resources ----
  const wsId = selectedWksp?.id || "__none__";
  const [folders, setFolders] = useState(() =>
    loadData(wsId, "folders", [makeFolder("All Resources", ROOT_ID, ROOT_ID)]));
  const [resources, setResources] = useState(() => loadData(wsId, "resources", []));
  
  // Load and save data using localStorage (primary storage)
  useEffect(() => {
    setFolders(loadData(wsId, "folders", [makeFolder("All Resources", ROOT_ID, ROOT_ID)]));
    setResources(loadData(wsId, "resources", []));
    // eslint-disable-next-line
  }, [wsId]);
  
  useEffect(() => { saveData(wsId, "folders", folders); }, [folders, wsId]);
  useEffect(() => { saveData(wsId, "resources", resources); }, [resources, wsId]);

  // Background Supabase sync (secondary storage for sharing)
  const [lastSyncTime, setLastSyncTime] = useState(0);
  
  useEffect(() => {
    async function syncToSupabase() {
      if (!selectedWksp?.id) return;
      
      // Prevent rapid successive syncs (debounce)
      const now = Date.now();
      if (now - lastSyncTime < 2000) { // Wait at least 2 seconds between syncs
        return;
      }
      
      try {
        console.log('🔄 Starting background sync to Supabase...');
        
        // Sync folders and resources to Supabase in the background
        await Promise.all([
          supabaseWorkspaceStorage.saveFolders(selectedWksp.id, folders),
          supabaseWorkspaceStorage.saveWorkspaceFiles(selectedWksp.id, resources)
        ]);
        
        setLastSyncTime(now);
        console.log('✅ Background sync to Supabase completed');
      } catch (error) {
        console.error('Background Supabase sync failed:', error);
        // Don't show error to user - this is just for sharing
      }
    }
    
    // Only sync if we have data and workspace is selected
    if (selectedWksp?.id && (folders.length > 1 || resources.length > 0)) {
      syncToSupabase();
    }
  }, [folders, resources, selectedWksp?.id, lastSyncTime]);


  // --- Other UI states ---
  const [activeFolder, setActiveFolder] = useState(ROOT_ID);
  const [expandedFolders, setExpandedFolders] = useState(new Set([ROOT_ID])); // Track which folders are expanded
  
  // Update global file creator folder when activeFolder changes
  useEffect(() => {
    setGlobalFileCreatorData(prev => ({ ...prev, folder: activeFolder }));
  }, [activeFolder]);
  const blankForm = { title: "", url: "", tags: "", notes: "", platform: "", folder: activeFolder };
  // If searchScope is still used, restore it:
  const [searchScope, setSearchScope] = useState("everywhere");
  const [form, setForm] = useState({ title: "", url: "", tags: "", notes: "", platform: "", folder: ROOT_ID });
  const [editing, setEditing] = useState(null);

  // Toggle folder expansion
  function toggleFolderExpansion(folderId) {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }

  function addChildFolder(parent) {
    const name = prompt("Folder Name?");
    if (!name) return;
    setFolders([...folders, makeFolder(name.trim(), parent)]);
  }
  function renameFolder(id) {
    const name = prompt("Rename folder to:");
    if (!name) return;
    setFolders(folders.map(f => (f.id === id ? { ...f, text: name.trim() } : f)));
  }
  function deleteFolder(id) {
    if (id === ROOT_ID) return;
    const removeIds = [id, ...getDescendantFolders(folders, id)];
    setFolders(folders.filter(f => !removeIds.includes(f.id)));
    setResources(resources.filter(r => !removeIds.includes(r.folder)));
    if (removeIds.includes(activeFolder)) setActiveFolder(ROOT_ID);
  }
  function addOrUpdate() {
    if (!form.title || !form.url) return;
    const newObj = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      id: editing || Date.now() + Math.random()
    };
    setResources(editing
      ? resources.map(r => (r.id === editing ? newObj : r))
      : [...resources, newObj]
    );
    setForm({ ...blankForm, folder: activeFolder });
    setEditing(null);
  }
  function removeResource(id) { setResources(resources.filter(r => r.id !== id)); }
  function editResource(refOrId) {
    let ref = refOrId;
    if (typeof refOrId === "string" || typeof refOrId === "number") ref = resources.find(r => r.id === refOrId);
    if (!ref) return;
    setForm({ ...ref, tags: (ref.tags || []).join(", "), folder: ref.folder }); setEditing(ref.id);
  }
  const combinedTree = combineToTree(folders, resources);

  function handleDrop(tree, opts) {
    if (opts.dragSource.droppable)
      setFolders(tree.filter(node => node.droppable).map(({ id, parent, text }) => ({ id, parent, text, droppable: true })));
    else {
      const dropTargetNode = tree.find(n => n.id === opts.dropTargetId && n.droppable);
      if (!dropTargetNode) return;
      setResources(resources.map(r => r.id === opts.dragSource.id ? { ...r, folder: dropTargetNode.id } : r));
    }
  }
  function canDrop(tree, opts) {
    if (opts.dragSource.droppable) {
      if (opts.dragSource.id === ROOT_ID) return false;
      if (opts.dropTargetId === null || opts.dropTargetId === undefined) return false;
      if (opts.dragSource.id === opts.dropTargetId) return false;
      const descendants = getDescendants(tree.filter(n => n.droppable), opts.dragSource.id);
      if (descendants.includes(opts.dropTargetId)) return false;
      const dropTargetNode = tree.find(n => n.id === opts.dropTargetId); return !!dropTargetNode && dropTargetNode.droppable;
    } else {
      const dropTargetNode = tree.find(n => n.id === opts.dropTargetId);
      return dropTargetNode && dropTargetNode.droppable;
    }
  }
  function hasAnyChildren(nodeId) {
    return combinedTree.some(n => n.parent === nodeId && n.id !== nodeId);
  }
  function getSearchItems() {
    let folderIds;
    if (searchScope === "everywhere") folderIds = folders.map(f => f.id);
    else folderIds = getDescendantFolderIds(folders, activeFolder);
    const folderResults = folders.filter(
      f => f.id !== ROOT_ID && folderIds.includes(f.id) &&
        f.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const fileResults = resources.filter(
      r => folderIds.includes(r.folder) &&
        ((r.title + " " + r.tags + " " + r.platform + " " + r.notes)
          .toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return [...folderResults.map(f => ({ type: "folder", folder: f })), ...fileResults.map(r => ({ type: "file", resource: r }))];
  }
  const searchResults = searchQuery.trim()
    ? resources.filter(r => {
        // Scope logic
        let inScope = true;
        if (searchTabScope === 'folder') {
          const folderIds = getDescendantFolderIdsForSearch(folders, activeFolder);
          inScope = folderIds.includes(r.folder);
        }
        return inScope && (r.title + " " + r.tags + " " + r.platform + " " + r.notes)
          .toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];
  const onSearchResultClick = (result) => {
    // Load the resource into the Resources section for editing
    setSelectedResource(result);
    
    // Check if it's a GitHub file and open in GitHub editor
    if (isGitHubResource(result) && result.url) {
      const githubInfo = extractGitHubInfo(result.url);
      if (githubInfo) {
        setGithubRepo(githubInfo.repoFullName);
        setGithubFile(githubInfo.filePath);
        setActiveDevelopmentTab('github');
        return;
      }
    }
    
    // Check if it's a Google Doc and open in Google Docs editor
    if (isGoogleDocResource(result) && result.url) {
      setGoogleDocUrl(result.url);
      setActiveDevelopmentTab('gdocs');
      return;
    }
    
    // Check if it's a Google Drive resource and open in Google Drive tab
    if (isGoogleDriveResource(result) && result.url) {
      setActiveDevelopmentTab('gdrive');
      setGlobalSnackbar({
        open: true,
        message: `Opening Google Drive resource: ${result.title}`,
        severity: 'info'
      });
      return;
    }
    
    // For other resources, just open in Resources tab
    setActiveDevelopmentTab('resources');
  };
  const folderResources = resources
    .filter(r => r.folder === activeFolder)

  async function addFoldersAndResources(newFolders, newFiles) {
    if (!selectedWksp?.id) {
      console.error('No workspace selected for import');
      return;
    }

    console.log(`📁 Importing ${newFolders.length} folders and ${newFiles.length} files to workspace ${selectedWksp.id}`);

    try {
      // For large imports, save directly to Supabase instead of localStorage
      if (newFiles.length > 100) {
        console.log('🔄 Large import detected, saving directly to Supabase...');
        
        // Save folders first
        if (newFolders.length > 0) {
          await supabaseWorkspaceStorage.saveFolders(selectedWksp.id, newFolders);
          console.log('✅ Folders saved to Supabase');
        }
        
        // Save files in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < newFiles.length; i += batchSize) {
          const batch = newFiles.slice(i, i + batchSize);
          await supabaseWorkspaceStorage.saveWorkspaceFiles(selectedWksp.id, batch);
          console.log(`✅ Saved batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newFiles.length/batchSize)}`);
        }
        
        // Reload data from Supabase
        const [loadedFolders, loadedFiles] = await Promise.all([
          supabaseWorkspaceStorage.loadFolders(selectedWksp.id),
          supabaseWorkspaceStorage.loadWorkspaceFiles(selectedWksp.id)
        ]);
        
        setFolders(loadedFolders);
        setResources(loadedFiles);
        
        console.log('✅ Large import completed successfully');
      } else {
        // For small imports, use the existing approach
    setFolders(old => {
      // DO NOT dedupe by folder name/parent alone: must treat full import as authoritative
      return [...old, ...newFolders];
    });
    setResources(old => [...old, ...newFiles]);
      }
    } catch (error) {
      console.error('❌ Error during import:', error);
      alert('Import failed: ' + error.message);
    }
  }

  async function deleteWorkspace(wkspId) {
    if (!window.confirm("Delete this workspace and all its folders/resources in your local browser?")) return;
    try {
      console.log('Attempting to delete workspace:', wkspId);
      console.log('Current user:', user);
      // Check if user is the owner of the workspace
      const { data: workspace, error: workspaceFetchError } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', wkspId)
        .single();
      if (workspaceFetchError) {
        console.error('Error fetching workspace:', workspaceFetchError);
        alert('Error fetching workspace: ' + workspaceFetchError.message);
        return;
      }
      if (!workspace || workspace.owner_id !== user.id) {
        alert('You can only delete workspaces you own.');
        return;
      }
      // First delete all workspace chats
      const { error: chatsError } = await supabase
        .from('workspace_chats')
        .delete()
        .eq('workspace_id', wkspId);
      if (chatsError) {
        console.error('Error deleting workspace chats:', chatsError);
        alert('Error deleting workspace chats: ' + chatsError.message);
      }
      // Then delete all workspace members
      const { error: membersError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', wkspId);
      if (membersError) {
        console.error('Error deleting workspace members:', membersError);
        alert(`Error deleting workspace members: ${membersError.message}`);
        return;
      }
      // Finally delete the workspace
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', wkspId);
      if (workspaceError) {
        console.error('Error deleting workspace:', workspaceError);
        alert(`Error deleting workspace: ${workspaceError.message}`);
        return;
      }
      // Clear local storage
      localStorage.removeItem(`folders-${wkspId}`);
      localStorage.removeItem(`resources-${wkspId}`);
      setSelectedWksp(null);
      await fetchWorkspaces();
      alert('Workspace deleted successfully!');
    } catch (err) {
      console.error('Unexpected error deleting workspace:', err);
      alert('Unexpected error occurred while deleting workspace: ' + err.message);
    }
  }

  // On user login, claim all pending invites and re-fetch collaborators
  useEffect(() => {
    async function claimInvitesAndRefresh() {
      if (!user) return;
      
      console.log('Claiming invites for user:', user.email);
      
      // Find all invites for this email with no user_id
      const { data: invites, error: fetchError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_email', user.email)
        .is('user_id', null);
        
      if (fetchError) {
        console.error('Error fetching invites:', fetchError);
        return;
      }
      
      console.log('Found pending invites:', invites);
      
      if (invites && invites.length > 0) {
        for (const invite of invites) {
          console.log('Claiming invite:', invite.id);
          const { error: updateError } = await supabase
            .from('workspace_members')
            .update({ 
              user_id: user.id,
              accepted_at: new Date().toISOString()
            })
            .eq('id', invite.id);
            
          if (updateError) {
            console.error('Error claiming invite:', updateError);
          }
        }
        
        // Re-fetch workspaces and collaborators
        await fetchWorkspaces();
        if (selectedWksp) {
          const updatedCollaborators = await fetchCollaboratorsWithPresence(selectedWksp.id);
          setCollaborators(updatedCollaborators);
        }
      }
    }
    claimInvitesAndRefresh();
  }, [user, selectedWksp]);

  // --- Presence system: update last_seen on login and interval (15s, 1 min online) ---
  useEffect(() => {
    let interval;
    async function updatePresence() {
      if (!user) return;
      try {
        const now = new Date().toISOString();
        await supabase
          .from('user_presence')
          .upsert(
            { 
              user_id: user.id, 
              last_seen: now,
              status: 'online',
              updated_at: now
            },
            { onConflict: 'user_id' }
          );
        console.log('Updated presence for user:', user.id);
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    }
    if (user) {
      updatePresence();
      interval = setInterval(updatePresence, 15000); // every 15s
    }
    return () => clearInterval(interval);
  }, [user]);

  // --- Fetch presence for collaborators ---
  async function fetchCollaboratorsWithPresence(workspaceId) {
    if (!workspaceId) {
      console.warn('fetchCollaboratorsWithPresence called with null workspaceId');
      return { members: [], ownerId: null, users: [] };
    }
    
    try {
      console.log('Fetching collaborators with presence for workspace:', workspaceId);
      
      const { data: members } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId);
        
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single();
        
      if (!workspace) {
        console.warn('Workspace not found:', workspaceId);
        return { members: members || [], ownerId: null, users: [] };
      }
      
      // Get all user IDs (owner + members)
      let userIds = [workspace.owner_id];
      if (members && members.length > 0) {
        userIds = userIds.concat(members.map(m => m.user_id).filter(Boolean));
      }
      
      console.log('User IDs to fetch:', userIds);
      
      // Fetch user profiles
      let { data: users } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);
        
      // Fetch presence data
      let { data: presence } = await supabase
        .from('user_presence')
        .select('*')
        .in('user_id', userIds);
        
      console.log('Presence data:', presence);
      
      // Attach presence to users and calculate online status
      users = (users || []).map(u => {
        const p = (presence || []).find(pr => pr.user_id === u.id);
        const lastSeen = p?.last_seen ? new Date(p.last_seen) : null;
        const now = new Date();
        const timeDiff = lastSeen ? (now.getTime() - lastSeen.getTime()) : null;
        
        // Consider online if last_seen is within 2 minutes
        const isOnline = lastSeen && timeDiff && timeDiff < 2 * 60 * 1000;
        
        return { 
          ...u, 
          last_seen: p?.last_seen,
          status: p?.status || 'offline',
          isOnline: isOnline
        };
      });
      
      console.log('Processed users with presence:', users);
      
      return { 
        members: members || [], 
        ownerId: workspace.owner_id, 
        users: users || [] 
      };
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      return { members: [], ownerId: null, users: [] };
    }
  }

  // --- Recursive tree rendering for folders and files ---
  function renderTreeNode(node, folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren, depth = 0) {
    if (!node) return null;
    const childFolders = folders.filter(f => f.parent === node.id && f.id !== node.id);
    const childFiles = resources.filter(r => r.folder === node.id);
    const isExpanded = expandedFolders.has(node.id);
    const hasChildren = childFolders.length > 0 || childFiles.length > 0;
    
    return (
      <div key={node.id}>
        <Box className={node.id === activeFolder ? 'mui-folder' : ''} sx={{ ml: depth * 2, fontWeight: node.id === 0 ? 800 : 600, cursor: 'pointer', display: 'flex', alignItems: 'center', px: 1, py: 0.5 }} onClick={() => setActiveFolder(node.id)}>
          {hasChildren && (
            <IconButton 
              size="small" 
              onClick={e => { e.stopPropagation(); toggleFolderExpansion(node.id); }}
              sx={{ mr: 0.5, p: 0.25 }}
            >
              {isExpanded ? '▼' : '▶'}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 20, mr: 0.5 }} />}
          <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography sx={{ flex: 1 }} fontWeight={node.id === 0 ? 800 : 600}>{node.text}</Typography>
          <Tooltip title="Add subfolder"><IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); addChildFolder(node.id); }}><AddIcon fontSize="small" /></IconButton></Tooltip>
          {node.id !== 0 && (
            <>
              <Tooltip title="Rename"><IconButton size="small" color="info" onClick={e => { e.stopPropagation(); renameFolder(node.id); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={e => { e.stopPropagation(); deleteFolder(node.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </>
          )}
        </Box>
        {/* Only render children if expanded */}
        {isExpanded && (
          <>
            {/* Render child files */}
            {childFiles.map(childFile => (
              <Box key={childFile.id} className="mui-resource" sx={{ ml: (depth + 1) * 2, display: 'flex', alignItems: 'center', cursor: 'grab', px: 1, py: 0.5, bgcolor: '#fff7de', border: '1px dotted #eee' }} onClick={async () => {
                // Check if it's a Google Doc and open in editor
                if (isGoogleDocResource(childFile)) {
                  setGoogleDocUrl(childFile.url);
                  setActiveDevelopmentTab('gdocs');
                } else if (isGitHubResource(childFile)) {
                  // Open GitHub files in Web IDE with GitHub integration
                  const githubInfo = extractGitHubInfo(childFile.url);
                  if (githubInfo) {
                    // Create a GitHub-aware resource for the Web IDE
                    const githubResource = {
                      ...childFile,
                      isGitHubFile: true,
                      githubInfo: githubInfo,
                      title: githubInfo.filePath.split('/').pop() || childFile.title,
                      platform: 'github'
                    };
                    
                    // Try to fetch the file content from GitHub
                    try {
                      const response = await fetch(`https://api.github.com/repos/${githubInfo.repoFullName}/contents/${githubInfo.filePath}`, {
                        headers: globalGithubToken ? {
                          'Authorization': `token ${globalGithubToken}`
                        } : {}
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        
                        // GitHub API returns base64 encoded content for files
                        if (data.content && data.encoding === 'base64') {
                          const content = atob(data.content.replace(/\s/g, ''));
                          githubResource.notes = content;
                          githubResource.originalContent = content; // Store original for comparison
                        } else if (data.download_url) {
                          // Fallback: fetch from download_url for raw content
                          const rawResponse = await fetch(data.download_url);
                          if (rawResponse.ok) {
                            const content = await rawResponse.text();
                            githubResource.notes = content;
                            githubResource.originalContent = content;
                          }
                  } else {
                          githubResource.notes = `// Could not decode content from GitHub\n// Repository: ${githubInfo.repoFullName}\n// File: ${githubInfo.filePath}\n// Response type: ${data.type}`;
                  }
                } else {
                        githubResource.notes = `// Could not fetch content from GitHub\n// Repository: ${githubInfo.repoFullName}\n// File: ${githubInfo.filePath}\n// Please check your GitHub token or repository access.`;
                      }
                    } catch (error) {
                      console.error('Error fetching GitHub file:', error);
                      githubResource.notes = `// Error fetching content from GitHub\n// Repository: ${githubInfo.repoFullName}\n// File: ${githubInfo.filePath}\n// Error: ${error.message}`;
                    }
                    
                    setSelectedResource(githubResource);
                    setActiveDevelopmentTab('web-ide');
                  } else {
                    // Fallback if GitHub info extraction fails
                    setSelectedResource(childFile);
                    setActiveDevelopmentTab('web-ide');
                  }
                } else {
                  // Open local files in Web IDE
                  setSelectedResource(childFile);
                  setActiveDevelopmentTab('web-ide');
                }
              }} title="Click to edit">
                <Box sx={{ width: 20, mr: 0.5 }} />
                {isGoogleDocResource(childFile) ? (
                  <GoogleIcon sx={{ mr: 1, color: 'primary.main' }} />
                ) : isGitHubResource(childFile) ? (
                  <GitHubIcon sx={{ mr: 1, color: 'secondary.main' }} />
                ) : (
                  <InsertDriveFileIcon sx={{ mr: 1, color: 'warning.main' }} />
                )}
                <Typography sx={{ flex: 1 }}>{childFile.title}</Typography>
                <Tooltip title="Edit resource"><IconButton size="small" color="info" onClick={e => { e.stopPropagation(); editResource(childFile); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete resource"><IconButton size="small" sx={{ color: 'error.main' }} onClick={e => { e.stopPropagation(); removeResource(childFile.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
              </Box>
            ))}
            {/* Recursively render child folders */}
            {childFolders.map(childFolder =>
              renderTreeNode(childFolder, folders, resources, activeFolder, setActiveFolder, editResource, removeResource, addChildFolder, renameFolder, deleteFolder, hasAnyChildren, depth + 1)
            )}
          </>
        )}
      </div>
    );
  }

  // Helper to get descendant folder IDs
  function getDescendantFolderIdsForSearch(folders, startId, visited = new Set()) {
    if (visited.has(startId)) return [];
    visited.add(startId);
    let ids = [startId];
    for (const f of folders.filter(f => f.parent === startId)) {
      ids = ids.concat(getDescendantFolderIdsForSearch(folders, f.id, visited));
    }
    return ids;
  }

  // -------- MAIN RENDER --------
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card className="mui-card" sx={{ p: 4, width: '100%', boxShadow: 3 }}>
            <Typography variant="h4" fontWeight={700} mb={2} align="center" color="primary">Sign In</Typography>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
          </Card>
        </Container>
      </ThemeProvider>
    )
  }

  if (!selectedWksp) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Card className="mui-card" sx={{ mb: 4, p: 3 }}>
            <Typography variant="h3" fontWeight={800} mb={2} color="primary.main">My Workspaces</Typography>
            <WorkspaceCreator currentUser={user} onCreated={() => {
              setSelectedWksp(null);
              fetchWorkspaces();
            }} />
          </Card>
          <Card className="mui-card" sx={{ mb: 4, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight={700} color="primary">Workspaces you can access:</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={fixExistingAcceptedInvites}
                  color="success"
                  sx={{ ml: 2 }}
                >
                  Fix Invites
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={cleanUpOrphanedMemberships}
                  color="warning"
                  sx={{ ml: 1 }}
                >
                  Clean Orphans
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={debugWorkspaceMembers}
                  sx={{ ml: 1 }}
                >
                  Debug
                </Button>
              </Box>
            </Box>
            <List>
              {workspaces.map(wksp => (
                <ListItem key={wksp.id} sx={{ mb: 1, borderRadius: 2, boxShadow: 1, bgcolor: '#f8fafc' }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Open"><IconButton color="primary" onClick={async () => {
                        setSelectedWksp(wksp);
                        
                        // Try to load shared files from Supabase (for collaboration)
                        try {
                          const [sharedFolders, sharedResources] = await Promise.all([
                            supabaseWorkspaceStorage.loadFolders(wksp.id),
                            supabaseWorkspaceStorage.loadWorkspaceFiles(wksp.id)
                          ]);
                          
                          // If we found shared data, use it instead of localStorage
                          if (sharedFolders.length > 1 || sharedResources.length > 0) {
                            console.log('Found shared data in Supabase, using it');
                            setFolders(sharedFolders);
                            setResources(sharedResources);
                          }
                        } catch (error) {
                          console.log('No shared data found, using localStorage');
                        }
                      }}><FolderIcon /></IconButton></Tooltip>
                      <Tooltip title="Share"><IconButton color="info" onClick={() => setShowShare(wksp.id)}><ShareIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton sx={{ color: 'error.main' }} onClick={async () => { await deleteWorkspace(wksp.id); setSelectedWksp(null); fetchWorkspaces(); }}><DeleteIcon /></IconButton></Tooltip>
                    </Stack>
                  }>
                  <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary={<Typography fontWeight={700}>{wksp.name}</Typography>}
                    secondary={
                      wksp.owner_id === user.id ? 
                        'Owner' : 
                        'Member'
                    }
                  />
                </ListItem>
              ))}
              {workspaces.length === 0 && (
                <ListItem>
                  <ListItemText primary={<Typography color="text.secondary" fontStyle="italic">No workspaces yet. Create or ask someone to invite you.</Typography>} />
                </ListItem>
              )}
            </List>
            {showShare && <WorkspaceShare 
              workspaceId={showShare} 
              currentUser={user} 
              workspaceName={workspaces.find(w => w.id === showShare)?.name || 'Workspace'}
              onShared={() => setShowShare(null)} 
              onInviteSuccess={async () => {
    if (selectedWksp) {
      const updated = await fetchCollaboratorsWithPresence(selectedWksp.id);
      setCollaborators(updated);
    }
              }} 
            />}
          </Card>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              sx={{ 
                color: 'secondary.main',
                borderColor: 'secondary.main',
                '&:hover': {
                  borderColor: 'secondary.dark',
                  backgroundColor: 'secondary.light',
                  color: 'secondary.contrastText',
                }
              }}
              startIcon={<LogoutIcon />} 
              onClick={async () => { 
                try {
                  console.log('Signing out...');
                  const { error } = await supabase.auth.signOut();
                  if (error) {
                    console.error('Sign out error:', error);
                    // Force redirect to login
                    window.location.href = '/';
                  } else {
                    console.log('Sign out successful');
                    // Force redirect to login
                    window.location.href = '/';
                  }
                } catch (err) {
                  console.error('Sign out failed:', err);
                  // Force redirect to login
                  window.location.href = '/';
                }
              }}
            >
              Sign out
            </Button>
          </Box>
        </Container>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <>

        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            DevHub Workspace
          </Typography>
          <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} indicatorColor="primary" textColor="primary">
            <Tab label="Workspaces" />
            <Tab icon={<CloudUploadIcon />} label="Marketplace" />
          </Tabs>
        </Toolbar>
      </AppBar>
      
      {mainTab === 0 && (
        <DndProvider backend={HTML5Backend}>
          {!selectedWksp ? (
            // Workspace Selection View
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <Card sx={{ mb: 4, p: 4, bgcolor: '#fafbfc' }}>
                <Typography variant="h3" fontWeight={800} mb={3} color="primary.main" align="center">
                  Developer Workspaces
                </Typography>
                <WorkspaceCreator currentUser={user} onCreated={() => {
                  setSelectedWksp(null);
                  fetchWorkspaces();
                }} />
              </Card>
              
              <Grid container spacing={3}>
                {workspaces.map(wksp => (
                  <Grid item xs={12} md={6} lg={4} key={wksp.id}>
                    <Card sx={{ 
                      p: 3, 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }} onClick={() => setSelectedWksp(wksp)}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                          <FolderIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={700}>{wksp.name}</Typography>
                          <Typography variant="body2" color="text.secondary">Click to open</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" startIcon={<ShareIcon />} onClick={(e) => { e.stopPropagation(); setShowShare(wksp.id); }}>
                          Share
                        </Button>
                                        <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ 
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': {
                      borderColor: 'error.dark',
                      backgroundColor: 'error.light',
                      color: 'error.contrastText',
                    }
                  }}
                  startIcon={<DeleteIcon />} 
                  onClick={(e) => { e.stopPropagation(); deleteWorkspace(wksp.id); }}
                >
                  Delete
                </Button>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {showShare && <WorkspaceShare 
                workspaceId={showShare} 
                currentUser={user} 
                workspaceName={workspaces.find(w => w.id === showShare)?.name || 'Workspace'}
                onShared={() => setShowShare(null)} 
                onInviteSuccess={async () => {
                if (selectedWksp) {
                  const updated = await fetchCollaboratorsWithPresence(selectedWksp.id);
                  setCollaborators(updated);
                }
                }} 
              />}
            </Container>
          ) : (
            // Main Workspace View
            <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
              {/* Sidebar Toggle Button */}
              <IconButton
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                sx={{
                  position: 'fixed',
                  top: '70px',
                  left: sidebarCollapsed ? '8px' : '308px',
                  zIndex: 1300,
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  transition: 'left 0.3s ease'
                }}
              >
                {sidebarCollapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
              </IconButton>

              {/* Left Sidebar - File Explorer & Tools */}
              <Box sx={{ 
                width: sidebarCollapsed ? 0 : 320,
                borderRight: sidebarCollapsed ? 'none' : '1px solid #e0e0e0', 
                bgcolor: '#f8f9fa',
                overflowY: 'auto',
                overflow: sidebarCollapsed ? 'hidden' : 'auto',
                p: sidebarCollapsed ? 0 : 2,
                transition: 'width 0.3s ease, padding 0.3s ease'
              }}>
                {!sidebarCollapsed && (
                  <>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {selectedWksp.name}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => setSelectedWksp(null)}>
                    <ArrowBackIcon />
                  </Button>
                </Stack>

                {/* File Explorer Section */}
                <CollapsibleSection
                  title="File Explorer"
                  expanded={expandedSections.fileExplorer}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, fileExplorer: !prev.fileExplorer }))}
                  icon={<FolderIcon color="primary" />}
                >
                  <EnhancedFileExplorer
                    folders={folders}
                    resources={resources}
                    activeFolder={activeFolder}
                    setActiveFolder={setActiveFolder}
                    editResource={editResource}
                    removeResource={removeResource}
                    addChildFolder={addChildFolder}
                    renameFolder={renameFolder}
                    deleteFolder={deleteFolder}
                    hasAnyChildren={hasAnyChildren}
                    viewState={fileExplorerView}
                    setViewState={setFileExplorerView}
                    renderTreeNode={renderTreeNode}
                    setFolders={setFolders}
                    setResources={setResources}
                  />
                </CollapsibleSection>

                {/* Collaborators Section */}
                <CollapsibleSection
                  title="Team"
                  expanded={expandedSections.collaborators}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, collaborators: !prev.collaborators }))}
                  icon={<GroupIcon color="success" />}
                  color="success"
                >
                  <EnhancedTeam
                    collaborators={collaborators}
                    selectedWksp={selectedWksp}
                    setShowShare={setShowShare}
                    viewState={teamView}
                    setViewState={setTeamView}
                  />
                </CollapsibleSection>

                {/* Chat Section */}
                <CollapsibleSection
                  title="Team Chat"
                  expanded={expandedSections.chat}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, chat: !prev.chat }))}
                  icon={<ChatIcon color="info" />}
                  color="info"
                >
                  <EnhancedChatSystem
                    workspaceId={selectedWksp.id}
                    currentUserId={user.id}
                    collaborators={collaborators.members.filter(m=>m.user_id)}
                  />
                </CollapsibleSection>

                {/* AI Tools Section */}
                <CollapsibleSection
                  title="AI Tools"
                  expanded={expandedSections.aiTools}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, aiTools: !prev.aiTools }))}
                  icon={<SmartToyIcon sx={{ color: 'secondary.main' }} />}
                  color="secondary"
                >
                  <EnhancedAiTools
                    setShowEnhancedAI={setShowEnhancedAI}
                    setShowStorageTest={setShowStorageTest}
                    selectedWksp={selectedWksp}
                    resources={resources}
                    setGlobalSnackbar={setGlobalSnackbar}
                    user={user}
                    viewState={aiToolsView}
                    setViewState={setAiToolsView}
                  />
                </CollapsibleSection>

                {/* Resources Section */}
                <CollapsibleSection
                  title="Resources"
                  expanded={expandedSections.resources}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, resources: !prev.resources }))}
                  icon={<InsertDriveFileIcon color="warning" />}
                  color="warning"
                >
                  <EnhancedResources
                    folderResources={folderResources}
                    setSelectedResource={setSelectedResource}
                    viewState={resourcesView}
                    setViewState={setResourcesView}
                  />
                </CollapsibleSection>
                  </>
                )}
              </Box>

              {/* Main Development Area */}
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                ml: sidebarCollapsed ? '40px' : '0px',
                transition: 'margin-left 0.3s ease'
              }}>
                {/* Development Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}>
                  <Tabs
                    value={['gdocs','gsheets','gslides','gforms','gdrive','gdrawings','gsites','glooker'].includes(activeDevelopmentTab) ? 'google' : activeDevelopmentTab}
                    onChange={(_, v) => {
                      if (v === 'google') {
                        if (!['gdocs','gsheets','gslides','gforms','gdrive','gdrawings','gsites','glooker'].includes(activeDevelopmentTab)) {
                          setActiveDevelopmentTab('gdocs');
                        }
                      } else {
                        setActiveDevelopmentTab(v);
                      }
                    }}
                  >
                    <Tab label="Google Workspace" value="google" />
                    <Tab label="Web IDE" value="web-ide" />
                    <Tab label="Resources" value="resources" />
                    <Tab label="Search" value="search" />
                    <Tab label="Import" value="import" />
                  </Tabs>
                </Box>

                {/* Development Content */}
                <Box sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: '#fff' }}>

                  {/* Google Suite Grouped UI */}
                  {['gdocs','gsheets','gslides','gforms','gdrive','gdrawings','gsites','glooker'].includes(activeDevelopmentTab) && (
                    <Card sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" fontWeight={700}>Google Workspace</Typography>
                        <Typography variant="body2" color="text.secondary">Access Docs, Sheets, Slides, Forms, and Drive from one place</Typography>
                      </Box>
                      <Box sx={{ px: 2, pt: 2 }}>
                        <Tabs
                          value={activeDevelopmentTab}
                          onChange={(_, v) => setActiveDevelopmentTab(v)}
                          variant="scrollable"
                          scrollButtons="auto"
                          sx={{
                            '.MuiTab-root': { textTransform: 'none', minHeight: 40 },
                            '.MuiTabs-indicator': { height: 3 }
                          }}
                        >
                          <Tab label="Drive" value="gdrive" />
                          <Tab label="Docs" value="gdocs" />
                          <Tab label="Sheets" value="gsheets" />
                          <Tab label="Slides" value="gslides" />
                          <Tab label="Forms" value="gforms" />
                          <Tab label="Drawings" value="gdrawings" />
                          <Tab label="Sites" value="gsites" />
                          <Tab label="Looker Studio" value="glooker" />
                        </Tabs>
                      </Box>
                    </Card>
                  )}

                                     {activeDevelopmentTab === 'gdocs' && (
                     <Box>
                       <Typography variant="h5" fontWeight={700} mb={3}>Google Docs Development</Typography>
                       
                       {/* Google Authentication */}
                       {!googleToken && (
                       <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                         <Typography variant="h6" fontWeight={600} mb={2}>
                             <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                             Connect Google Account
                         </Typography>
                         <Typography variant="body2" color="text.secondary" mb={2}>
                             Sign in with Google to access and edit Google Docs directly in your workspace.
                         </Typography>
                         <Button 
                           variant="contained" 
                             startIcon={<GoogleIcon />}
                             onClick={() => loginWithGoogle()}
                             sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#3367d6' } }}
                           >
                             Sign in with Google
                         </Button>
                       </Card>
                       )}

                       {/* Google Docs Actions */}
                       <Card sx={{ p: 3, mb: 3, bgcolor: '#f0f8ff' }}>
                         <Typography variant="h6" fontWeight={600} mb={2}>
                           📝 Google Docs Actions
                         </Typography>
                         
                         {/* Create New Doc */}
                         <Stack direction="row" spacing={2} mb={3} alignItems="center">
                           <Button 
                             variant="contained" 
                             disabled={!googleToken || isCreatingGoogleDoc}
                             onClick={() => setShowGoogleDocDialog(true)}
                             startIcon={isCreatingGoogleDoc ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}
                             sx={{ 
                               background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
                               '&:hover': {
                                 background: 'linear-gradient(45deg, #3367d6 30%, #2e7d32 90%)'
                               }
                             }}
                           >
                             {isCreatingGoogleDoc ? 'Creating...' : 'Create New Doc'}
                           </Button>
                           <Button 
                             variant="outlined" 
                             disabled={!googleToken || isCreatingGoogleDoc}
                             onClick={() => createNewGoogleDoc()}
                             startIcon={<NoteAddIcon />}
                           >
                             Quick Create
                           </Button>
                           {googleToken && (
                             <Chip 
                               label="Google Connected" 
                               color="success" 
                               icon={<GoogleIcon />}
                             variant="outlined" 
                             />
                           )}
                         </Stack>

                       {/* Document URL Input */}
                         <Stack direction="row" spacing={2} alignItems="center">
                         <TextField
                             label="Or open existing Google Doc URL"
                           value={googleDocUrl}
                           onChange={e => setGoogleDocUrl(e.target.value)}
                           placeholder="https://docs.google.com/document/d/..."
                           sx={{ width: 400 }}
                           disabled={!googleToken}
                         />
                         <Button 
                             variant="outlined" 
                           disabled={!googleDocUrl || !googleToken}
                           onClick={() => {
                             if (googleDocUrl && googleToken) {
                               // Extract document ID from URL
                               const match = googleDocUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
                               if (match) {
                                 const docId = match[1];
                                   setGlobalSnackbar({
                                     open: true,
                                     message: 'Google Doc loaded successfully!',
                                     severity: 'success'
                                   });
                                 } else {
                                   setGlobalSnackbar({
                                     open: true,
                                     message: 'Invalid Google Doc URL format',
                                     severity: 'error'
                                   });
                                 }
                               }
                             }}
                             startIcon={<OpenInNewIcon />}
                           >
                             Open Doc
                         </Button>
                       </Stack>
                       </Card>

                       {/* Google Docs Editor */}
                       {googleDocUrl && googleToken && (
                           <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                             <EmbeddedGoogleDocsEditor
                               docUrl={googleDocUrl}
                               googleToken={googleToken}
                               onExit={() => {
                                 setGoogleDocUrl('');
                                 setActiveDevelopmentTab('gdocs');
                               }}
                             />
                           </Card>
                       )}

                       
                     </Box>
                   )}

                    {activeDevelopmentTab === 'gsheets' && (
                      <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Google Sheets Development</Typography>
                        {!googleToken && (
                          <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                              <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Connect to Google
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Sign in with Google to open or create Google Sheets in your workspace.
                            </Typography>
                            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => loginWithGoogle()}>
                              Sign in with Google
                            </Button>
                          </Card>
                        )}
                        {/* Google Sheets Actions */}
                        <Card sx={{ p: 3, mb: 3, bgcolor: '#f0fff8' }}>
                          <Typography variant="h6" fontWeight={600} mb={2}>📊 Google Sheets Actions</Typography>
                          <Stack direction="row" spacing={2} mb={3} alignItems="center">
                            <Button variant="contained" disabled={!googleToken || isCreatingGoogleSheet} onClick={() => setShowGoogleSheetDialog(true)} startIcon={isCreatingGoogleSheet ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}> {isCreatingGoogleSheet ? 'Creating...' : 'Create New Sheet'} </Button>
                            <Button variant="outlined" disabled={!googleToken || isCreatingGoogleSheet} onClick={() => createNewGoogleSheet()} startIcon={<NoteAddIcon />}> Quick Create </Button>
                            {googleToken && (<Chip label="Google Connected" color="success" icon={<GoogleIcon />} variant="outlined" />)}
                          </Stack>
                          {/* Sheet URL Input */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                              label="Or open existing Google Sheet URL"
                              value={googleSheetUrl}
                              onChange={e => setGoogleSheetUrl(e.target.value)}
                              placeholder="https://docs.google.com/spreadsheets/d/..."
                              sx={{ width: 400 }}
                              disabled={!googleToken}
                            />
                            <Button variant="outlined" disabled={!googleSheetUrl || !googleToken} onClick={() => setGlobalSnackbar({ open: true, message: 'Google Sheet loaded successfully!', severity: 'success' })} startIcon={<OpenInNewIcon />}> Open Sheet </Button>
                          </Stack>
                        </Card>
                        {googleSheetUrl && googleToken && (
                          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <EmbeddedGoogleSheetsEditor
                              sheetUrl={googleSheetUrl}
                              googleToken={googleToken}
                              onExit={() => {
                                setGoogleSheetUrl('');
                                setActiveDevelopmentTab('gsheets');
                              }}
                            />
                          </Card>
                        )}
                      </Box>
                    )}

                    {activeDevelopmentTab === 'gslides' && (
                      <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Google Slides Development</Typography>
                        {!googleToken && (
                          <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                              <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Connect to Google
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Sign in with Google to open or create Google Slides in your workspace.
                            </Typography>
                            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => loginWithGoogle()}>
                              Sign in with Google
                            </Button>
                          </Card>
                        )}
                        {/* Google Slides Actions */}
                        <Card sx={{ p: 3, mb: 3, bgcolor: '#fff8f0' }}>
                          <Typography variant="h6" fontWeight={600} mb={2}>📽️ Google Slides Actions</Typography>
                          <Stack direction="row" spacing={2} mb={3} alignItems="center">
                            <Button variant="contained" disabled={!googleToken || isCreatingGoogleSlides} onClick={() => setShowGoogleSlidesDialog(true)} startIcon={isCreatingGoogleSlides ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}> {isCreatingGoogleSlides ? 'Creating...' : 'Create New Slides'} </Button>
                            <Button variant="outlined" disabled={!googleToken || isCreatingGoogleSlides} onClick={() => createNewGoogleSlides()} startIcon={<NoteAddIcon />}> Quick Create </Button>
                            {googleToken && (<Chip label="Google Connected" color="success" icon={<GoogleIcon />} variant="outlined" />)}
                          </Stack>
                          {/* Slides URL Input */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                              label="Or open existing Google Slides URL"
                              value={googleSlidesUrl}
                              onChange={e => setGoogleSlidesUrl(e.target.value)}
                              placeholder="https://docs.google.com/presentation/d/..."
                              sx={{ width: 400 }}
                              disabled={!googleToken}
                            />
                            <Button variant="outlined" disabled={!googleSlidesUrl || !googleToken} onClick={() => setGlobalSnackbar({ open: true, message: 'Google Slides loaded successfully!', severity: 'success' })} startIcon={<OpenInNewIcon />}> Open Slides </Button>
                          </Stack>
                        </Card>
                        {googleSlidesUrl && googleToken && (
                          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <EmbeddedGoogleSlidesEditor
                              slidesUrl={googleSlidesUrl}
                              googleToken={googleToken}
                              onExit={() => {
                                setGoogleSlidesUrl('');
                                setActiveDevelopmentTab('gslides');
                              }}
                            />
                          </Card>
                        )}
                      </Box>
                    )}

                    {activeDevelopmentTab === 'gdrawings' && (
                      <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Google Drawings Development</Typography>
                        {!googleToken && (
                          <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                              <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Connect to Google
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Sign in with Google to open or create Google Drawings in your workspace.
                            </Typography>
                            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => loginWithGoogle()}>
                              Sign in with Google
                            </Button>
                          </Card>
                        )}
                        {/* Google Drawings Actions */}
                        <Card sx={{ p: 3, mb: 3, bgcolor: '#f8fff0' }}>
                          <Typography variant="h6" fontWeight={600} mb={2}>🖼️ Google Drawings Actions</Typography>
                          <Stack direction="row" spacing={2} mb={3} alignItems="center">
                            <Button variant="contained" disabled={!googleToken || isCreatingGoogleDrawing} onClick={() => setShowGoogleDrawingDialog(true)} startIcon={isCreatingGoogleDrawing ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}> {isCreatingGoogleDrawing ? 'Creating...' : 'Create New Drawing'} </Button>
                            <Button variant="outlined" disabled={!googleToken || isCreatingGoogleDrawing} onClick={() => createNewGoogleDrawing()} startIcon={<NoteAddIcon />}> Quick Create </Button>
                            {googleToken && (<Chip label="Google Connected" color="success" icon={<GoogleIcon />} variant="outlined" />)}
                          </Stack>
                          {/* Drawing URL Input */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                              label="Open existing Google Drawing URL"
                              value={googleDrawingUrl}
                              onChange={e => setGoogleDrawingUrl(e.target.value)}
                              placeholder="https://docs.google.com/drawings/d/..."
                              sx={{ width: 400 }}
                              disabled={!googleToken}
                            />
                            <Button variant="outlined" disabled={!googleDrawingUrl || !googleToken} onClick={() => setGlobalSnackbar({ open: true, message: 'Google Drawing loaded successfully!', severity: 'success' })} startIcon={<OpenInNewIcon />}> Open Drawing </Button>
                          </Stack>
                        </Card>
                        {googleDrawingUrl && googleToken && (
                          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <EmbeddedGoogleDrawingsEditor
                              drawingUrl={googleDrawingUrl}
                              googleToken={googleToken}
                              onExit={() => {
                                setGoogleDrawingUrl('');
                                setActiveDevelopmentTab('gdrawings');
                              }}
                            />
                          </Card>
                        )}
                      </Box>
                    )}

                    {activeDevelopmentTab === 'gsites' && (
                      <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Google Sites</Typography>
                        {/* Google Sites Actions */}
                        <Card sx={{ p: 3, mb: 3, bgcolor: '#f0f0ff' }}>
                          <Typography variant="h6" fontWeight={600} mb={2}>🌐 Google Sites Actions</Typography>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Button variant="contained" disabled={isCreatingGoogleSite} onClick={() => setShowGoogleSiteDialog(true)} startIcon={isCreatingGoogleSite ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}>{isCreatingGoogleSite ? 'Creating...' : 'Create New Site'}</Button>
                            <Button variant="outlined" disabled={isCreatingGoogleSite} onClick={() => createNewGoogleSite()} startIcon={<NoteAddIcon />}>Quick Create</Button>
                            <TextField
                              label="Open Google Sites URL"
                              value={googleSiteUrl}
                              onChange={e => setGoogleSiteUrl(e.target.value)}
                              placeholder="https://sites.google.com/..."
                              sx={{ width: 500 }}
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">Editing Google Sites in an iframe is limited; use Open in New Tab when needed.</Typography>
                        </Card>
                        {googleSiteUrl && (
                          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <EmbeddedGoogleSitesViewer
                              siteUrl={googleSiteUrl}
                              onExit={() => {
                                setGoogleSiteUrl('');
                                setActiveDevelopmentTab('gsites');
                              }}
                            />
                          </Card>
                        )}
                      </Box>
                    )}

                    {activeDevelopmentTab === 'glooker' && (
                      <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Looker Studio</Typography>
                        {/* Looker Studio Actions */}
                        <Card sx={{ p: 3, mb: 3, bgcolor: '#fff0f5' }}>
                          <Typography variant="h6" fontWeight={600} mb={2}>📊 Looker Studio Actions</Typography>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Button variant="contained" disabled={isCreatingLookerReport} onClick={() => setShowLookerReportDialog(true)} startIcon={isCreatingLookerReport ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}>{isCreatingLookerReport ? 'Creating...' : 'Create New Report'}</Button>
                            <Button variant="outlined" disabled={isCreatingLookerReport} onClick={() => createNewLookerReport()} startIcon={<NoteAddIcon />}>Quick Create</Button>
                            <TextField
                              label="Open Looker Studio Report URL"
                              value={lookerStudioUrl}
                              onChange={e => setLookerStudioUrl(e.target.value)}
                              placeholder="https://lookerstudio.google.com/reporting/..."
                              sx={{ width: 500 }}
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">Editing Looker Studio in an iframe is limited; use Open in New Tab to edit.
                          </Typography>
                        </Card>
                        {lookerStudioUrl && (
                          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <EmbeddedLookerStudioViewer
                              reportUrl={lookerStudioUrl}
                              onExit={() => {
                                setLookerStudioUrl('');
                                setActiveDevelopmentTab('glooker');
                              }}
                            />
                          </Card>
                        )}
                      </Box>
                    )}

                    {activeDevelopmentTab === 'gforms' && (
                      <Box>
                        <Typography variant="h5" fontWeight={700} mb={3}>Google Forms Development</Typography>
                        {!googleToken && (
                          <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                              <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Connect to Google
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Sign in with Google to open or create Google Forms in your workspace.
                            </Typography>
                            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => loginWithGoogle()}>
                              Sign in with Google
                            </Button>
                          </Card>
                        )}
                        {/* Google Forms Actions */}
                        <Card sx={{ p: 3, mb: 3, bgcolor: '#f8f9ff' }}>
                          <Typography variant="h6" fontWeight={600} mb={2}>🧾 Google Forms Actions</Typography>
                          <Stack direction="row" spacing={2} mb={3} alignItems="center">
                            <Button variant="contained" disabled={!googleToken || isCreatingGoogleForm} onClick={() => setShowGoogleFormDialog(true)} startIcon={isCreatingGoogleForm ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}> {isCreatingGoogleForm ? 'Creating...' : 'Create New Form'} </Button>
                            <Button variant="outlined" disabled={!googleToken || isCreatingGoogleForm} onClick={() => createNewGoogleForm()} startIcon={<NoteAddIcon />}> Quick Create </Button>
                            {googleToken && (<Chip label="Google Connected" color="success" icon={<GoogleIcon />} variant="outlined" />)}
                          </Stack>
                          {/* Form URL Input */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                              label="Or open existing Google Form URL"
                              value={googleFormUrl}
                              onChange={e => setGoogleFormUrl(e.target.value)}
                              placeholder="https://docs.google.com/forms/d/..."
                              sx={{ width: 400 }}
                              disabled={!googleToken}
                            />
                            <Button variant="outlined" disabled={!googleFormUrl || !googleToken} onClick={() => setGlobalSnackbar({ open: true, message: 'Google Form loaded successfully!', severity: 'success' })} startIcon={<OpenInNewIcon />}> Open Form </Button>
                          </Stack>
                        </Card>
                        {googleFormUrl && googleToken && (
                          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <EmbeddedGoogleFormsEditor
                              formUrl={googleFormUrl}
                              googleToken={googleToken}
                              onExit={() => {
                                setGoogleFormUrl('');
                                setActiveDevelopmentTab('gforms');
                              }}
                            />
                          </Card>
                        )}
                     </Box>
                   )}

                   {activeDevelopmentTab === 'gdrive' && (
                     <Box>
                       <Typography variant="h5" fontWeight={700} mb={3}>Google Drive Integration</Typography>
                       
                       {/* Google Drive Picker */}
                       <GoogleDrivePicker
                         googleToken={googleToken}
                         setGoogleToken={setGoogleToken}
                         setGlobalSnackbar={setGlobalSnackbar}
                         loginWithGoogle={loginWithGoogle}
                         onFileSelect={(file) => {
                           // Handle file selection - could open in appropriate editor
                           if (file.mimeType && file.mimeType.includes('document')) {
                             // For Google Docs, open in the Google Docs tab
                             const docUrl = `https://docs.google.com/document/d/${file.id}/edit`;
                             setGoogleDocUrl(docUrl);
                             setActiveDevelopmentTab('gdocs');
                             setGlobalSnackbar({
                               open: true,
                               message: `Opening ${file.name} in Google Docs editor`,
                               severity: 'success'
                             });
                           } else if (file.mimeType && file.mimeType.includes('spreadsheet')) {
                              const sheetUrl = `https://docs.google.com/spreadsheets/d/${file.id}/edit`;
                              setGoogleSheetUrl(sheetUrl);
                              setActiveDevelopmentTab('gsheets');
                             setGlobalSnackbar({
                               open: true,
                                message: `Opening ${file.name} in Google Sheets editor`,
                                severity: 'success'
                             });
                           } else if (file.mimeType && file.mimeType.includes('presentation')) {
                              const slidesUrl = `https://docs.google.com/presentation/d/${file.id}/edit`;
                              setGoogleSlidesUrl(slidesUrl);
                              setActiveDevelopmentTab('gslides');
                             setGlobalSnackbar({
                               open: true,
                                message: `Opening ${file.name} in Google Slides editor`,
                                severity: 'success'
                              });
                            } else if (file.mimeType && file.mimeType.includes('form')) {
                              const formUrl = `https://docs.google.com/forms/d/${file.id}/edit`;
                              setGoogleFormUrl(formUrl);
                              setActiveDevelopmentTab('gforms');
                              setGlobalSnackbar({
                                open: true,
                                message: `Opening ${file.name} in Google Forms editor`,
                                severity: 'success'
                              });
                            } else if (file.mimeType && file.mimeType.includes('drawing')) {
                              const drawingUrl = `https://docs.google.com/drawings/d/${file.id}/edit`;
                              setGoogleDrawingUrl(drawingUrl);
                              setActiveDevelopmentTab('gdrawings');
                              setGlobalSnackbar({
                                open: true,
                                message: `Opening ${file.name} in Google Drawings editor`,
                                severity: 'success'
                              });
                            } else if (file.mimeType && file.mimeType.includes('site')) {
                              // Google Sites are Drive items with mimeType application/vnd.google-apps.site
                              // Not always enabled; route by constructing a Sites URL if possible
                              const siteUrl = file.webViewLink || `https://sites.google.com/?authuser=0`;
                              setGoogleSiteUrl(siteUrl);
                              setActiveDevelopmentTab('gsites');
                              setGlobalSnackbar({
                                open: true,
                                message: `Opening ${file.name} in Google Sites`,
                                severity: 'success'
                              });
                            } else if (file.name && /lookerstudio\.google\.com|datastudio\.google\.com/.test(file.name)) {
                              const reportUrl = file.webViewLink || '';
                              if (reportUrl) {
                                setLookerStudioUrl(reportUrl);
                                setActiveDevelopmentTab('glooker');
                                setGlobalSnackbar({ open: true, message: `Opening ${file.name} in Looker Studio`, severity: 'success' });
                              }
                           } else if (file.downloadUrl) {
                             // For other files, open download URL
                             window.open(file.downloadUrl, '_blank');
                             setGlobalSnackbar({
                               open: true,
                               message: `Opening ${file.name} in new tab`,
                               severity: 'info'
                             });
                           } else {
                             setGlobalSnackbar({
                               open: true,
                               message: `Selected ${file.name}`,
                               severity: 'info'
                             });
                           }
                         }}
                       />
                     </Box>
                   )}

                  {activeDevelopmentTab === 'web-ide' && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" fontWeight={700}>
                          {useEnhancedIDE ? 'Enhanced AI IDE' : 'Web IDE'}
                           </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                            {useEnhancedIDE ? 'AI-Enhanced' : 'Standard'}
                              </Typography>
                           <Button 
                            variant={useEnhancedIDE ? "contained" : "outlined"}
                            onClick={() => setUseEnhancedIDE(!useEnhancedIDE)}
                            startIcon={useEnhancedIDE ? <SmartToyIcon /> : <CodeIcon />}
                            sx={{ 
                              background: useEnhancedIDE ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : 'transparent',
                              '&:hover': {
                                background: useEnhancedIDE ? 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)' : 'rgba(0,0,0,0.04)'
                              }
                            }}
                          >
                            {useEnhancedIDE ? 'Enhanced' : 'Switch to AI'}
                           </Button>
                     </Box>
                      </Box>

                      <Card sx={{ p: 3, mb: 3, bgcolor: useEnhancedIDE ? '#f0f8ff' : '#f5f5f5' }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          {useEnhancedIDE ? (
                            <>
                              <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                              Cursor-Inspired AI Code Editor
                            </>
                          ) : (
                            <>
                          <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Standard Code Editor
                            </>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {useEnhancedIDE ? (
                            <>
                              🚀 <strong>AI-Powered Features:</strong> Intelligent code completion, real-time AI chat assistant, context-aware suggestions, code analysis, and automated refactoring - just like Cursor IDE!
                            </>
                          ) : (
                            'Write, debug, and execute code with syntax highlighting and basic features.'
                          )}
                        </Typography>
                        {useEnhancedIDE && (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label="🤖 AI Chat" size="small" color="primary" variant="outlined" />
                            <Chip label="⚡ Smart Completion" size="small" color="primary" variant="outlined" />
                            <Chip label="🔧 Code Analysis" size="small" color="primary" variant="outlined" />
                            <Chip label="🏗️ Auto Refactor" size="small" color="primary" variant="outlined" />
                            <Chip label="📝 AI Comments" size="small" color="primary" variant="outlined" />
                    </Box>
                  )}
                      </Card>
                      
                      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', height: '70vh' }}>
                        {useEnhancedIDE ? (
                          <EnhancedWebIDE 
                          selectedFile={selectedResource}
                            sidebarCollapsed={sidebarCollapsed}
                            availableFolders={(() => {
                              // Create available folders list from current workspace structure
                              const availableFolders = [];
                              
                              // Always include root folder
                              availableFolders.push({
                                id: 0,
                                name: 'All Resources',
                                path: 'Root'
                              });

                              // Try to get folders from workspace if they exist
                              try {
                                if (selectedWksp && selectedWksp.folders) {
                                  selectedWksp.folders.forEach(folder => {
                                    if (folder.id !== 0) { // Don't duplicate root
                                      availableFolders.push({
                                        id: folder.id,
                                        name: folder.text || folder.name || `Folder ${folder.id}`,
                                        path: folder.path || folder.text || folder.name
                                      });
                                    }
                                  });
                                }
                                
                                // If no workspace folders, check if there are any visible folders in the UI
                                if (typeof folders !== 'undefined' && Array.isArray(folders)) {
                                  folders.forEach(folder => {
                                    if (folder.id !== 0 && !availableFolders.find(f => f.id === folder.id)) {
                                      availableFolders.push({
                                        id: folder.id,
                                        name: folder.text || folder.name || `Folder ${folder.id}`,
                                        path: folder.path || folder.text || folder.name
                                      });
                                    }
                                  });
                                }
                              } catch (error) {
                                console.log('Could not load folder structure:', error);
                              }

                              return availableFolders;
                            })()}
                          onFileChange={(updatedContent) => {
                            if (selectedResource) {
                              const updatedFile = { ...selectedResource, notes: updatedContent };
                              setResources(prev => prev.map(r => r.id === selectedResource.id ? updatedFile : r));
                            }
                          }}
                            onCreateNewFile={(fileData) => {
                              // Create a new file resource
                              const newFile = {
                                id: Date.now() + Math.random(), // Simple ID generation
                                title: fileData.fileName,
                                notes: fileData.initialContent,
                                platform: 'Local',
                                folder: fileData.folder, // Use the selected folder ID
                                folderName: fileData.folderName, // Keep folder name for reference
                                createdAt: new Date().toISOString(),
                                type: 'file'
                              };

                              // Add to resources state (this will trigger localStorage save)
                              setResources(prev => [...prev, newFile]);

                              // If requested, open the new file in the IDE
                              if (fileData.openInIDE) {
                                setSelectedResource(newFile);
                              }
                            }}
                          />
                        ) : (
                        <WebIDE 
                          selectedFile={selectedResource}
                          onFileChange={(updatedContent) => {
                            if (selectedResource) {
                              const updatedFile = { ...selectedResource, notes: updatedContent };
                              setResources(prev => prev.map(r => r.id === selectedResource.id ? updatedFile : r));
                            }
                          }}
                        />
                        )}
                      </Card>
                    </Box>
                  )}


                  {activeDevelopmentTab === 'resources' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Resource Management</Typography>
                      <Card sx={{ bgcolor: '#fafafa', p: 2, mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                          <TextField label="Title" size="small" sx={{ width: 150 }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                          <TextField label="URL" size="small" sx={{ width: 200 }} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                          <TextField label="Tags" size="small" sx={{ width: 120 }} placeholder="comma-separated" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                          <TextField label="Platform" size="small" sx={{ width: 100 }} value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} />
                          <TextField label="Notes" size="small" sx={{ width: 150 }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                          <Select size="small" value={form.folder} onChange={e => setForm({ ...form, folder: Number(e.target.value) })} sx={{ minWidth: 120 }}>
                            {folderOptionsFlat(folders, ROOT_ID, 0).map(opt => (
                              <MenuItem key={opt.key} value={opt.props.value}>{opt.props.children}</MenuItem>
                            ))}
                          </Select>
                          <Button variant="contained" color="primary" onClick={addOrUpdate} startIcon={editing ? <EditIcon /> : <AddIcon />}>
                            {editing ? "Update" : "Add"} Resource
                          </Button>
                          {editing && (
                            <Button 
                              variant="outlined" 
                              sx={{ 
                                color: 'secondary.main',
                                borderColor: 'secondary.main',
                                '&:hover': {
                                  borderColor: 'secondary.dark',
                                  backgroundColor: 'secondary.light',
                                  color: 'secondary.contrastText',
                                }
                              }}
                              onClick={() => { setForm({ ...blankForm, folder: activeFolder }); setEditing(null); }}
                            >
                              Cancel
                            </Button>
                          )}
                        </Stack>
                      </Card>
                      
                      <Grid container spacing={2}>
                        {folderResources.map(ref => (
                          <Grid item xs={12} md={6} lg={4} key={ref.id}>
                            <Card sx={{ p: 2, height: '100%' }}>
                              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                <InsertDriveFileIcon color="warning" />
                                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{ref.title || 'Untitled'}</Typography>
                                <IconButton size="small" onClick={() => editResource(ref)}><EditIcon /></IconButton>
                                <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => removeResource(ref.id)}><DeleteIcon /></IconButton>
                              </Stack>
                              <Typography variant="body2" color="primary.main" mb={1}>
                                {ref.url ? (
                                  <a href={ref.url.match(/^https?:\/\//) ? ref.url : `https://${ref.url}`} target="_blank" rel="noopener noreferrer">
                                    {ref.url}
                                  </a>
                                ) : (
                                  <span>No URL available</span>
                                )}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                Platform: {ref.platform || 'Not specified'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                Tags: {Array.isArray(ref.tags) ? ref.tags.join(", ") : (ref.tags || 'No tags')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {ref.notes || 'No notes'}
                              </Typography>
                              
                              {isGoogleDocResource(ref) && (
                                <Box sx={{ mt: 2, p: 1, bgcolor: '#f7fafd', borderRadius: 1 }}>
                                  <Typography variant="caption" fontWeight={600} color="primary">
                                    Google Doc Available
                                  </Typography>
                                </Box>
                              )}
                              
                              <EnhancedAudioRecorder 
                                resourceId={ref.id} 
                                currentUser={user} 
                                workspaceId={selectedWksp.id}
                              />
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'search' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Search Resources</Typography>
                      {/* Search Scope Selector */}
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Typography variant="body2">Scope:</Typography>
                        <Button
                          variant={searchTabScope === 'everywhere' ? 'contained' : 'outlined'}
                          onClick={() => setSearchTabScope('everywhere')}
                          size="small"
                        >
                          All Resources
                        </Button>
                        <Button
                          variant={searchTabScope === 'folder' ? 'contained' : 'outlined'}
                          onClick={() => setSearchTabScope('folder')}
                          size="small"
                        >
                          This Folder & Subfolders
                        </Button>
                      </Stack>
                      {/* Search Input */}
                      <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                          <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Search All Resources
                        </Typography>
                        <TextField
                          fullWidth
                          size="large"
                          placeholder="Search by title, platform, tags, or notes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            endAdornment: searchQuery && (
                              <IconButton onClick={() => setSearchQuery('')} size="small">
                                <CloseIcon />
                              </IconButton>
                            )
                          }}
                          sx={{ mb: 3 }}
                        />
                        {/* Search Results */}
                        {searchQuery && (
                          <Box>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                              Search Results ({searchResults.length})
                            </Typography>
                            {searchResults.length > 0 ? (
                              <Grid container spacing={2}>
                                {searchResults.map(result => (
                                  <Grid item xs={12} md={6} lg={4} key={result.id}>
                                    <Card sx={{ p: 2, height: '100%', cursor: 'pointer' }} onClick={() => onSearchResultClick(result)}>
                                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                        {isGoogleDocResource(result) ? (
                                          <GoogleIcon color="primary" />
                                        ) : isGitHubResource(result) ? (
                                          <GitHubIcon sx={{ color: 'secondary.main' }} />
                                        ) : (
                                          <InsertDriveFileIcon color="warning" />
                                        )}
                                        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{result.title || 'Untitled'}</Typography>
                                      </Stack>
                                      <Typography variant="body2" color="primary.main" mb={1}>
                                        {result.url ? (
                                          result.url.match(/^https?:\/\//)
                                            ? <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>
                                            : <span>{result.url}</span>
                                        ) : (
                                          <span>No URL available</span>
                                        )}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" mb={1}>
                                        Platform: {result.platform || 'Not specified'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" mb={1}>
                                        Tags: {Array.isArray(result.tags) ? result.tags.join(", ") : (result.tags || 'No tags')}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {result.notes || 'No notes'}
                                      </Typography>
                                      {isGoogleDocResource(result) && (
                                        <Box sx={{ mt: 2, p: 1, bgcolor: '#f7fafd', borderRadius: 1 }}>
                                          <Typography variant="caption" fontWeight={600} color="primary">
                                            Google Doc Available
                                          </Typography>
                                        </Box>
                                      )}
                                      {isGitHubResource(result) && (
                                        <Box sx={{ mt: 2, p: 1, bgcolor: '#f6f8fa', borderRadius: 1 }}>
                                          <Typography variant="caption" fontWeight={600} sx={{ color: 'secondary.main' }}>
                                            GitHub File Available
                                          </Typography>
                                        </Box>
                                      )}
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Typography color="text.secondary">No results found.</Typography>
                            )}
                          </Box>
                        )}
                      </Card>
                    </Box>
                  )}

                  {activeDevelopmentTab === 'import' && (
                    <Box>
                      <Typography variant="h5" fontWeight={700} mb={3}>Import Tools</Typography>
                      <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Import GitHub Repository</Typography>
                        <ImportGithubIntoApp 
                          addFoldersAndResources={addFoldersAndResources} 
                          folderOptions={folderOptionsFlat(folders, ROOT_ID, 0)}
                          workspaceId={selectedWksp?.id}
                        />
                      </Card>
                      
                      <Card sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Google Meet & Calendar</Typography>
                        <GoogleMeetAndCalendar />
                      </Card>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DndProvider>
      )}
      {mainTab === 1 && <MarketplacePanel currentUser={user} />}

      {/* Editor Rendering */}
      {currentEditor === 'flowchart' && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white'
        }}>
          <FlowchartEditor
            flowchartData={editorData}
            onSave={(data) => {
              console.log('Flowchart saved:', data);
              setCurrentEditor(null);
              setEditorData(null);
            }}
            onExit={() => {
              setCurrentEditor(null);
              setEditorData(null);
            }}
          />
        </Box>
      )}

      {currentEditor === 'slides' && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white'
        }}>
          <GoogleSlidesEditor
            presentationUrl=""
            googleToken={googleToken}
            onExit={() => {
              setCurrentEditor(null);
              setEditorData(null);
            }}
          />
        </Box>
      )}

      {currentEditor === 'canva' && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'white'
        }}>
          <CanvaEditor
            designData={editorData}
            onSave={(data) => {
              console.log('Design saved:', data);
              setCurrentEditor(null);
              setEditorData(null);
            }}
            onExit={() => {
              setCurrentEditor(null);
              setEditorData(null);
            }}
          />
        </Box>
      )}


      {/* Enhanced AI Assistant */}
      {showEnhancedAI && (
        <EnhancedAIAssistant
          onClose={() => setShowEnhancedAI(false)}
          workspaceId={selectedWksp?.id}
          folders={folders}
          resources={resources}
          addFoldersAndResources={addFoldersAndResources}
          addChildFolder={addChildFolder}
          renameFolder={renameFolder}
          deleteFolder={deleteFolder}
          removeResource={removeResource}
          editResource={editResource}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          setResources={setResources}
        />
      )}

      {/* Storage Test Dialog */}
      {showStorageTest && (
        <Dialog 
          open={showStorageTest} 
          onClose={() => setShowStorageTest(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              height: '80vh',
              maxHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon color="success" />
            <Typography variant="h6">Storage Integration Test</Typography>
          </Box>
            <IconButton onClick={() => setShowStorageTest(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, height: '100%', overflow: 'auto' }}>
            <StorageTest />
          </DialogContent>
        </Dialog>
      )}

      {/* Legacy Sidebar Application Interface */}
      {sidebarApp && (
        <SidebarAppInterface
          appType={sidebarApp}
          onClose={() => setSidebarApp(null)}
          googleToken={googleToken}
        />
      )}

      {/* Global AI Assistant Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setShowGlobalAIChat(!showGlobalAIChat)}
      >
        <ChatIcon />
      </Fab>

      {/* Global AI Chat Drawer */}
      <Drawer
        anchor="right"
        open={showGlobalAIChat}
        onClose={() => setShowGlobalAIChat(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            height: '100%'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon color="primary" />
              Global AI Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              I can help you across all tabs and apply changes where needed
            </Typography>
            <Chip
              label={`Current tab: ${activeDevelopmentTab}`}
              size="small"
              color="secondary"
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Chat Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0, // Allow shrinking
              maxHeight: 'calc(100vh - 280px)' // Reserve space for header, actions, and input
            }}
          >
            {globalChatMessages.map(renderGlobalChatMessage)}
            
            {isGlobalChatLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size={20} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Compact Actions - Fixed Layout */}
          <Box sx={{ 
            borderTop: 1, 
            borderColor: 'divider',
            flexShrink: 0,
            maxHeight: '90px',
            overflow: 'hidden'
          }}>
            {/* Quick Actions Row */}
            <Box sx={{ 
              px: 1.5, 
              py: 0.5, 
              bgcolor: 'grey.50',
              display: 'flex', 
              gap: 0.25, 
              overflowX: 'auto',
              alignItems: 'center',
              minHeight: '32px',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }}>
              <Typography variant="caption" sx={{ 
                mr: 0.5, 
                fontWeight: 600, 
                color: 'text.secondary', 
                minWidth: '30px',
                fontSize: '0.65rem',
                flexShrink: 0
              }}>
                Quick:
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={<CreateIcon sx={{ fontSize: '14px' }} />}
                onClick={() => setShowGlobalFileCreator(true)}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                File
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<BuildIcon sx={{ fontSize: '14px' }} />}
                onClick={() => setShowGlobalProjectGenerator(true)}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                Project
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<EditIcon sx={{ fontSize: '14px' }} />}
                onClick={() => {
                  setGlobalChatInput("Help me edit a file in my workspace");
                  setTimeout(() => handleGlobalChatSend(), 100);
                }}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                Edit
              </Button>
              {googleToken && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<NoteAddIcon sx={{ fontSize: '14px' }} />}
                  onClick={() => setShowGoogleDocDialog(true)}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 0.5, 
                    fontSize: '0.65rem', 
                    textTransform: 'none',
                    flexShrink: 0,
                    height: '28px'
                  }}
                >
                  Doc
                </Button>
              )}
              {googleDocUrl && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<ArticleIcon sx={{ fontSize: '14px' }} />}
                  onClick={() => {
                    setGlobalChatInput("Analyze the current Google Doc");
                    setTimeout(() => handleGlobalChatSend(), 100);
                  }}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 0.5, 
                    fontSize: '0.65rem', 
                    textTransform: 'none',
                    flexShrink: 0,
                    height: '28px'
                  }}
                >
                  Analyze
                </Button>
              )}
              {globalGithubUser ? (
                <Chip
                  label={`@${globalGithubUser.login.substring(0, 8)}`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ 
                    height: '22px', 
                    fontSize: '0.6rem',
                    flexShrink: 0,
                    '& .MuiChip-label': { px: 0.5 }
                  }}
                />
              ) : (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<GitHubIcon sx={{ fontSize: '14px' }} />}
                  onClick={globalHandleGitHubLogin}
                  disabled={globalIsGithubLoading}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 0.5, 
                    fontSize: '0.65rem', 
                    textTransform: 'none',
                    flexShrink: 0,
                    height: '28px'
                  }}
                >
                  GitHub
                </Button>
              )}
            </Box>

            {/* Code Actions Row */}
            <Box sx={{ 
              px: 1.5, 
              py: 0.5, 
              bgcolor: 'blue.50',
              display: 'flex', 
              gap: 0.25, 
              overflowX: 'auto',
              alignItems: 'center',
              minHeight: '32px',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }}>
              <Typography variant="caption" sx={{ 
                mr: 0.5, 
                fontWeight: 600, 
                color: 'text.secondary', 
                minWidth: '30px',
                fontSize: '0.65rem',
                flexShrink: 0
              }}>
                Code:
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={<AutoFixHighIcon sx={{ fontSize: '14px' }} />}
                onClick={() => {
                  setGlobalChatInput("Explain this code");
                  setTimeout(() => handleGlobalChatSend(), 100);
                }}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  color: 'primary.main', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                Explain
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<BugReportIcon sx={{ fontSize: '14px' }} />}
                onClick={() => {
                  setGlobalChatInput("Fix any bugs in this code");
                  setTimeout(() => handleGlobalChatSend(), 100);
                }}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  color: 'error.main', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                Fix
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<OptimizeIcon sx={{ fontSize: '14px' }} />}
                onClick={() => {
                  setGlobalChatInput("Optimize this code for better performance");
                  setTimeout(() => handleGlobalChatSend(), 100);
                }}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  color: 'warning.main', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                Optimize
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<RefactorIcon sx={{ fontSize: '14px' }} />}
                onClick={() => {
                  setGlobalChatInput("Refactor this code to improve structure");
                  setTimeout(() => handleGlobalChatSend(), 100);
                }}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  color: 'success.main', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                Refactor
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<PlayArrowIcon sx={{ fontSize: '14px' }} />}
                onClick={() => {
                  setGlobalChatInput("Run this code");
                  setTimeout(() => handleGlobalChatSend(), 100);
                }}
                sx={{ 
                  minWidth: 'auto', 
                  px: 0.5, 
                  fontSize: '0.65rem', 
                  color: 'info.main', 
                  textTransform: 'none',
                  flexShrink: 0,
                  height: '28px'
                }}
              >
                Run
              </Button>
            </Box>
          </Box>

          {/* Chat Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={globalChatInput}
                onChange={(e) => setGlobalChatInput(e.target.value)}
                placeholder="Ask me to analyze code, fix bugs, optimize performance, create files, create Google Docs, run code, or help with anything..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGlobalChatSend();
                  }
                }}
                disabled={isGlobalChatLoading}
              />
              <IconButton
                onClick={handleGlobalChatSend}
                disabled={!globalChatInput.trim() || isGlobalChatLoading}
                color="primary"
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Global AI File Creator Dialog */}
      <Dialog open={showGlobalFileCreator} onClose={() => setShowGlobalFileCreator(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="File Name"
              value={globalFileCreatorData.fileName}
              onChange={(e) => setGlobalFileCreatorData(prev => ({ ...prev, fileName: e.target.value }))}
              placeholder="e.g., App.js, index.html, styles.css"
            />
            <TextField
              select
              label="File Type"
              value={globalFileCreatorData.fileType}
              onChange={(e) => setGlobalFileCreatorData(prev => ({ ...prev, fileType: e.target.value }))}
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
              value={globalFileCreatorData.content}
              onChange={(e) => setGlobalFileCreatorData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Leave empty for AI-generated content..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGlobalFileCreator(false)}>Cancel</Button>
          <Button onClick={globalCreateFile} variant="contained" startIcon={<CreateIcon />}>
            Create File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global AI Project Generator Dialog */}
      <Dialog open={showGlobalProjectGenerator} onClose={() => setShowGlobalProjectGenerator(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Project Structure</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Project Name"
              value={globalProjectData.projectName}
              onChange={(e) => setGlobalProjectData(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="e.g., my-react-app, todo-api, portfolio-site"
            />
            <TextField
              select
              label="Project Type"
              value={globalProjectData.projectType}
              onChange={(e) => setGlobalProjectData(prev => ({ ...prev, projectType: e.target.value }))}
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
              value={globalProjectData.description}
              onChange={(e) => setGlobalProjectData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGlobalProjectGenerator(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              const projectIntent = {
                type: 'create_multiple_files',
                content: `Create a ${globalProjectData.projectType} project called "${globalProjectData.projectName}". ${globalProjectData.description}`
              };
              globalHandleMultipleFileCreation(projectIntent);
              setShowGlobalProjectGenerator(false);
            }}
            variant="contained" 
            startIcon={<BuildIcon />}
            disabled={isGlobalChatLoading}
          >
            {isGlobalChatLoading ? 'Generating...' : 'Generate Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global AI GitHub Repository Creation Dialog */}
      <Dialog open={showGlobalGithubDialog} onClose={() => setShowGlobalGithubDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📤 Push to GitHub Repository
          {globalGithubUser && (
            <Typography variant="body2" color="textSecondary">
              Logged in as @{globalGithubUser.login}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Repository Name"
              value={globalGithubRepoName}
              onChange={(e) => setGlobalGithubRepoName(e.target.value)}
              placeholder="my-awesome-project"
              fullWidth
            />
            <TextField
              label="Description (optional)"
              value={globalGithubRepoDescription}
              onChange={(e) => setGlobalGithubRepoDescription(e.target.value)}
              placeholder="Generated by AI Assistant"
              multiline
              rows={2}
              fullWidth
            />
            <FormControl>
              <FormLabel component="legend">Repository Visibility</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={globalIsPrivateRepo}
                  onChange={(e) => setGlobalIsPrivateRepo(e.target.checked)}
                />
                <Typography variant="body2">Make repository private</Typography>
              </Box>
            </FormControl>
            <Typography variant="body2" color="textSecondary">
              This will create a new repository and push {globalLastCreatedFiles.length} files to it.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGlobalGithubDialog(false)}>Cancel</Button>
          <Button
            onClick={globalCreateGitHubRepository}
            variant="contained"
            disabled={globalIsGithubLoading || !globalGithubRepoName.trim()}
            startIcon={globalIsGithubLoading ? <CircularProgress size={16} /> : <GitHubIcon />}
          >
            {globalIsGithubLoading ? 'Creating...' : 'Create & Push'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Google Doc Creation Dialog */}
      <Dialog
        open={showGoogleDocDialog}
        onClose={() => {
          setShowGoogleDocDialog(false);
          setNewGoogleDocTitle('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="primary" />
          Create New Google Doc
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new Google Doc in your Google Drive and open it in the editor.
          </Typography>
          
          <TextField
            fullWidth
            label="Document Title"
            value={newGoogleDocTitle}
            onChange={(e) => setNewGoogleDocTitle(e.target.value)}
            placeholder="Enter document title..."
            sx={{ mb: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newGoogleDocTitle.trim()) {
                createNewGoogleDoc(newGoogleDocTitle.trim());
              }
            }}
          />
          
          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.dark">
              💡 <strong>Tip:</strong> If you leave the title blank, I'll create a document with today's date. The document will be created in your Google Drive and automatically opened in the editor.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowGoogleDocDialog(false);
              setNewGoogleDocTitle('');
            }}
            disabled={isCreatingGoogleDoc}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => createNewGoogleDoc(newGoogleDocTitle.trim())}
            variant="contained"
            disabled={isCreatingGoogleDoc}
            startIcon={isCreatingGoogleDoc ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />}
            sx={{ 
              background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3367d6 30%, #2e7d32 90%)'
              }
            }}
          >
            {isCreatingGoogleDoc ? 'Creating...' : 'Create Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global AI Snackbar for notifications */}
      <Snackbar
        open={globalSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setGlobalSnackbar({ ...globalSnackbar, open: false })}
      >
        <Alert severity={globalSnackbar.severity} onClose={() => setGlobalSnackbar({ ...globalSnackbar, open: false })}>
          {globalSnackbar.message}
        </Alert>
      </Snackbar>

      {/* Google Sheet Creation Dialog */}
      <Dialog open={showGoogleSheetDialog} onClose={() => { if (!isCreatingGoogleSheet) { setShowGoogleSheetDialog(false); setNewGoogleSheetTitle(''); } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="primary" />
          Create New Google Sheet
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Sheet Title" value={newGoogleSheetTitle} onChange={(e) => setNewGoogleSheetTitle(e.target.value)} placeholder="Enter sheet title..." sx={{ mb: 2 }} onKeyPress={(e) => { if (e.key === 'Enter' && newGoogleSheetTitle.trim()) { createNewGoogleSheet(newGoogleSheetTitle.trim()); } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowGoogleSheetDialog(false); setNewGoogleSheetTitle(''); }} disabled={isCreatingGoogleSheet}>Cancel</Button>
          <Button onClick={() => createNewGoogleSheet(newGoogleSheetTitle.trim())} variant="contained" disabled={isCreatingGoogleSheet} startIcon={isCreatingGoogleSheet ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />} sx={{ background: 'linear-gradient(45deg, #34a853 30%, #4285f4 90%)', '&:hover': { background: 'linear-gradient(45deg, #2e7d32 30%, #3367d6 90%)' } }}>{isCreatingGoogleSheet ? 'Creating...' : 'Create Sheet'}</Button>
        </DialogActions>
      </Dialog>

      {/* Google Slides Creation Dialog */}
      <Dialog open={showGoogleSlidesDialog} onClose={() => { if (!isCreatingGoogleSlides) { setShowGoogleSlidesDialog(false); setNewGoogleSlidesTitle(''); } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="primary" />
          Create New Google Slides
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Slides Title" value={newGoogleSlidesTitle} onChange={(e) => setNewGoogleSlidesTitle(e.target.value)} placeholder="Enter slides title..." sx={{ mb: 2 }} onKeyPress={(e) => { if (e.key === 'Enter' && newGoogleSlidesTitle.trim()) { createNewGoogleSlides(newGoogleSlidesTitle.trim()); } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowGoogleSlidesDialog(false); setNewGoogleSlidesTitle(''); }} disabled={isCreatingGoogleSlides}>Cancel</Button>
          <Button onClick={() => createNewGoogleSlides(newGoogleSlidesTitle.trim())} variant="contained" disabled={isCreatingGoogleSlides} startIcon={isCreatingGoogleSlides ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />} sx={{ background: 'linear-gradient(45deg, #FBBC05 30%, #4285f4 90%)', '&:hover': { background: 'linear-gradient(45deg, #F29900 30%, #3367d6 90%)' } }}>{isCreatingGoogleSlides ? 'Creating...' : 'Create Slides'}</Button>
        </DialogActions>
      </Dialog>

      {/* Google Site Creation Dialog */}
      <Dialog open={showGoogleSiteDialog} onClose={() => { if (!isCreatingGoogleSite) { setShowGoogleSiteDialog(false); setNewGoogleSiteTitle(''); } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="primary" />
          Create New Google Site
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Site Title" value={newGoogleSiteTitle} onChange={(e) => setNewGoogleSiteTitle(e.target.value)} placeholder="Enter site title..." sx={{ mb: 2 }} onKeyPress={(e) => { if (e.key === 'Enter' && newGoogleSiteTitle.trim()) { createNewGoogleSite(newGoogleSiteTitle.trim()); } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowGoogleSiteDialog(false); setNewGoogleSiteTitle(''); }} disabled={isCreatingGoogleSite}>Cancel</Button>
          <Button onClick={() => createNewGoogleSite(newGoogleSiteTitle.trim())} variant="contained" disabled={isCreatingGoogleSite} startIcon={isCreatingGoogleSite ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />} sx={{ background: 'linear-gradient(45deg, #34a853 30%, #4285f4 90%)', '&:hover': { background: 'linear-gradient(45deg, #2e7d32 30%, #3367d6 90%)' } }}>{isCreatingGoogleSite ? 'Creating...' : 'Open Sites'}</Button>
        </DialogActions>
      </Dialog>

      {/* Looker Studio Creation Dialog */}
      <Dialog open={showLookerReportDialog} onClose={() => { if (!isCreatingLookerReport) { setShowLookerReportDialog(false); setNewLookerReportTitle(''); } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="primary" />
          Create New Looker Studio Report
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Report Title" value={newLookerReportTitle} onChange={(e) => setNewLookerReportTitle(e.target.value)} placeholder="Enter report title..." sx={{ mb: 2 }} onKeyPress={(e) => { if (e.key === 'Enter' && newLookerReportTitle.trim()) { createNewLookerReport(newLookerReportTitle.trim()); } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowLookerReportDialog(false); setNewLookerReportTitle(''); }} disabled={isCreatingLookerReport}>Cancel</Button>
          <Button onClick={() => createNewLookerReport(newLookerReportTitle.trim())} variant="contained" disabled={isCreatingLookerReport} startIcon={isCreatingLookerReport ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />} sx={{ background: 'linear-gradient(45deg, #34a853 30%, #4285f4 90%)', '&:hover': { background: 'linear-gradient(45deg, #2e7d32 30%, #3367d6 90%)' } }}>{isCreatingLookerReport ? 'Creating...' : 'Open Looker Studio'}</Button>
        </DialogActions>
      </Dialog>

      {/* Google Drawing Creation Dialog */}
      <Dialog open={showGoogleDrawingDialog} onClose={() => { if (!isCreatingGoogleDrawing) { setShowGoogleDrawingDialog(false); setNewGoogleDrawingTitle(''); } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="primary" />
          Create New Google Drawing
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Drawing Title" value={newGoogleDrawingTitle} onChange={(e) => setNewGoogleDrawingTitle(e.target.value)} placeholder="Enter drawing title..." sx={{ mb: 2 }} onKeyPress={(e) => { if (e.key === 'Enter' && newGoogleDrawingTitle.trim()) { createNewGoogleDrawing(newGoogleDrawingTitle.trim()); } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowGoogleDrawingDialog(false); setNewGoogleDrawingTitle(''); }} disabled={isCreatingGoogleDrawing}>Cancel</Button>
          <Button onClick={() => createNewGoogleDrawing(newGoogleDrawingTitle.trim())} variant="contained" disabled={isCreatingGoogleDrawing} startIcon={isCreatingGoogleDrawing ? <CircularProgress size={16} color="inherit" /> : <NoteAddIcon />} sx={{ background: 'linear-gradient(45deg, #34a853 30%, #4285f4 90%)', '&:hover': { background: 'linear-gradient(45deg, #2e7d32 30%, #3367d6 90%)' } }}>{isCreatingGoogleDrawing ? 'Creating...' : 'Create Drawing'}</Button>
        </DialogActions>
      </Dialog>

      {/* Google Docs Action Alert */}
      <Snackbar
        open={showDocActionAlert}
        autoHideDuration={3000}
        onClose={() => setShowDocActionAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={docActionMessage.includes('successfully') ? 'success' : 'error'}
          onClose={() => setShowDocActionAlert(false)}
        >
          {docActionMessage}
        </Alert>
      </Snackbar>
      </>
    </ThemeProvider>
  );
}
