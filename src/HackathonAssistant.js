import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon,
  Chip, Alert, CircularProgress, Paper, Stack,
  IconButton, Grid, Stepper, Step, StepLabel,
  Accordion, AccordionSummary, AccordionDetails,
  Tabs, Tab, Divider
} from '@mui/material';
import {
  SmartToy, AutoAwesome, Lightbulb, Code, Description,
  Slideshow, AccountTree, Brush, GitHub, Google,
  ExpandMore, PlayArrow, Save, Share, Download
} from '@mui/icons-material';
import { llmIntegration } from './llm-integration';

function HackathonAssistant({ onGenerateProject, onGenerateFlowchart, onGenerateDesign, onGenerateSlides, onGenerateCode }) {
  const [activeStep, setActiveStep] = useState(0);
  const [problemStatement, setProblemStatement] = useState('');
  const [hackathonTheme, setHackathonTheme] = useState('general');
  const [generatedProject, setGeneratedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const steps = [
    'Define Problem',
    'Generate Idea',
    'Create Flowchart',
    'Design Document',
    'Build Presentation',
    'Generate Code'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const generateProjectIdea = async () => {
    if (!problemStatement.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const project = await llmIntegration.generateProjectIdea(problemStatement, hackathonTheme);
      setGeneratedProject(project);
      setShowProjectDialog(true);
    } catch (error) {
      setError('Failed to generate project idea');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlowchart = async () => {
    if (!generatedProject) return;
    
    setLoading(true);
    try {
      const flowchart = await llmIntegration.generateFlowchartFromIdea(
        generatedProject.description,
        'web-app'
      );
      onGenerateFlowchart(flowchart);
      handleNext();
    } catch (error) {
      setError('Failed to generate flowchart');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDesignDoc = async () => {
    if (!generatedProject) return;
    
    setLoading(true);
    try {
      const designDoc = await llmIntegration.generateDesignDocFromFlowchart(
        { nodes: [], edges: [] }, // Mock flowchart data
        generatedProject.description
      );
      onGenerateDesign(designDoc);
      handleNext();
    } catch (error) {
      setError('Failed to generate design document');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (!generatedProject) return;
    
    setLoading(true);
    try {
      const slides = await llmIntegration.generateSlidesFromDesignDoc(
        generatedProject.description,
        'pitch'
      );
      onGenerateSlides(slides);
      handleNext();
    } catch (error) {
      setError('Failed to generate slides');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!generatedProject) return;
    
    setLoading(true);
    try {
      const code = await llmIntegration.generateCodeFromDesignDoc(
        generatedProject.description,
        'React + Node.js',
        'web-app'
      );
      onGenerateCode(code);
      handleNext();
    } catch (error) {
      setError('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              <Lightbulb color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Define Your Problem
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Problem Statement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the problem you want to solve during this hackathon..."
              />
              <TextField
                fullWidth
                label="Hackathon Theme"
                value={hackathonTheme}
                onChange={(e) => setHackathonTheme(e.target.value)}
                placeholder="e.g., AI, Sustainability, Healthcare, etc."
              />
              <Button
                variant="contained"
                onClick={generateProjectIdea}
                disabled={!problemStatement.trim() || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
              >
                Generate Project Idea
              </Button>
            </Stack>
          </Card>
        );

      case 1:
        return (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              <AutoAwesome color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Generated Project Idea
            </Typography>
            {generatedProject ? (
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {generatedProject.name}
                </Typography>
                <Typography variant="body1">
                  {generatedProject.description}
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  Problem:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {generatedProject.problem}
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  Solution:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {generatedProject.solution}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {generatedProject.features?.map((feature, index) => (
                    <Chip key={index} label={feature} color="primary" variant="outlined" />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {generatedProject.techStack?.map((tech, index) => (
                    <Chip key={index} label={tech} color="secondary" variant="outlined" />
                  ))}
                </Stack>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  startIcon={<AccountTree />}
                >
                  Create Flowchart
                </Button>
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Generate a project idea first to continue.
              </Typography>
            )}
          </Card>
        );

      case 2:
        return (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              <AccountTree color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Flowchart
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Create a visual representation of your system's flow and user interactions.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateFlowchart}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
            >
              Generate Flowchart
            </Button>
          </Card>
        );

      case 3:
        return (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              <Description color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Design Document
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Create a comprehensive technical design document based on your flowchart.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateDesignDoc}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
            >
              Generate Design Document
            </Button>
          </Card>
        );

      case 4:
        return (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              <Slideshow color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Presentation Slides
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Create a compelling presentation for your hackathon project.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateSlides}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
            >
              Generate Slides
            </Button>
          </Card>
        );

      case 5:
        return (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              <Code color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Initial Code Structure
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Generate the initial code structure and setup for your project.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateCode}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
            >
              Generate Code
            </Button>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SmartToy color="primary" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Hackathon AI Assistant
          </Typography>
          <Chip label="From Idea to Implementation" color="primary" variant="outlined" />
        </Stack>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        {/* Stepper */}
        <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" mb={2}>Project Progress</Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {renderStepContent(activeStep)}
          
          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Project Dialog */}
      <Dialog
        open={showProjectDialog}
        onClose={() => setShowProjectDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesome color="primary" />
            <Typography>Generated Project Idea</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {generatedProject && (
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {generatedProject.name}
              </Typography>
              <Typography variant="body1">
                {generatedProject.description}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                Problem:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {generatedProject.problem}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                Solution:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {generatedProject.solution}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                Features:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {generatedProject.features?.map((feature, index) => (
                  <Chip key={index} label={feature} color="primary" variant="outlined" />
                ))}
              </Stack>
              <Typography variant="subtitle2" fontWeight="bold">
                Tech Stack:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {generatedProject.techStack?.map((tech, index) => (
                  <Chip key={index} label={tech} color="secondary" variant="outlined" />
                ))}
              </Stack>
              <Typography variant="subtitle2" fontWeight="bold">
                Timeline:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {generatedProject.timeline}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProjectDialog(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setShowProjectDialog(false);
              handleNext();
            }}
            variant="contained"
          >
            Continue to Flowchart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HackathonAssistant; 