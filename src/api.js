// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taskflow-backend-5o21.onrender.com';

// Add fetch with timeout utility
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

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

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, 8000); // 8 second timeout

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
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
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

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendTaskData)
      }, 10000); // 10 second timeout

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, 8000); // 8 second timeout

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  },

  markTaskComplete: async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, 8000); // 8 second timeout

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking task complete:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }, 8000); // 8 second timeout

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task status:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  }
};

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      }, 15000); // 15 second timeout for login (longer for cold starts)

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.name === 'AbortError') {
        throw new Error('Login timeout - backend might be starting up. Please try again in a few seconds.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      }, 15000); // 15 second timeout for register

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Error registering:', error);
      if (error.name === 'AbortError') {
        throw new Error('Registration timeout - backend might be starting up. Please try again in a few seconds.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
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
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, 10000); // 10 second timeout

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  },

  updateUserStatus: async (userId, active) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active })
      }, 10000); // 10 second timeout

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user status:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      }, 10000); // 10 second timeout

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, 10000); // 10 second timeout

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend might be starting up');
      }
      throw error;
    }
  }
};

export const healthAPI = {
  checkBackend: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/health`, {}, 5000); // 5 second timeout for health check
      return response.ok;
    } catch (error) {
      console.log('Backend health check failed:', error);
      return false;
    }
  },

  // Quick health check with shorter timeout for initial app load
  quickHealthCheck: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/health`, {}, 3000); // 3 second timeout
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
  healthAPI,
  fetchWithTimeout
};

export default api;