import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Task Management API Service
export class TaskManagementAPI {
  // Get all tasks for a user (optionally filtered by workspace)
  static async getTasks(userId, workspaceId = null) {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, tasks: data };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a new task
  static async createTask(taskData) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, task: data };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  }

  // Update a task
  static async updateTask(taskId, updates) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, task: data };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a task
  static async deleteTask(taskId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark task as completed
  static async completeTask(taskId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, task: data };
    } catch (error) {
      console.error('Error completing task:', error);
      return { success: false, error: error.message };
    }
  }

  // Get task statistics
  static async getTaskStats(userId, workspaceId = null) {
    try {
      const { data, error } = await supabase
        .rpc('get_task_stats', {
          user_uuid: userId,
          workspace_uuid: workspaceId
        });

      if (error) throw error;
      return { success: true, stats: data[0] };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Get tasks by status
  static async getTasksByStatus(userId, status, workspaceId = null) {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, tasks: data };
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      return { success: false, error: error.message };
    }
  }

  // Get overdue tasks
  static async getOverdueTasks(userId, workspaceId = null) {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .lt('due_date', new Date().toISOString())
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, tasks: data };
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      return { success: false, error: error.message };
    }
  }

  // Add comment to task
  static async addTaskComment(taskId, userId, content) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          user_id: userId,
          content: content
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, comment: data };
    } catch (error) {
      console.error('Error adding task comment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get task comments
  static async getTaskComments(taskId) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          users:user_id (
            id,
            email,
            full_name
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, comments: data };
    } catch (error) {
      console.error('Error fetching task comments:', error);
      return { success: false, error: error.message };
    }
  }

  // Search tasks
  static async searchTasks(userId, searchTerm, workspaceId = null) {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, tasks: data };
    } catch (error) {
      console.error('Error searching tasks:', error);
      return { success: false, error: error.message };
    }
  }
}

// Utility functions
export const taskUtils = {
  // Get priority color
  getPriorityColor(priority) {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      urgent: '#9c27b0'
    };
    return colors[priority] || colors.medium;
  },

  // Get status color
  getStatusColor(status) {
    const colors = {
      pending: '#ff9800',
      in_progress: '#2196f3',
      completed: '#4caf50',
      cancelled: '#9e9e9e'
    };
    return colors[status] || colors.pending;
  },

  // Format due date
  formatDueDate(dueDate) {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  },

  // Check if task is overdue
  isOverdue(dueDate, status) {
    if (!dueDate || status === 'completed' || status === 'cancelled') {
      return false;
    }
    return new Date(dueDate) < new Date();
  }
};

