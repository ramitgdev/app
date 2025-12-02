import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, List, ListItem,
  ListItemText, ListItemIcon, Divider, TextField,
  FormControl, InputLabel, Select, MenuItem, Stack,
  IconButton, Tooltip, Alert, CircularProgress
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  Assignment as TaskIcon,
  Add as AddIcon,
  Close as CloseIcon,
  AutoFixHigh as AutoFixIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Brush as UIIcon,
  Storage as DatabaseIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import { TaskManagementAPI } from './task-management-api';

const SmartTaskTemplates = ({ userId, workspaceId, resources, onTaskCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customTask, setCustomTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  // Analyze workspace and generate smart suggestions
  const generateSmartSuggestions = () => {
    const suggestions = [];

    // Analyze resources to understand project type
    const hasReactFiles = resources.some(r => r.title?.includes('.jsx') || r.title?.includes('React'));
    const hasPythonFiles = resources.some(r => r.title?.includes('.py'));
    const hasDatabaseFiles = resources.some(r => r.title?.includes('schema') || r.title?.includes('migration'));
    const hasApiFiles = resources.some(r => r.title?.includes('api') || r.title?.includes('route'));

    // Development phase suggestions
    suggestions.push({
      id: 'setup',
      category: 'Project Setup',
      icon: <CodeIcon />,
      tasks: [
        {
          title: 'Initialize project structure',
          description: 'Set up proper folder structure and configuration files',
          priority: 'high',
          tags: ['setup', 'structure']
        },
        {
          title: 'Configure development environment',
          description: 'Set up linting, formatting, and development tools',
          priority: 'high',
          tags: ['setup', 'dev-tools']
        }
      ]
    });

    // Code quality suggestions
    suggestions.push({
      id: 'quality',
      category: 'Code Quality',
      icon: <AutoFixIcon />,
      tasks: [
        {
          title: 'Add unit tests',
          description: 'Create comprehensive test coverage for core functionality',
          priority: 'medium',
          tags: ['testing', 'quality']
        },
        {
          title: 'Implement error handling',
          description: 'Add proper error handling and logging throughout the application',
          priority: 'high',
          tags: ['error-handling', 'robustness']
        },
        {
          title: 'Code review and refactoring',
          description: 'Review existing code and refactor for better maintainability',
          priority: 'medium',
          tags: ['refactoring', 'maintenance']
        }
      ]
    });

    // Security suggestions
    suggestions.push({
      id: 'security',
      category: 'Security',
      icon: <SecurityIcon />,
      tasks: [
        {
          title: 'Security audit',
          description: 'Review and fix potential security vulnerabilities',
          priority: 'high',
          tags: ['security', 'audit']
        },
        {
          title: 'Implement authentication',
          description: 'Add proper user authentication and authorization',
          priority: 'high',
          tags: ['auth', 'security']
        },
        {
          title: 'Data validation',
          description: 'Add input validation and sanitization',
          priority: 'medium',
          tags: ['validation', 'security']
        }
      ]
    });

    // Performance suggestions
    suggestions.push({
      id: 'performance',
      category: 'Performance',
      icon: <PerformanceIcon />,
      tasks: [
        {
          title: 'Performance optimization',
          description: 'Optimize code for better performance and efficiency',
          priority: 'medium',
          tags: ['performance', 'optimization']
        },
        {
          title: 'Database query optimization',
          description: 'Review and optimize database queries',
          priority: 'medium',
          tags: ['database', 'performance']
        },
        {
          title: 'Caching implementation',
          description: 'Add appropriate caching strategies',
          priority: 'low',
          tags: ['caching', 'performance']
        }
      ]
    });

    // Technology-specific suggestions
    if (hasReactFiles) {
      suggestions.push({
        id: 'react',
        category: 'React Development',
        icon: <UIIcon />,
        tasks: [
          {
            title: 'Component optimization',
            description: 'Optimize React components for better performance',
            priority: 'medium',
            tags: ['react', 'components']
          },
          {
            title: 'State management setup',
            description: 'Implement proper state management (Redux, Context, etc.)',
            priority: 'high',
            tags: ['react', 'state-management']
          },
          {
            title: 'Responsive design',
            description: 'Ensure components work well on all screen sizes',
            priority: 'medium',
            tags: ['react', 'responsive']
          }
        ]
      });
    }

    if (hasPythonFiles) {
      suggestions.push({
        id: 'python',
        category: 'Python Development',
        icon: <CodeIcon />,
        tasks: [
          {
            title: 'Virtual environment setup',
            description: 'Set up proper Python virtual environment',
            priority: 'high',
            tags: ['python', 'environment']
          },
          {
            title: 'Dependency management',
            description: 'Organize and document project dependencies',
            priority: 'medium',
            tags: ['python', 'dependencies']
          },
          {
            title: 'Type hints implementation',
            description: 'Add type hints for better code documentation',
            priority: 'low',
            tags: ['python', 'type-hints']
          }
        ]
      });
    }

    if (hasDatabaseFiles) {
      suggestions.push({
        id: 'database',
        category: 'Database',
        icon: <DatabaseIcon />,
        tasks: [
          {
            title: 'Database schema review',
            description: 'Review and optimize database schema design',
            priority: 'high',
            tags: ['database', 'schema']
          },
          {
            title: 'Migration scripts',
            description: 'Create database migration scripts',
            priority: 'medium',
            tags: ['database', 'migrations']
          },
          {
            title: 'Backup strategy',
            description: 'Implement database backup and recovery procedures',
            priority: 'medium',
            tags: ['database', 'backup']
          }
        ]
      });
    }

    if (hasApiFiles) {
      suggestions.push({
        id: 'api',
        category: 'API Development',
        icon: <ApiIcon />,
        tasks: [
          {
            title: 'API documentation',
            description: 'Create comprehensive API documentation',
            priority: 'medium',
            tags: ['api', 'documentation']
          },
          {
            title: 'API testing',
            description: 'Implement API endpoint testing',
            priority: 'high',
            tags: ['api', 'testing']
          },
          {
            title: 'Rate limiting',
            description: 'Implement API rate limiting and throttling',
            priority: 'medium',
            tags: ['api', 'security']
          }
        ]
      });
    }

    // Bug fixes and maintenance
    suggestions.push({
      id: 'maintenance',
      category: 'Maintenance',
      icon: <BugIcon />,
      tasks: [
        {
          title: 'Bug fixes',
          description: 'Address known bugs and issues',
          priority: 'high',
          tags: ['bugs', 'fixes']
        },
        {
          title: 'Dependency updates',
          description: 'Update project dependencies to latest versions',
          priority: 'medium',
          tags: ['dependencies', 'updates']
        },
        {
          title: 'Code cleanup',
          description: 'Remove unused code and improve code organization',
          priority: 'low',
          tags: ['cleanup', 'maintenance']
        }
      ]
    });

    setSuggestions(suggestions);
  };

  useEffect(() => {
    if (open) {
      generateSmartSuggestions();
    }
  }, [open, resources]);

  const handleCreateTask = async (taskData) => {
    setLoading(true);
    const result = await TaskManagementAPI.createTask({
      ...taskData,
      user_id: userId,
      workspace_id: workspaceId,
      status: 'pending'
    });

    if (result.success) {
      if (onTaskCreated) onTaskCreated();
      setCustomTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      });
      setSelectedTemplate(null);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomTask({
      title: template.title,
      description: template.description,
      priority: template.priority,
      due_date: ''
    });
  };

  return (
    <>
      <Tooltip title="Smart Task Suggestions" placement="left">
        <Button
          variant="contained"
          startIcon={<LightbulbIcon />}
          onClick={() => setOpen(true)}
          sx={{
            background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)'
            }
          }}
        >
          Smart Tasks
        </Button>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
              Smart Task Suggestions
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Based on your workspace analysis, here are intelligent task suggestions to improve your project:
            </Typography>
          </Alert>

          <Box display="flex" gap={2}>
            {/* Suggestions List */}
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                Suggested Categories
              </Typography>
              
              {suggestions.map((category) => (
                <Box key={category.id} sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    {category.icon}
                    <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
                      {category.category}
                    </Typography>
                  </Box>
                  
                  <List dense>
                    {category.tasks.map((task, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleTemplateSelect(task)}
                        sx={{
                          border: selectedTemplate?.title === task.title ? '2px solid #2196f3' : '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <TaskIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={task.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                              <Box mt={1}>
                                {task.tags.map((tag, tagIndex) => (
                                  <Chip
                                    key={tagIndex}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === 'high' ? 'error' :
                            task.priority === 'medium' ? 'warning' : 'success'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>

            {/* Task Customization */}
            <Box flex={1} sx={{ borderLeft: '1px solid #e0e0e0', pl: 2 }}>
              <Typography variant="h6" gutterBottom>
                Customize Task
              </Typography>
              
              <Stack spacing={2}>
                <TextField
                  label="Task Title"
                  value={customTask.title}
                  onChange={(e) => setCustomTask({ ...customTask, title: e.target.value })}
                  fullWidth
                  required
                />
                
                <TextField
                  label="Description"
                  value={customTask.description}
                  onChange={(e) => setCustomTask({ ...customTask, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={customTask.priority}
                    onChange={(e) => setCustomTask({ ...customTask, priority: e.target.value })}
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
                  value={customTask.due_date}
                  onChange={(e) => setCustomTask({ ...customTask, due_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleCreateTask(customTask)}
            variant="contained"
            disabled={!customTask.title.trim() || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SmartTaskTemplates;

