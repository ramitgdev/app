import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Button, Box, Stack, Chip, List, ListItem,
  ListItemText, ListItemIcon, Accordion, AccordionSummary, AccordionDetails,
  LinearProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BugReportIcon from '@mui/icons-material/BugReport';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Mock AI analysis - in production, this would call OpenAI/Claude API
const mockAIAnalysis = {
  overall_score: 8.5,
  issues: [
    {
      id: 1,
      type: 'security',
      severity: 'high',
      title: 'Potential XSS vulnerability',
      description: 'User input is not properly sanitized before rendering',
      line: 42,
      file: 'UserProfile.js',
      suggestion: 'Use DOMPurify or similar library to sanitize HTML content',
      code_snippet: 'innerHTML = userInput; // Dangerous!',
      fixed_code: 'innerHTML = DOMPurify.sanitize(userInput);'
    },
    {
      id: 2,
      type: 'performance',
      severity: 'medium',
      title: 'Inefficient re-renders',
      description: 'Component re-renders unnecessarily due to object creation in render',
      line: 28,
      file: 'Dashboard.js',
      suggestion: 'Move object creation outside render or use useMemo',
      code_snippet: 'const style = { color: "red" }; // Created every render',
      fixed_code: 'const style = useMemo(() => ({ color: "red" }), []);'
    },
    {
      id: 3,
      type: 'bug',
      severity: 'low',
      title: 'Missing error handling',
      description: 'API call lacks proper error handling',
      line: 15,
      file: 'api.js',
      suggestion: 'Add try-catch block and user-friendly error messages',
      code_snippet: 'const data = await fetch(url).then(r => r.json());',
      fixed_code: 'try { const data = await fetch(url).then(r => r.json()); } catch(e) { showError(e); }'
    }
  ],
  suggestions: [
    'Consider implementing TypeScript for better type safety',
    'Add unit tests for critical business logic',
    'Implement proper logging and monitoring',
    'Consider code splitting for better performance'
  ],
  metrics: {
    complexity: 6.2,
    maintainability: 8.1,
    test_coverage: 65,
    performance_score: 7.8
  }
};

function IssueCard({ issue, onApplyFix }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <ErrorIcon />;
      case 'medium': return <WarningIcon />;
      case 'low': return <CheckCircleIcon />;
      default: return <CodeIcon />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security': return <SecurityIcon color="error" />;
      case 'performance': return <SpeedIcon color="warning" />;
      case 'bug': return <BugReportIcon color="info" />;
      default: return <CodeIcon />;
    }
  };

  return (
    <Card sx={{ mb: 2, border: `1px solid ${getSeverityColor(issue.severity) === 'error' ? '#f44336' : getSeverityColor(issue.severity) === 'warning' ? '#ff9800' : '#2196f3'}` }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
            {getTypeIcon(issue.type)}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {issue.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip 
                  label={issue.severity} 
                  color={getSeverityColor(issue.severity)} 
                  size="small"
                  icon={getSeverityIcon(issue.severity)}
                />
                <Typography variant="caption" color="text.secondary">
                  {issue.file}:{issue.line}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {issue.description}
            </Typography>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Current Code:
              </Typography>
              <Box sx={{ 
                bgcolor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1, 
                fontFamily: 'monospace',
                border: '1px solid #ddd'
              }}>
                <code>{issue.code_snippet}</code>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Suggested Fix:
              </Typography>
              <Box sx={{ 
                bgcolor: '#e8f5e8', 
                p: 2, 
                borderRadius: 1, 
                fontFamily: 'monospace',
                border: '1px solid #4caf50'
              }}>
                <code>{issue.fixed_code}</code>
              </Box>
            </Box>
            
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>AI Suggestion:</strong> {issue.suggestion}
              </Typography>
            </Alert>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoFixHighIcon />}
                onClick={() => onApplyFix(issue)}
                size="small"
              >
                Apply Fix
              </Button>
              <Button variant="outlined" size="small">
                Ignore
              </Button>
              <Button variant="outlined" size="small">
                Learn More
              </Button>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}

function MetricsCard({ metrics }) {
  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ p: 3, mb: 3, bgcolor: '#f8fafc' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        <TrendingUpIcon sx={{ mr: 1 }} />
        Code Quality Metrics
      </Typography>
      
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">Complexity Score</Typography>
            <Typography variant="body2" fontWeight={600}>{metrics.complexity}/10</Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={metrics.complexity * 10} 
            color={getScoreColor(metrics.complexity)}
          />
        </Box>
        
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">Maintainability</Typography>
            <Typography variant="body2" fontWeight={600}>{metrics.maintainability}/10</Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={metrics.maintainability * 10} 
            color={getScoreColor(metrics.maintainability)}
          />
        </Box>
        
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">Test Coverage</Typography>
            <Typography variant="body2" fontWeight={600}>{metrics.test_coverage}%</Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={metrics.test_coverage} 
            color={getScoreColor(metrics.test_coverage / 10)}
          />
        </Box>
        
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">Performance Score</Typography>
            <Typography variant="body2" fontWeight={600}>{metrics.performance_score}/10</Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={metrics.performance_score * 10} 
            color={getScoreColor(metrics.performance_score)}
          />
        </Box>
      </Stack>
    </Card>
  );
}

