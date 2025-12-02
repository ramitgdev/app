import React, { useState, useEffect } from 'react';
import {
  Snackbar, Alert, Badge, IconButton, Menu, MenuItem,
  List, ListItem, ListItemText, ListItemIcon, Typography,
  Box, Divider, Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { TaskManagementAPI, taskUtils } from './task-management-api';

const TaskNotifications = ({ userId, workspaceId }) => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadNotifications();
    // Check for notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, workspaceId]);

  const loadNotifications = async () => {
    if (!userId) return;

    try {
      // Get overdue tasks
      const overdueResult = await TaskManagementAPI.getOverdueTasks(userId, workspaceId);
      const overdueTasks = overdueResult.success ? overdueResult.tasks : [];

      // Get tasks due today
      const todayResult = await TaskManagementAPI.getTasks(userId, workspaceId);
      const todayTasks = todayResult.success ? todayResult.tasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString() && task.status !== 'completed';
      }) : [];

      const newNotifications = [];

      // Add overdue notifications
      overdueTasks.forEach(task => {
        newNotifications.push({
          id: `overdue-${task.id}`,
          type: 'overdue',
          task: task,
          message: `Task "${task.title}" is overdue by ${taskUtils.formatDueDate(task.due_date)}`,
          timestamp: new Date()
        });
      });

      // Add due today notifications
      todayTasks.forEach(task => {
        newNotifications.push({
          id: `today-${task.id}`,
          type: 'due_today',
          task: task,
          message: `Task "${task.title}" is due today`,
          timestamp: new Date()
        });
      });

      setNotifications(newNotifications);

      // Show snackbar for new overdue tasks
      if (overdueTasks.length > 0) {
        setSnackbarMessage(`${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} overdue!`);
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    handleCloseMenu();
  };

  const handleMarkAllAsRead = () => {
    setNotifications([]);
    handleCloseMenu();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <WarningIcon color="error" />;
      case 'due_today':
        return <ScheduleIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'overdue':
        return 'error';
      case 'due_today':
        return 'warning';
      default:
        return 'info';
    }
  };

  const unreadCount = notifications.length;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleNotificationClick}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              All caught up! No pending notifications.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.task.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="warning"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskNotifications;

