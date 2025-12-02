import React, { useState } from 'react';
import {
  Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Box, Typography, Chip, IconButton, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { TaskManagementAPI } from './task-management-api';

const QuickTaskWidget = ({ userId, workspaceId, onTaskCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  const handleCreateTask = async () => {
    if (!task.title.trim()) return;

    setLoading(true);
    const taskData = {
      ...task,
      user_id: userId,
      workspace_id: workspaceId,
      status: 'pending'
    };

    const result = await TaskManagementAPI.createTask(taskData);
    if (result.success) {
      setTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      });
      setOpen(false);
      if (onTaskCreated) onTaskCreated();
    }
    setLoading(false);
  };

  const quickPresets = [
    { title: 'Fix bug in login', priority: 'high' },
    { title: 'Add unit tests', priority: 'medium' },
    { title: 'Update documentation', priority: 'low' },
    { title: 'Code review', priority: 'medium' },
    { title: 'Deploy to staging', priority: 'urgent' }
  ];

  return (
    <>
      <Tooltip title="Quick Add Task" placement="left">
        <Fab
          color="primary"
          size="medium"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)'
            }
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Quick Add Task</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Quick presets:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {quickPresets.map((preset, index) => (
                <Chip
                  key={index}
                  label={preset.title}
                  size="small"
                  clickable
                  onClick={() => setTask({
                    ...task,
                    title: preset.title,
                    priority: preset.priority
                  })}
                  sx={{
                    backgroundColor: preset.priority === 'urgent' ? '#f44336' :
                                  preset.priority === 'high' ? '#ff9800' :
                                  preset.priority === 'medium' ? '#2196f3' : '#4caf50',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: preset.priority === 'urgent' ? '#d32f2f' :
                                    preset.priority === 'high' ? '#f57c00' :
                                    preset.priority === 'medium' ? '#1976d2' : '#388e3c'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            label="Task Title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Description (optional)"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          
          <Box display="flex" gap={2}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Due Date"
              type="datetime-local"
              value={task.due_date}
              onChange={(e) => setTask({ ...task, due_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTask} 
            variant="contained" 
            disabled={!task.title.trim() || loading}
            startIcon={loading ? null : <AddIcon />}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickTaskWidget;

