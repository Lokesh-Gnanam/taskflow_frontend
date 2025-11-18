import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { taskAPI } from '../api';
import './TaskForm.css';

const TaskForm = ({ onTaskAdded, apiStatus }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    status: 'PENDING'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.push('Task title is required');
    }
    
    if (!formData.date) {
      newErrors.push('Task date is required');
    }
    
    if (formData.title && formData.title.length > 100) {
      newErrors.push('Task title must be less than 100 characters');
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.push('Task description must be less than 500 characters');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // ✅ CORRECT: Use taskAPI instead of hardcoded URL
      await taskAPI.createTask(formData);

      await Swal.fire({
        title: 'Success!',
        text: 'Task added successfully!',
        icon: 'success',
        confirmButtonColor: '#2EC4B6',
        confirmButtonText: 'Awesome!',
        background: 'var(--surface-color)',
        color: 'var(--text-primary)'
      });

      setFormData({
        title: '',
        description: '',
        date: '',
        status: 'PENDING'
      });

      onTaskAdded();
    } catch (error) {
      console.error('Error adding task:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to add task. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FF6666'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <div className="form-header">
        <h2 className="form-title">Create New Task</h2>
        <p className="form-subtitle">Fill in the details to add a new task to your schedule</p>

        {apiStatus === 'error' && (
          <div className="api-warning">
            ⚠️ Backend connection issue. Tasks cannot be saved.
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              ❌ {error}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your Task Title"
            required
            disabled={apiStatus === 'error'}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Add message about your task..."
            rows="4"
            disabled={apiStatus === 'error'}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Select Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-input"
              required
              disabled={apiStatus === 'error'}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
              disabled={apiStatus === 'error'}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading || apiStatus === 'error'}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Adding Task...
            </>
          ) : (
            apiStatus === 'error' ? '🔴 Backend Offline' : '🚀 ADD TASK'
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;