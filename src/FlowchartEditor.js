import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box, Typography, Button, TextField, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon,
  Chip, Alert, CircularProgress, Paper, Stack,
  IconButton, Menu, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import {
  AccountTree, Add, Edit, Delete, PlayArrow, Save,
  SmartToy, AutoAwesome, ContentCopy, Share, Download,
  Settings, ZoomIn, ZoomOut, FitScreen
} from '@mui/icons-material';
import { llmIntegration } from './llm-integration';

// Custom node types
const nodeTypes = {
  start: ({ data }) => (
    <Box sx={{
      padding: 2,
      borderRadius: '50%',
      backgroundColor: '#4caf50',
      color: 'white',
      textAlign: 'center',
      minWidth: 80,
      minHeight: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography variant="body2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
  ),
  process: ({ data }) => (
    <Box sx={{
      padding: 2,
      borderRadius: 1,
      backgroundColor: '#2196f3',
      color: 'white',
      textAlign: 'center',
      minWidth: 120,
      minHeight: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography variant="body2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
  ),
  decision: ({ data }) => (
    <Box sx={{
      padding: 2,
      backgroundColor: '#ff9800',
      color: 'white',
      textAlign: 'center',
      minWidth: 100,
      minHeight: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'rotate(45deg)',
      '& > *': {
        transform: 'rotate(-45deg)'
      }
    }}>
      <Typography variant="body2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
  ),
  end: ({ data }) => (
    <Box sx={{
      padding: 2,
      borderRadius: '50%',
      backgroundColor: '#f44336',
      color: 'white',
      textAlign: 'center',
      minWidth: 80,
      minHeight: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography variant="body2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
  )
};

function FlowchartEditor({ flowchartData, onSave, onExit }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [showLLMDialog, setShowLLMDialog] = useState(false);
  const [llmPrompt, setLlmPrompt] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);
  const [generatedFlowchart, setGeneratedFlowchart] = useState(null);
  const [nodeType, setNodeType] = useState('process');
  const [nodeLabel, setNodeLabel] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (flowchartData) {
      setNodes(flowchartData.nodes || []);
      setEdges(flowchartData.edges || []);
    }
  }, [flowchartData]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setNodeLabel(node.data.label);
    setNodeType(node.type || 'process');
    setShowNodeDialog(true);
  };

  const handleAddNode = (type) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `New ${type}` }
    };
    setNodes((nds) => [...nds, newNode]);
    setAnchorEl(null);
  };

  const handleUpdateNode = () => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                type: nodeType,
                data: { ...node.data, label: nodeLabel }
              }
            : node
        )
      );
      setShowNodeDialog(false);
      setSelectedNode(null);
    }
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setShowNodeDialog(false);
      setSelectedNode(null);
    }
  };

  const generateFlowchartWithLLM = async () => {
    if (!llmPrompt.trim()) return;
    
    setLlmLoading(true);
    try {
      const flowchart = await llmIntegration.generateFlowchartFromIdea(
        llmPrompt,
        'web-app'
      );
      setGeneratedFlowchart(flowchart);
    } catch (error) {
      console.error('Error generating flowchart:', error);
    } finally {
      setLlmLoading(false);
    }
  };

  const applyGeneratedFlowchart = () => {
    if (generatedFlowchart) {
      setNodes(generatedFlowchart.nodes || []);
      setEdges(generatedFlowchart.edges || []);
      setShowLLMDialog(false);
      setGeneratedFlowchart(null);
      setLlmPrompt('');
    }
  };

  const handleSave = () => {
    const flowchartData = {
      nodes: nodes,
      edges: edges
    };
    onSave(flowchartData);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AccountTree color="primary" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Flowchart Editor
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
            onClick={(e) => setAnchorEl(e.currentTarget)}
            variant="outlined"
          >
            Add Node
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

      {/* Flowchart Canvas */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
          <MiniMap />
          <Panel position="top-right">
            <Stack direction="row" spacing={1}>
              <Chip label={`${nodes.length} Nodes`} color="primary" />
              <Chip label={`${edges.length} Connections`} color="secondary" />
            </Stack>
          </Panel>
        </ReactFlow>
      </Box>

      {/* Add Node Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleAddNode('start')}>
          <ListItemIcon>
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#4caf50' }} />
          </ListItemIcon>
          Start Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode('process')}>
          <ListItemIcon>
            <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: '#2196f3' }} />
          </ListItemIcon>
          Process Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode('decision')}>
          <ListItemIcon>
            <Box sx={{ width: 20, height: 20, bgcolor: '#ff9800', transform: 'rotate(45deg)' }} />
          </ListItemIcon>
          Decision Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode('end')}>
          <ListItemIcon>
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#f44336' }} />
          </ListItemIcon>
          End Node
        </MenuItem>
      </Menu>

      {/* Node Edit Dialog */}
      <Dialog
        open={showNodeDialog}
        onClose={() => setShowNodeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Node</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Node Type</InputLabel>
              <Select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value)}
                label="Node Type"
              >
                <MenuItem value="start">Start</MenuItem>
                <MenuItem value="process">Process</MenuItem>
                <MenuItem value="decision">Decision</MenuItem>
                <MenuItem value="end">End</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Node Label"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteNode} color="error">
            Delete
          </Button>
          <Button onClick={() => setShowNodeDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateNode} variant="contained">
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
            <Typography>AI Flowchart Assistant</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Describe your project idea or system to generate a flowchart
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Project Description or System Requirements"
              value={llmPrompt}
              onChange={(e) => setLlmPrompt(e.target.value)}
              placeholder="Describe your project idea, system requirements, or user flow..."
            />
            
            <Button
              startIcon={llmLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
              onClick={generateFlowchartWithLLM}
              disabled={!llmPrompt.trim() || llmLoading}
              variant="contained"
              fullWidth
            >
              Generate Flowchart
            </Button>
            
            {generatedFlowchart && (
              <Box>
                <Typography variant="h6" mb={2}>Generated Flowchart</Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                    {JSON.stringify(generatedFlowchart, null, 2)}
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
            onClick={applyGeneratedFlowchart}
            disabled={!generatedFlowchart}
            variant="contained"
          >
            Apply to Flowchart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FlowchartEditor; 