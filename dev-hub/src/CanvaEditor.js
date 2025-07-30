import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon,
  Chip, Alert, CircularProgress, Paper, Stack,
  IconButton, Grid, FormControl, InputLabel, Select,
  Slider, ColorPicker, Switch, FormControlLabel, Divider, MenuItem
} from '@mui/material';
import {
  Brush, Add, Edit, Delete, Save, SmartToy, AutoAwesome,
  ContentCopy, Share, Download, Palette, TextFields,
  Image, CropSquare, FormatBold, FormatItalic, FormatUnderline,
  AlignLeft, AlignCenter, AlignRight, VerticalAlignTop,
  VerticalAlignCenter, VerticalAlignBottom
} from '@mui/icons-material';
import { llmIntegration } from './llm-integration';

function CanvaEditor({ designData, onSave, onExit }) {
  const [canvas, setCanvas] = useState({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff'
  });
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showElementDialog, setShowElementDialog] = useState(false);
  const [showLLMDialog, setShowLLMDialog] = useState(false);
  const [llmPrompt, setLlmPrompt] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [elementType, setElementType] = useState('text');
  const [elementData, setElementData] = useState({
    text: '',
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#000000',
    x: 0,
    y: 0,
    width: 200,
    height: 50
  });

  useEffect(() => {
    if (designData) {
      setCanvas(designData.canvas || canvas);
      setElements(designData.elements || []);
    }
  }, [designData]);

  const addElement = (type) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: type,
      data: {
        ...elementData,
        text: type === 'text' ? 'New Text' : '',
        x: Math.random() * (canvas.width - 200),
        y: Math.random() * (canvas.height - 100)
      }
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, data: { ...el.data, ...updates } } : el
    ));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const handleElementClick = (element) => {
    setSelectedElement(element);
    setElementType(element.type);
    setElementData(element.data);
    setShowElementDialog(true);
  };

  const handleSaveElement = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, elementData);
      setShowElementDialog(false);
      setSelectedElement(null);
    }
  };

  const generateDesignWithLLM = async () => {
    if (!llmPrompt.trim()) return;
    
    setLlmLoading(true);
    try {
      // Mock design generation - in real implementation, use LLM to generate design structure
      const mockDesign = {
        canvas: {
          width: 800,
          height: 600,
          backgroundColor: '#f0f0f0'
        },
        elements: [
          {
            id: 'title',
            type: 'text',
            data: {
              text: 'Generated Title',
              fontSize: 32,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              color: '#333333',
              x: 50,
              y: 50,
              width: 300,
              height: 40
            }
          },
          {
            id: 'subtitle',
            type: 'text',
            data: {
              text: 'Generated Subtitle',
              fontSize: 18,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#666666',
              x: 50,
              y: 100,
              width: 400,
              height: 30
            }
          }
        ]
      };
      
      setGeneratedDesign(mockDesign);
    } catch (error) {
      console.error('Error generating design:', error);
    } finally {
      setLlmLoading(false);
    }
  };

  const applyGeneratedDesign = () => {
    if (generatedDesign) {
      setCanvas(generatedDesign.canvas);
      setElements(generatedDesign.elements);
      setShowLLMDialog(false);
      setGeneratedDesign(null);
      setLlmPrompt('');
    }
  };

  const handleSave = () => {
    const designData = {
      canvas: canvas,
      elements: elements
    };
    onSave(designData);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Brush color="primary" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Canva Design Editor
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
            startIcon={<Add />}
            onClick={() => addElement('text')}
            variant="outlined"
          >
            Add Text
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSave}
            variant="contained"
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
        {/* Tools Panel */}
        <Paper sx={{ width: 250, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" mb={2}>Design Tools</Typography>
          
          <Stack spacing={2}>
            <Button
              startIcon={<TextFields />}
              onClick={() => addElement('text')}
              variant="outlined"
              fullWidth
            >
              Add Text
            </Button>
            
            <Button
              startIcon={<CropSquare />}
              onClick={() => addElement('shape')}
              variant="outlined"
              fullWidth
            >
              Add Shape
            </Button>
            
            <Button
              startIcon={<Image />}
              onClick={() => addElement('image')}
              variant="outlined"
              fullWidth
            >
              Add Image
            </Button>
            
            <Divider />
            
            <Typography variant="subtitle2">Canvas Settings</Typography>
            <TextField
              label="Width"
              type="number"
              value={canvas.width}
              onChange={(e) => setCanvas({...canvas, width: parseInt(e.target.value)})}
              size="small"
            />
            <TextField
              label="Height"
              type="number"
              value={canvas.height}
              onChange={(e) => setCanvas({...canvas, height: parseInt(e.target.value)})}
              size="small"
            />
            <TextField
              label="Background Color"
              value={canvas.backgroundColor}
              onChange={(e) => setCanvas({...canvas, backgroundColor: e.target.value})}
              size="small"
            />
          </Stack>
        </Paper>

        {/* Canvas */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper 
            sx={{ 
              flex: 1, 
              position: 'relative',
              backgroundColor: canvas.backgroundColor,
              border: '2px solid #ddd',
              overflow: 'hidden'
            }}
          >
            {/* Canvas Elements */}
            {elements.map((element) => (
              <Box
                key={element.id}
                sx={{
                  position: 'absolute',
                  left: element.data.x,
                  top: element.data.y,
                  width: element.data.width,
                  height: element.data.height,
                  cursor: 'pointer',
                  border: selectedElement?.id === element.id ? '2px solid #2196f3' : '1px solid transparent',
                  '&:hover': {
                    border: '1px solid #2196f3'
                  }
                }}
                onClick={() => handleElementClick(element)}
              >
                {element.type === 'text' && (
                  <Typography
                    sx={{
                      fontSize: element.data.fontSize,
                      fontFamily: element.data.fontFamily,
                      fontWeight: element.data.fontWeight,
                      fontStyle: element.data.fontStyle,
                      textDecoration: element.data.textDecoration,
                      color: element.data.color,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {element.data.text}
                  </Typography>
                )}
                {element.type === 'shape' && (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: element.data.color || '#cccccc',
                      borderRadius: element.data.shape === 'circle' ? '50%' : 0
                    }}
                  />
                )}
                {element.type === 'image' && (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #ccc'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Image Placeholder
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Paper>
          
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip label={`${elements.length} Elements`} color="primary" />
            <Chip label={`${canvas.width}x${canvas.height}`} color="secondary" />
          </Stack>
        </Box>
      </Box>

      {/* Element Edit Dialog */}
      <Dialog
        open={showElementDialog}
        onClose={() => setShowElementDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Element</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Element Type</InputLabel>
                  <Select
                    value={elementType}
                    onChange={(e) => setElementType(e.target.value)}
                    label="Element Type"
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="shape">Shape</MenuItem>
                    <MenuItem value="image">Image</MenuItem>
                  </Select>
                </FormControl>
                
                {elementType === 'text' && (
                  <>
                    <TextField
                      fullWidth
                      label="Text Content"
                      value={elementData.text}
                      onChange={(e) => setElementData({...elementData, text: e.target.value})}
                      multiline
                      rows={3}
                    />
                    <TextField
                      fullWidth
                      label="Font Size"
                      type="number"
                      value={elementData.fontSize}
                      onChange={(e) => setElementData({...elementData, fontSize: parseInt(e.target.value)})}
                    />
                    <TextField
                      fullWidth
                      label="Font Family"
                      value={elementData.fontFamily}
                      onChange={(e) => setElementData({...elementData, fontFamily: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      label="Color"
                      value={elementData.color}
                      onChange={(e) => setElementData({...elementData, color: e.target.value})}
                    />
                  </>
                )}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="subtitle2">Position & Size</Typography>
                <TextField
                  label="X Position"
                  type="number"
                  value={elementData.x}
                  onChange={(e) => setElementData({...elementData, x: parseInt(e.target.value)})}
                />
                <TextField
                  label="Y Position"
                  type="number"
                  value={elementData.y}
                  onChange={(e) => setElementData({...elementData, y: parseInt(e.target.value)})}
                />
                <TextField
                  label="Width"
                  type="number"
                  value={elementData.width}
                  onChange={(e) => setElementData({...elementData, width: parseInt(e.target.value)})}
                />
                <TextField
                  label="Height"
                  type="number"
                  value={elementData.height}
                  onChange={(e) => setElementData({...elementData, height: parseInt(e.target.value)})}
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => deleteElement(selectedElement?.id)} color="error">
            Delete
          </Button>
          <Button onClick={() => setShowElementDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveElement} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

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
            <Typography>AI Design Assistant</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Describe your design requirements to generate a layout
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Design Description"
              value={llmPrompt}
              onChange={(e) => setLlmPrompt(e.target.value)}
              placeholder="Describe your design idea, layout requirements, or visual elements..."
            />
            
            <Button
              startIcon={llmLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
              onClick={generateDesignWithLLM}
              disabled={!llmPrompt.trim() || llmLoading}
              variant="contained"
              fullWidth
            >
              Generate Design
            </Button>
            
            {generatedDesign && (
              <Box>
                <Typography variant="h6" mb={2}>Generated Design</Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                    {JSON.stringify(generatedDesign, null, 2)}
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
            onClick={applyGeneratedDesign}
            disabled={!generatedDesign}
            variant="contained"
          >
            Apply to Design
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CanvaEditor; 