export default function AICodeReviewer({ workspaceId, currentUser }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reviewType, setReviewType] = useState('full');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const startAnalysis = async () => {
    setLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalysis(mockAIAnalysis);
      setLoading(false);
    }, 3000);
  };

  const handleApplyFix = (issue) => {
    // In production, this would apply the suggested fix to the actual code
    console.log('Applying fix for issue:', issue.id);
    alert(`Fix applied for: ${issue.title}\n\nThis would automatically update your code with the suggested changes.`);
  };

  const handleCustomReview = () => {
    setShowCustomDialog(true);
  };

  const submitCustomReview = async () => {
    if (!customPrompt.trim()) return;
    
    setShowCustomDialog(false);
    setLoading(true);
    
    // Simulate custom AI analysis
    setTimeout(() => {
      setAnalysis({
        ...mockAIAnalysis,
        custom_analysis: `Based on your request: "${customPrompt}", here are the findings...`
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <Card sx={{ p: 3, mt: 2, bgcolor: '#f7fafd', border: '1px solid #e3f2fd' }}>
      <Typography variant="h6" fontWeight={700} mb={2} color="primary">
        <SmartToyIcon sx={{ mr: 1 }} />
        AI Code Review Assistant
      </Typography>

      {/* Analysis Controls */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Review Type</InputLabel>
              <Select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                label="Review Type"
              >
                <MenuItem value="full">Full Analysis</MenuItem>
                <MenuItem value="security">Security Focus</MenuItem>
                <MenuItem value="performance">Performance Focus</MenuItem>
                <MenuItem value="bugs">Bug Detection</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              onClick={startAnalysis}
              disabled={loading}
              startIcon={<SmartToyIcon />}
            >
              {loading ? 'Analyzing...' : 'Start AI Review'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleCustomReview}
              disabled={loading}
            >
              Custom Review
            </Button>
          </Stack>
          
          {loading && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                AI is analyzing your code...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Stack>
      </Box>

      {/* Analysis Results */}
      {analysis && (
        <Box>
          {/* Overall Score */}
          <Card sx={{ p: 2, mb: 3, bgcolor: analysis.overall_score >= 8 ? '#e8f5e8' : analysis.overall_score >= 6 ? '#fff3e0' : '#ffebee' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                bgcolor: analysis.overall_score >= 8 ? '#4caf50' : analysis.overall_score >= 6 ? '#ff9800' : '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h6" color="white" fontWeight={700}>
                  {analysis.overall_score}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Overall Code Quality Score
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analysis.overall_score >= 8 ? 'Excellent code quality!' : 
                   analysis.overall_score >= 6 ? 'Good code with room for improvement' : 
                   'Code needs significant improvements'}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Metrics */}
          <MetricsCard metrics={analysis.metrics} />

          {/* Issues */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Issues Found ({analysis.issues.length})
            </Typography>
            
            {analysis.issues.length === 0 ? (
              <Alert severity="success">
                <Typography>No issues found! Your code looks great.</Typography>
              </Alert>
            ) : (
              analysis.issues.map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  onApplyFix={handleApplyFix}
                />
              ))
            )}
          </Box>

          {/* AI Suggestions */}
          <Card sx={{ p: 2, bgcolor: '#f0f7ff', border: '1px solid #2196f3' }}>
            <Typography variant="h6" fontWeight={700} mb={2} color="primary">
              AI Recommendations
            </Typography>
            <List dense>
              {analysis.suggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <SmartToyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Custom Analysis Result */}
          {analysis.custom_analysis && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Custom Analysis Result:
              </Typography>
              <Typography variant="body2">
                {analysis.custom_analysis}
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Custom Review Dialog */}
      <Dialog open={showCustomDialog} onClose={() => setShowCustomDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Custom AI Code Review</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ask the AI to focus on specific aspects of your code or ask questions about your implementation.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="What would you like the AI to review?"
            multiline
            rows={4}
            fullWidth
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'Check for React performance issues' or 'Review my authentication logic for security vulnerabilities'"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomDialog(false)}>Cancel</Button>
          <Button onClick={submitCustomReview} variant="contained">
            Start Custom Review
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
