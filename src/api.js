const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taskflow-backend-5o21.onrender.com';
export const apiUtils = {
  validateTask: (taskData) => {
    const errors = [];
    
    if (!taskData.title || taskData.title.trim().length === 0) {
      errors.push('Task title is required');
    }
    
    if (!taskData.date) {
      errors.push('Task date is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }
};

export const taskAPI = {
  getTasks: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tasks = await response.json();
      console.log('Tasks fetched successfully:', tasks.length);
      
      return tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status || 'PENDING',
        date: task.deadlineDate || task.date,
        priority: task.priority || 'MEDIUM'
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  createTask: async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const backendTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        deadlineDate: taskData.date,
        priority: taskData.priority || 'MEDIUM'
      };

      const response = await fetch(`${API_BASE_URL}/api/tasks/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendTaskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // FIXED: Mark task as completed
  markTaskComplete: async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking task complete:', error);
      throw error;
    }
  },

  // FIXED: Update task status
  updateTaskStatus: async (taskId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }
};

// ... rest of authAPI, adminAPI, healthAPI remains the same
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }
};

export const adminAPI = {
  getUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};

export const healthAPI = {
  checkBackend: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

const api = {
  API_BASE_URL,
  apiUtils,
  taskAPI,
  authAPI,
  adminAPI,
  healthAPI
};

export default api;
