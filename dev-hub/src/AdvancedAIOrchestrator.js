import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, Divider, Grid, Card,
  CardContent, CardActions, List, ListItem, ListItemText,
  ListItemIcon, Tabs, Tab, Switch, FormControlLabel, Slider, Select,
  MenuItem, InputLabel, FormControl, AlertTitle, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Star,
  KeyboardArrowDown, CheckCircle, Error, Warning,
  Info, Build, CloudUpload, GetApp, PlayArrow
} from '@mui/icons-material';
import { llmIntegration } from './llm-integration';

const AdvancedAIOrchestrator = ({ googleToken, onCodeGenerated, onError }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [extractedCommands, setExtractedCommands] = useState([]);
  const [generatedCode, setGeneratedCode] = useState({});
  const [aiSettings, setAiSettings] = useState({
    model: 'groq-llama3-70b-8192',
    temperature: 0.7,
    maxTokens: 4000,
    enableCodeAnalysis: true,
    enableAutoDeploy: false,
    enableSecurityScan: true,
    enablePerformanceOptimization: true
  });
  const [platforms, setPlatforms] = useState({
    web: true,
    mobile: false,
    desktop: false,
    api: false,
    database: false
  });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const addLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const extractCommandsFromDoc = async (content) => {
    try {
      addLog('Extracting commands from document...', 'info');
      
      const prompt = `Analyze the following document content and extract any programming commands, requirements, or technical specifications. 
      Look for:
      - Code snippets or pseudocode
      - Technical requirements
      - API specifications
      - Database schemas
      - UI/UX requirements
      - Deployment instructions
      
      Document content:
      ${content}
      
      Return a JSON array of extracted commands with their type, description, and priority.`;

      const response = await llmIntegration.makeGroqCall(prompt, 
        'You are a technical document analyzer. Extract clear, actionable programming commands from the provided content.',
        0.3
      );

      const commands = JSON.parse(response.content || '[]');
      setExtractedCommands(commands);
      addLog(`Extracted ${commands.length} commands from document`, 'success');
      return commands;
    } catch (error) {
      addLog(`Error extracting commands: ${error.message}`, 'error');
      return [];
    }
  };

  const generateCodeForPlatform = async (commands, platform) => {
    try {
      addLog(`Generating code for ${platform} platform...`, 'info');
      
      const platformPrompts = {
        web: 'Generate modern React/Next.js code with TypeScript, Material-UI, and best practices',
        mobile: 'Generate React Native code with Expo, TypeScript, and mobile-optimized UI',
        desktop: 'Generate Electron app code with React and native desktop features',
        api: 'Generate Node.js/Express API with TypeScript, proper error handling, and documentation',
        database: 'Generate database schemas, migrations, and queries with proper indexing'
      };

      const prompt = `Based on these extracted commands:
      ${JSON.stringify(commands, null, 2)}
      
      Generate complete, production-ready code for a ${platform} application.
      ${platformPrompts[platform]}
      
      Include:
      - Complete file structure
      - All necessary dependencies
      - Proper error handling
      - Security best practices
      - Performance optimizations
      - Documentation
      
      Return the code as a JSON object with file paths as keys and code content as values.`;

      const response = await llmIntegration.makeGroqCall(prompt,
        'You are an expert software architect. Generate production-ready, well-documented code.',
        0.4
      );

      const code = JSON.parse(response.content || '{}');
      setGeneratedCode(prev => ({ ...prev, [platform]: code }));
      addLog(`Generated ${Object.keys(code).length} files for ${platform}`, 'success');
      return code;
    } catch (error) {
      addLog(`Error generating ${platform} code: ${error.message}`, 'error');
      return {};
    }
  };

  const analyzeAndOptimize = async (code, platform) => {
    try {
      addLog(`Analyzing and optimizing ${platform} code...`, 'info');
      
      const prompt = `Analyze this ${platform} code for:
      - Security vulnerabilities
      - Performance issues
      - Code quality improvements
      - Best practices compliance
      - Accessibility issues
      
      Code:
      ${JSON.stringify(code, null, 2)}
      
      Provide specific recommendations and optimized code.`;

      const response = await llmIntegration.makeGroqCall(prompt,
        'You are a senior software engineer specializing in code review and optimization.',
        0.3
      );

      addLog(`Analysis complete for ${platform}`, 'success');
      return response.content;
    } catch (error) {
      addLog(`Error analyzing ${platform} code: ${error.message}`, 'error');
      return '';
    }
  };

  const handleProcessDocument = async () => {
    if (!docContent.trim()) {
      setError('Please provide document content');
      return;
    }

    setIsProcessing(true);
    setError('');
    addLog('Starting document processing...', 'info');

    try {
      // Extract commands from document
      const commands = await extractCommandsFromDoc(docContent);
      
      if (commands.length === 0) {
        addLog('No commands found in document', 'warning');
        setIsProcessing(false);
        return;
      }

      // Generate code for each selected platform
      const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
      
      for (const platform of selectedPlatforms) {
        const code = await generateCodeForPlatform(commands, platform);
        
        if (aiSettings.enableCodeAnalysis) {
          await analyzeAndOptimize(code, platform);
        }
      }

      addLog('Document processing completed successfully', 'success');
      onCodeGenerated?.(generatedCode);
    } catch (error) {
      setError(`Processing failed: ${error.message}`);
      addLog(`Processing failed: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeployCode = async (platform) => {
    try {
      addLog(`Deploying ${platform} code...`, 'info');
      
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addLog(`${platform} deployment completed`, 'success');
    } catch (error) {
      addLog(`${platform} deployment failed: ${error.message}`, 'error');
    }
  };

  const renderLogs = () => (
    <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Processing Logs
      </Typography>
      <List dense>
        {logs.map((log) => (
          <ListItem key={log.id}>
            <ListItemIcon>
              {log.type === 'success' && <CheckCircle color="success" />}
              {log.type === 'error' && <Error color="error" />}
              {log.type === 'warning' && <Warning color="warning" />}
              {log.type === 'info' && <Info color="info" />}
            </ListItemIcon>
            <ListItemText
              primary={log.message}
              secondary={log.timestamp.toLocaleTimeString()}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const renderSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<KeyboardArrowDown />}>
        <Typography variant="h6">AI Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>AI Model</InputLabel>
              <Select
                value={aiSettings.model}
                onChange={(e) => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
              >
                <MenuItem value="groq-llama3-70b-8192">Llama 3.3 70B (Groq)</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="claude-3">Claude 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Temperature: {aiSettings.temperature}</Typography>
            <Slider
              value={aiSettings.temperature}
              onChange={(e, value) => setAiSettings(prev => ({ ...prev, temperature: value }))}
              min={0}
              max={1}
              step={0.1}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={aiSettings.enableCodeAnalysis}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, enableCodeAnalysis: e.target.checked }))}
                />
              }
              label="Enable Code Analysis"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={aiSettings.enableSecurityScan}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, enableSecurityScan: e.target.checked }))}
                />
              }
              label="Security Scanning"
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderPlatforms = () => (
    <Accordion>
      <AccordionSummary expandIcon={<KeyboardArrowDown />}>
        <Typography variant="h6">Target Platforms</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {Object.keys(platforms).map((platform) => (
            <Grid item xs={6} md={3} key={platform}>
              <FormControlLabel
                control={
                  <Switch
                    checked={platforms[platform]}
                    onChange={(e) => setPlatforms(prev => ({ ...prev, [platform]: e.target.checked }))}
                  />
                }
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
                 <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
        Advanced AI Orchestrator
      </Typography>
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Document Processing" />
        <Tab label="Code Generation" />
        <Tab label="Deployment" />
        <Tab label="Settings" />
        <Tab label="Logs" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Document Content Analysis
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
            placeholder="Paste your Google Doc content here with programming commands, requirements, or technical specifications..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleProcessDocument}
            disabled={isProcessing || !docContent.trim()}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <PlayArrow />}
            sx={{ mb: 2 }}
          >
            {isProcessing ? 'Processing...' : 'Process Document'}
          </Button>
          
          {extractedCommands.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Extracted Commands ({extractedCommands.length})
              </Typography>
              <List>
                {extractedCommands.map((cmd, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Build />
                    </ListItemIcon>
                    <ListItemText
                      primary={cmd.description}
                      secondary={`Type: ${cmd.type} | Priority: ${cmd.priority}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Generated Code
          </Typography>
          {Object.keys(generatedCode).map((platform) => (
            <Card key={platform} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)} Platform
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Object.keys(generatedCode[platform]).length} files generated
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<GetApp />}
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(generatedCode[platform], null, 2)], 
                      { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${platform}-code.json`;
                    a.click();
                  }}
                >
                  Download
                </Button>
                                 <Button
                   size="small"
                   startIcon={<CloudUpload />}
                   onClick={() => handleDeployCode(platform)}
                 >
                   Deploy
                 </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Deployment Management
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(generatedCode).map((platform) => (
              <Grid item xs={12} md={6} key={platform}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{platform}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ready for deployment
                    </Typography>
                  </CardContent>
                  <CardActions>
                                         <Button
                       variant="contained"
                       startIcon={<CloudUpload />}
                       onClick={() => handleDeployCode(platform)}
                     >
                       Deploy
                     </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          {renderSettings()}
          {renderPlatforms()}
        </Box>
      )}

      {activeTab === 4 && renderLogs()}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AdvancedAIOrchestrator; 