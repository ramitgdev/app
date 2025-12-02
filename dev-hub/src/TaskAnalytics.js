import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Paper,
  Tabs, Tab, Chip, LinearProgress, List, ListItem,
  ListItemText, ListItemIcon, Divider, Button,
  FormControl, InputLabel, Select, MenuItem, Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { TaskManagementAPI, taskUtils } from './task-management-api';

const TaskAnalytics = ({ userId, workspaceId }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [userId, workspaceId, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    const result = await TaskManagementAPI.getTasks(userId, workspaceId);
    if (result.success) {
      setTasks(result.tasks);
      
      // Calculate advanced statistics
      const statsResult = await TaskManagementAPI.getTaskStats(userId, workspaceId);
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    }
    setLoading(false);
  };

  const getTimeRangeTasks = () => {
    const now = new Date();
    const timeRanges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    };
    
    return tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return taskDate >= timeRanges[timeRange];
    });
  };

  const calculateProductivityMetrics = () => {
    const timeRangeTasks = getTimeRangeTasks();
    const completedTasks = timeRangeTasks.filter(task => task.status === 'completed');
    const overdueTasks = timeRangeTasks.filter(task => taskUtils.isOverdue(task.due_date, task.status));
    
    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const created = new Date(task.created_at);
          const completed = new Date(task.completed_at);
          return sum + (completed - created);
        }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      completionRate: timeRangeTasks.length > 0 ? (completedTasks.length / timeRangeTasks.length) * 100 : 0,
      overdueRate: timeRangeTasks.length > 0 ? (overdueTasks.length / timeRangeTasks.length) * 100 : 0,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      totalTasks: timeRangeTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length
    };
  };

  const getPriorityDistribution = () => {
    const timeRangeTasks = getTimeRangeTasks();
    const distribution = { low: 0, medium: 0, high: 0, urgent: 0 };
    
    timeRangeTasks.forEach(task => {
      distribution[task.priority]++;
    });
    
    return distribution;
  };

  const getStatusTrend = () => {
    const timeRangeTasks = getTimeRangeTasks();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map(date => {
      const dayTasks = timeRangeTasks.filter(task => 
        new Date(task.created_at).toDateString() === date
      );
      
      return {
        date,
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.status === 'completed').length,
        pending: dayTasks.filter(t => t.status === 'pending').length,
        inProgress: dayTasks.filter(t => t.status === 'in_progress').length
      };
    });
  };

  const getTopTags = () => {
    const timeRangeTasks = getTimeRangeTasks();
    const tagCount = {};
    
    timeRangeTasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  };

  const productivityMetrics = calculateProductivityMetrics();
  const priorityDistribution = getPriorityDistribution();
  const statusTrend = getStatusTrend();
  const topTags = getTopTags();

  const renderProductivityCard = (title, value, subtitle, icon, color = 'primary') => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderProgressBar = (label, value, max, color = 'primary') => (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {value}/{max}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(value / max) * 100}
        sx={{ height: 8, borderRadius: 4 }}
        color={color}
      />
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Task Analytics
        </Typography>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Productivity Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          {renderProductivityCard(
            'Completion Rate',
            `${productivityMetrics.completionRate.toFixed(1)}%`,
            `${productivityMetrics.completedTasks} of ${productivityMetrics.totalTasks} tasks`,
            <CheckCircleIcon sx={{ fontSize: 40 }} />,
            'success'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderProductivityCard(
            'Overdue Rate',
            `${productivityMetrics.overdueRate.toFixed(1)}%`,
            `${productivityMetrics.overdueTasks} overdue tasks`,
            <WarningIcon sx={{ fontSize: 40 }} />,
            'error'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderProductivityCard(
            'Avg Completion Time',
            `${productivityMetrics.avgCompletionTime} days`,
            'Average time to complete tasks',
            <SpeedIcon sx={{ fontSize: 40 }} />,
            'info'
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          {renderProductivityCard(
            'Total Tasks',
            productivityMetrics.totalTasks,
            'Tasks created in selected period',
            <AssignmentIcon sx={{ fontSize: 40 }} />,
            'primary'
          )}
        </Grid>
      </Grid>

      {/* Analytics Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Priority Distribution" icon={<PieChartIcon />} />
          <Tab label="Status Trends" icon={<TimelineIcon />} />
          <Tab label="Top Tags" icon={<BarChartIcon />} />
          <Tab label="Performance Insights" icon={<AnalyticsIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Priority Distribution
                  </Typography>
                  {Object.entries(priorityDistribution).map(([priority, count]) => (
                    <Box key={priority} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {priority}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count} tasks
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={productivityMetrics.totalTasks > 0 ? (count / productivityMetrics.totalTasks) * 100 : 0}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={
                          priority === 'urgent' ? 'error' :
                          priority === 'high' ? 'warning' :
                          priority === 'medium' ? 'info' : 'success'
                        }
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Priority Breakdown
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(priorityDistribution).map(([priority, count]) => (
                      <Box key={priority} display="flex" alignItems="center" gap={2}>
                        <Chip
                          label={priority}
                          size="small"
                          color={
                            priority === 'urgent' ? 'error' :
                            priority === 'high' ? 'warning' :
                            priority === 'medium' ? 'info' : 'success'
                          }
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {count} tasks
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {productivityMetrics.totalTasks > 0 ? ((count / productivityMetrics.totalTasks) * 100).toFixed(1) : 0}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Status Trends (Last 7 Days)
              </Typography>
              <Grid container spacing={2}>
                {statusTrend.map((day, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {day.completed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completed
                      </Typography>
                      <Box mt={1}>
                        <Typography variant="body2" color="info.main">
                          {day.inProgress}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          In Progress
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <Typography variant="body2" color="warning.main">
                          {day.pending}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pending
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Used Tags
              </Typography>
              <List>
                {topTags.map((tag, index) => (
                  <React.Fragment key={tag.tag}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip label={index + 1} size="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={tag.tag}
                        secondary={`${tag.count} tasks`}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {productivityMetrics.totalTasks > 0 ? ((tag.count / productivityMetrics.totalTasks) * 100).toFixed(1) : 0}%
                      </Typography>
                    </ListItem>
                    {index < topTags.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Insights
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Task Completion Progress
                    </Typography>
                    {renderProgressBar(
                      'Completed Tasks',
                      productivityMetrics.completedTasks,
                      productivityMetrics.totalTasks,
                      'success'
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Overdue Tasks
                    </Typography>
                    {renderProgressBar(
                      'Overdue Tasks',
                      productivityMetrics.overdueTasks,
                      productivityMetrics.totalTasks,
                      'error'
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      In Progress Tasks
                    </Typography>
                    {renderProgressBar(
                      'In Progress',
                      tasks.filter(t => t.status === 'in_progress').length,
                      productivityMetrics.totalTasks,
                      'info'
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  
                  <List>
                    {productivityMetrics.overdueRate > 20 && (
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="High Overdue Rate"
                          secondary="Consider reducing workload or extending deadlines"
                        />
                      </ListItem>
                    )}
                    
                    {productivityMetrics.completionRate < 50 && (
                      <ListItem>
                        <ListItemIcon>
                          <TrendingDownIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Low Completion Rate"
                          secondary="Focus on completing existing tasks before adding new ones"
                        />
                      </ListItem>
                    )}
                    
                    {productivityMetrics.avgCompletionTime > 7 && (
                      <ListItem>
                        <ListItemIcon>
                          <ScheduleIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Slow Task Completion"
                          secondary="Consider breaking down complex tasks into smaller ones"
                        />
                      </ListItem>
                    )}
                    
                    {productivityMetrics.completionRate > 80 && productivityMetrics.overdueRate < 10 && (
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUpIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Excellent Performance"
                          secondary="Great job! Keep up the good work"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default TaskAnalytics;

