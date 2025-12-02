import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon,
  Chip, Alert, CircularProgress, Paper, Stack,
  IconButton, Grid, Tabs, Tab, Divider, Fab,
  Tooltip, Badge, LinearProgress, Accordion,
  AccordionSummary, AccordionDetails, FormControl,
  InputLabel, Select, MenuItem, Switch, FormControlLabel,
  InputAdornment, Avatar, ListItemAvatar, ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Analytics as AnalyticsIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { TaskManagementAPI, taskUtils } from './task-management-api';
import SmartTaskTemplates from './SmartTaskTemplates';
import TaskAnalytics from './TaskAnalytics';
import TaskTimeTracker from './TaskTimeTracker';

const TaskManager = ({ userId, workspaceId = null, onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tags: []
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    loadStats();
  }, [userId, workspaceId]);

  // Load tasks
  const loadTasks = async () => {
    setLoading(true);
    const result = await TaskManagementAPI.getTasks(userId, workspaceId);
    if (result.success) {
      setTasks(result.tasks);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  // Load statistics
  const loadStats = async () => {
    const result = await TaskManagementAPI.getTaskStats(userId, workspaceId);
    if (result.success) {
      setStats(result.stats);
    }
  };

  // Create new task
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    const taskData = {
      ...newTask,
      user_id: userId,
      workspace_id: workspaceId,
      status: 'pending'
    };

    const result = await TaskManagementAPI.createTask(taskData);
    if (result.success) {
      setTasks([result.task, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        tags: []
      });
      setShowCreateDialog(false);
      loadStats();
      if (onTaskUpdate) onTaskUpdate();
    } else {
      setError(result.error);
    }
  };

  // Update task
  const handleUpdateTask = async (taskId, updates) => {
    const result = await TaskManagementAPI.updateTask(taskId, updates);
    if (result.success) {
      setTasks(tasks.map(task => 
        task.id === taskId ? result.task : task
      ));
      loadStats();
      if (onTaskUpdate) onTaskUpdate();
    } else {
      setError(result.error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const result = await TaskManagementAPI.deleteTask(taskId);
    if (result.success) {
      setTasks(tasks.filter(task => task.id !== taskId));
      loadStats();
      if (onTaskUpdate) onTaskUpdate();
    } else {
      setError(result.error);
    }
  };

  // Complete task
  const handleCompleteTask = async (taskId) => {
    const result = await TaskManagementAPI.completeTask(taskId);
    if (result.success) {
      setTasks(tasks.map(task => 
        task.id === taskId ? result.task : task
      ));
      loadStats();
      if (onTaskUpdate) onTaskUpdate();
    } else {
      setError(result.error);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => 
    taskUtils.isOverdue(task.due_date, task.status)
  );

  const renderTaskCard = (task) => (
    <Card 
      key={task.id} 
      sx={{ 
        mb: 2, 
        border: taskUtils.isOverdue(task.due_date, task.status) ? '2px solid #f44336' : '1px solid #e0e0e0',
        opacity: task.status === 'completed' ? 0.7 : 1
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <IconButton
                size="small"
                onClick={() => handleCompleteTask(task.id)}
                color={task.status === 'completed' ? 'success' : 'default'}
              >
                {task.status === 'completed' ? <CheckCircleIcon /> : <UncheckedIcon />}
              </IconButton>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  flex: 1
                }}
              >
                {task.title}
              </Typography>
            </Box>

            {task.description && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {task.description}
              </Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={task.priority}
                size="small"
                sx={{ 
                  backgroundColor: taskUtils.getPriorityColor(task.priority),
                  color: 'white',
                  fontWeight: 'bold'
                }}
                icon={<FlagIcon />}
              />
              
              <Chip
                label={task.status.replace('_', ' ')}
                size="small"
                sx={{ 
                  backgroundColor: taskUtils.getStatusColor(task.status),
                  color: 'white'
                }}
              />

              {task.due_date && (
                <Chip
                  label={taskUtils.formatDueDate(task.due_date)}
                  size="small"
                  icon={<ScheduleIcon />}
                  color={taskUtils.isOverdue(task.due_date, task.status) ? 'error' : 'default'}
                />
              )}

              {task.tags && task.tags.length > 0 && task.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>

          <Box>
            <IconButton
              size="small"
              onClick={() => {
                setSelectedTask(task);
                setShowEditDialog(true);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteTask(task.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderStats = () => (
    <Grid container spacing={2} mb={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Tasks
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.total_tasks || 0}
                </Typography>
              </Box>
              <AssignmentIcon sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pending
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.pending_tasks || 0}
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  In Progress
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.in_progress_tasks || 0}
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Completed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.completed_tasks || 0}
                </Typography>
                {stats?.completion_rate && (
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    {stats.completion_rate}% completion rate
                  </Typography>
                )}
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Task Manager
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <SmartTaskTemplates 
            userId={userId} 
            workspaceId={workspaceId} 
            resources={[]} // You can pass actual resources here
            onTaskCreated={loadTasks}
          />
          
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            Analytics
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<TimerIcon />}
            onClick={() => setShowTimeTracker(!showTimeTracker)}
          >
            Time Tracker
          </Button>
        </Stack>
        
        <Fab
          color="primary"
          onClick={() => setShowCreateDialog(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <Box sx={{ mb: 3 }}>
          <TaskAnalytics userId={userId} workspaceId={workspaceId} />
        </Box>
      )}

      {/* Time Tracker */}
      {showTimeTracker && (
        <Box sx={{ mb: 3 }}>
          <TaskTimeTracker 
            userId={userId} 
            workspaceId={workspaceId} 
            onTimeUpdate={loadTasks}
          />
        </Box>
      )}

      {/* Statistics */}
      {stats && renderStats()}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">
            {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
          </Typography>
          <Typography variant="body2">
            You have {overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} that are past their due date.
          </Typography>
        </Alert>
      )}

      {/* Task Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={pendingTasks.length} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={inProgressTasks.length} color="info">
                In Progress
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={completedTasks.length} color="success">
                Completed
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {/* Task Lists */}
      <Box>
        {activeTab === 0 && (
          <Box>
            {pendingTasks.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No pending tasks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a new task to get started!
                </Typography>
              </Paper>
            ) : (
              pendingTasks.map(renderTaskCard)
            )}
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            {inProgressTasks.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No tasks in progress
                </Typography>
              </Paper>
            ) : (
              inProgressTasks.map(renderTaskCard)
            )}
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            {completedTasks.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No completed tasks
                </Typography>
              </Paper>
            ) : (
              completedTasks.map(renderTaskCard)
            )}
          </Box>
        )}
      </Box>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
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
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={!newTask.title.trim()}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Task Title"
                value={selectedTask.title}
                onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                fullWidth
                required
              />
              
              <TextField
                label="Description"
                value={selectedTask.description || ''}
                onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedTask.status}
                  onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={selectedTask.priority}
                  onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}
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
                value={selectedTask.due_date ? selectedTask.due_date.slice(0, 16) : ''}
                onChange={(e) => setSelectedTask({ ...selectedTask, due_date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleUpdateTask(selectedTask.id, selectedTask);
              setShowEditDialog(false);
            }} 
            variant="contained"
            disabled={!selectedTask?.title.trim()}
          >
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default TaskManager;
