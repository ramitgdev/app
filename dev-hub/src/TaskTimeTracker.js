import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, ListItemIcon,
  Chip, Stack, LinearProgress, Alert, Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { TaskManagementAPI } from './task-management-api';

const TaskTimeTracker = ({ userId, workspaceId, onTimeUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [manualTime, setManualTime] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    loadTasks();
    loadTimeEntries();
  }, [userId, workspaceId]);

  useEffect(() => {
    let interval = null;
    if (isRunning && activeTask) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeTask]);

  const loadTasks = async () => {
    const result = await TaskManagementAPI.getTasks(userId, workspaceId);
    if (result.success) {
      setTasks(result.tasks.filter(task => task.status !== 'completed'));
    }
  };

  const loadTimeEntries = async () => {
    // This would load time entries from the database
    // For now, we'll use local state
    setTimeEntries([]);
  };

  const startTimer = (task) => {
    if (activeTask && activeTask.id !== task.id) {
      // Stop current timer first
      stopTimer();
    }
    setActiveTask(task);
    setIsRunning(true);
    setTimer(0);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = async () => {
    if (activeTask && timer > 0) {
      // Save time entry
      const timeEntry = {
        task_id: activeTask.id,
        user_id: userId,
        duration: timer,
        start_time: new Date(Date.now() - timer * 1000).toISOString(),
        end_time: new Date().toISOString()
      };
      
      // Update task with actual hours
      const currentHours = activeTask.actual_hours || 0;
      const newHours = currentHours + (timer / 3600); // Convert seconds to hours
      
      await TaskManagementAPI.updateTask(activeTask.id, {
        actual_hours: Math.round(newHours * 100) / 100
      });
      
      setTimeEntries(prev => [...prev, timeEntry]);
      if (onTimeUpdate) onTimeUpdate();
    }
    
    setActiveTask(null);
    setIsRunning(false);
    setTimer(0);
  };

  const addManualTime = async () => {
    if (!selectedTask || !manualTime) return;
    
    const hours = parseFloat(manualTime);
    if (isNaN(hours) || hours <= 0) return;
    
    const currentHours = selectedTask.actual_hours || 0;
    const newHours = currentHours + hours;
    
    await TaskManagementAPI.updateTask(selectedTask.id, {
      actual_hours: Math.round(newHours * 100) / 100
    });
    
    const timeEntry = {
      task_id: selectedTask.id,
      user_id: userId,
      duration: hours * 3600, // Convert hours to seconds
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      is_manual: true
    };
    
    setTimeEntries(prev => [...prev, timeEntry]);
    setShowTimeDialog(false);
    setManualTime('');
    setSelectedTask(null);
    if (onTimeUpdate) onTimeUpdate();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (hours) => {
    if (!hours) return '0h';
    return `${hours.toFixed(1)}h`;
  };

  const getTotalTimeForTask = (taskId) => {
    return timeEntries
      .filter(entry => entry.task_id === taskId)
      .reduce((total, entry) => total + entry.duration, 0) / 3600; // Convert to hours
  };

  return (
    <Box>
      {/* Active Timer */}
      {activeTask && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Currently Tracking: {activeTask.title}
                </Typography>
                <Typography variant="h3" sx={{ fontFamily: 'monospace' }}>
                  {formatTime(timer)}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={isRunning ? pauseTimer : () => setIsRunning(true)}
                  sx={{ color: 'white' }}
                >
                  {isRunning ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
                <IconButton onClick={stopTimer} sx={{ color: 'white' }}>
                  <StopIcon />
                </IconButton>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Task List with Time Tracking */}
      <Typography variant="h6" gutterBottom>
        <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Time Tracking
      </Typography>

      <List>
        {tasks.map((task) => {
          const totalTime = getTotalTimeForTask(task.id);
          const isActive = activeTask?.id === task.id;
          
          return (
            <Card key={task.id} sx={{ mb: 2, border: isActive ? '2px solid #2196f3' : '1px solid #e0e0e0' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {task.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={task.priority}
                        size="small"
                        color={
                          task.priority === 'urgent' ? 'error' :
                          task.priority === 'high' ? 'warning' :
                          task.priority === 'medium' ? 'info' : 'success'
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        Estimated: {formatHours(task.estimated_hours)}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        Actual: {formatHours(totalTime)}
                      </Typography>
                    </Stack>
                    
                    {/* Progress Bar */}
                    {task.estimated_hours && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((totalTime / task.estimated_hours) * 100, 100)}
                          sx={{ height: 6, borderRadius: 3 }}
                          color={totalTime > task.estimated_hours ? 'error' : 'primary'}
                        />
                      </Box>
                    )}
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Start Timer">
                      <IconButton
                        onClick={() => startTimer(task)}
                        color={isActive ? 'primary' : 'default'}
                        disabled={isActive && isRunning}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Add Manual Time">
                      <IconButton
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTimeDialog(true);
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </List>

      {/* Manual Time Entry Dialog */}
      <Dialog open={showTimeDialog} onClose={() => setShowTimeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add Manual Time Entry</Typography>
            <IconButton onClick={() => setShowTimeDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Task: {selectedTask.title}
              </Typography>
              
              <TextField
                label="Time (hours)"
                type="number"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                inputProps={{ step: 0.25, min: 0 }}
                helperText="Enter time in hours (e.g., 1.5 for 1 hour 30 minutes)"
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowTimeDialog(false)}>Cancel</Button>
          <Button
            onClick={addManualTime}
            variant="contained"
            disabled={!manualTime || parseFloat(manualTime) <= 0}
          >
            Add Time
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Summary */}
      {timeEntries.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Time Summary
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                Total time tracked today: {formatHours(timeEntries.reduce((total, entry) => total + entry.duration, 0) / 3600)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {timeEntries.length} time entries
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TaskTimeTracker;

