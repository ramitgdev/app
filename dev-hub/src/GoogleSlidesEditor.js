import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, CardContent, 
  Grid, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon,
  Chip, Alert, CircularProgress, Paper, Stack
} from '@mui/material';
import {
  Slideshow, Add, Edit, Delete, PlayArrow, Save,
  ContentCopy, Share, Download, SmartToy, AutoAwesome
} from '@mui/icons-material';
import { llmIntegration } from './llm-integration';

function GoogleSlidesEditor({ presentationUrl, googleToken, onExit }) {
  const [presentationId, setPresentationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showLLMDialog, setShowLLMDialog] = useState(false);
  const [llmPrompt, setLlmPrompt] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    if (!presentationUrl || !googleToken) return;
    
    setLoading(true);
    setError('');
    
    // Extract presentation ID from URL
    const match = presentationUrl.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError('Invalid Google Slides URL');
      setLoading(false);
      return;
    }
    
    setPresentationId(match[1]);
    loadPresentation(match[1]);
  }, [presentationUrl, googleToken]);

  const loadPresentation = async (id) => {
    try {
      // Mock data for now - in real implementation, fetch from Google Slides API
      const mockSlides = [
        {
          id: 1,
          title: 'Project Overview',
          content: 'Introduction to our hackathon project',
          type: 'title'
        },
        {
          id: 2,
          title: 'Problem Statement',
          content: 'The challenge we are solving',
          type: 'content'
        },
        {
          id: 3,
          title: 'Solution',
          content: 'Our innovative approach',
          type: 'content'
        }
      ];
      
      setSlides(mockSlides);
      setLoading(false);
    } catch (error) {
      setError('Failed to load presentation');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to Google Slides API
      console.log('Saving presentation...');
      setLoading(false);
    } catch (error) {
      setError('Failed to save presentation');
      setLoading(false);
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: 'New Slide',
      content: '',
      type: 'content'
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = (index) => {
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(Math.max(0, newSlides.length - 1));
    }
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const generateContentWithLLM = async () => {
    if (!llmPrompt.trim()) return;
    
    setLlmLoading(true);
    try {
      const content = await llmIntegration.generateSlidesFromDesignDoc(
        llmPrompt,
        'pitch'
      );
      setGeneratedContent(content);
    } catch (error) {
      setError('Failed to generate content with LLM');
    } finally {
      setLlmLoading(false);
    }
  };

  const applyGeneratedContent = () => {
    if (generatedContent && generatedContent.slides) {
      const newSlides = generatedContent.slides.map((slide, index) => ({
        id: Date.now() + index,
        title: slide.title,
        content: slide.content,
        type: slide.type || 'content'
      }));
      setSlides(newSlides);
      setShowLLMDialog(false);
      setGeneratedContent('');
      setLlmPrompt('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Google Slides...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Slideshow color="primary" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Google Slides Editor
          </Typography>
          <Button
            startIcon={<SmartToy />}
            onClick={() => setShowLLMDialog(true)}
            variant="outlined"
            color="primary"
          >
            AI Assistant
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            Save
          </Button>
          <IconButton onClick={onExit}>
            <Edit />
          </IconButton>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        {/* Slide List */}
        <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Typography variant="h6">Slides</Typography>
            <Button
              startIcon={<Add />}
              onClick={addSlide}
              size="small"
              variant="outlined"
            >
              Add Slide
            </Button>
          </Stack>
          
          <List dense>
            {slides.map((slide, index) => (
              <ListItem
                key={slide.id}
                selected={currentSlide === index}
                onClick={() => setCurrentSlide(index)}
                sx={{ cursor: 'pointer', borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <Slideshow fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={slide.title}
                  secondary={`Slide ${index + 1}`}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(index);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Slide Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {slides.length > 0 ? (
            <Card sx={{ flex: 1, p: 3 }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Slide Title"
                  value={slides[currentSlide]?.title || ''}
                  onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Slide Content"
                  value={slides[currentSlide]?.content || ''}
                  onChange={(e) => updateSlide(currentSlide, 'content', e.target.value)}
                  variant="outlined"
                  placeholder="Enter slide content..."
                />
                
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`Slide ${currentSlide + 1} of ${slides.length}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={slides[currentSlide]?.type || 'content'}
                    color="secondary"
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </Card>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              textAlign: 'center'
            }}>
              <Slideshow sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={2}>
                No slides yet
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={addSlide}
                variant="contained"
              >
                Create First Slide
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* LLM Dialog */}
      <Dialog
        open={showLLMDialog}
        onClose={() => setShowLLMDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SmartToy color="primary" />
            <Typography>AI Presentation Assistant</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Describe your project or paste a design document to generate presentation slides
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Project Description or Design Document"
              value={llmPrompt}
              onChange={(e) => setLlmPrompt(e.target.value)}
              placeholder="Describe your project idea, problem statement, or paste a design document..."
            />
            
            <Button
              startIcon={llmLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
              onClick={generateContentWithLLM}
              disabled={!llmPrompt.trim() || llmLoading}
              variant="contained"
              fullWidth
            >
              Generate Slides
            </Button>
            
            {generatedContent && (
              <Box>
                <Typography variant="h6" mb={2}>Generated Content</Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                    {JSON.stringify(generatedContent, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLLMDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={applyGeneratedContent}
            disabled={!generatedContent}
            variant="contained"
          >
            Apply to Presentation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GoogleSlidesEditor; 