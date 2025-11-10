import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { taskAPI } from '../api';
import './Home.css';

const Home = ({ tasks, onTaskUpdate, backendOnline }) => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(3);
  const [loading, setLoading] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const deleteTask = async (id, title) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete task "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6666',
      cancelButtonColor: '#5D2E8C',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        // ✅ CORRECT: Use taskAPI instead of hardcoded URL
        await taskAPI.deleteTask(id);

        onTaskUpdate();
        Swal.fire({
          title: 'Deleted!',
          text: 'Your task has been deleted.',
          icon: 'success',
          confirmButtonColor: '#2EC4B6'
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete task.',
          icon: 'error',
          confirmButtonColor: '#FF6666'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // FIXED: Status update function
  const updateTaskStatus = async (taskId, newStatus, taskTitle) => {
    setCompletingTask(taskId);
    try {
      // ✅ CORRECT: Use taskAPI instead of hardcoded URL
      await taskAPI.updateTaskStatus(taskId, newStatus);
      
      onTaskUpdate();
      
      const statusText = newStatus === 'COMPLETED' ? 'completed' : 
                        newStatus === 'IN_PROGRESS' ? 'in progress' : 'pending';
      
      Swal.fire({
        title: 'Status Updated! 🎉',
        text: `"${taskTitle}" has been marked as ${statusText}.`,
        icon: 'success',
        confirmButtonColor: '#2EC4B6'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      Swal.fire({
        title: 'Update Failed!',
        text: error.message || 'Failed to update task status. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FF6666'
      });
    } finally {
      setCompletingTask(null);
    }
  };

  // NEW: Alternative method using the complete endpoint
  const markTaskComplete = async (taskId, taskTitle) => {
    setCompletingTask(taskId);
    try {
      // ✅ CORRECT: Use taskAPI instead of hardcoded URL
      await taskAPI.markTaskComplete(taskId);
      
      onTaskUpdate();
      
      Swal.fire({
        title: 'Task Completed! 🎉',
        text: `"${taskTitle}" has been marked as completed.`,
        icon: 'success',
        confirmButtonColor: '#2EC4B6'
      });
    } catch (error) {
      console.error('Error marking task complete:', error);
      Swal.fire({
        title: 'Update Failed!',
        text: error.message || 'Failed to mark task as completed.',
        icon: 'error',
        confirmButtonColor: '#FF6666'
      });
    } finally {
      setCompletingTask(null);
    }
  };

  const getFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0];

    const filtered = tasks.filter(task => {
      if (!task) return false;
      
      const taskStatus = task.status?.toUpperCase() || 'PENDING';
      const taskDate = task.date || task.deadlineDate;

      switch (filter) {
        case 'today':
          return taskDate === today;
        case 'upcoming':
          return taskDate > today;
        case 'completed':
          return taskStatus === 'COMPLETED' || taskStatus === 'Completed';
        case 'pending':
          return taskStatus === 'PENDING' || taskStatus === 'Pending';
        case 'in-progress':
          return taskStatus === 'IN_PROGRESS' || taskStatus === 'In Progress';
        default:
          return true;
      }
    });

    return filtered;
  };

  const getStatusBadge = (status) => {
    const statusUpper = status?.toUpperCase() || 'PENDING';
    
    const statusConfig = {
      'PENDING': { color: '#FF6666', emoji: '⏳', text: 'Pending' },
      'IN_PROGRESS': { color: '#CCFF66', emoji: '🚀', text: 'In Progress' },
      'COMPLETED': { color: '#2EC4B6', emoji: '✅', text: 'Completed' }
    };

    let config;
    if (statusUpper === 'PENDING' || status === 'Pending') {
      config = statusConfig.PENDING;
    } else if (statusUpper === 'IN_PROGRESS' || status === 'In Progress') {
      config = statusConfig.IN_PROGRESS;
    } else if (statusUpper === 'COMPLETED' || status === 'Completed') {
      config = statusConfig.COMPLETED;
    } else {
      config = statusConfig.PENDING;
    }

    return (
      <span className="status-badge" style={{ backgroundColor: config.color }}>
        {config.emoji} {config.text}
      </span>
    );
  };

  const getNextStatus = (currentStatus) => {
    const statusUpper = currentStatus?.toUpperCase() || 'PENDING';
    
    if (statusUpper === 'PENDING') return 'IN_PROGRESS';
    if (statusUpper === 'IN_PROGRESS') return 'COMPLETED';
    return 'COMPLETED';
  };

  const getStatusButton = (task) => {
    const statusUpper = task.status?.toUpperCase() || 'PENDING';
    
    if (statusUpper === 'COMPLETED') {
      return (
        <button className="status-btn completed" disabled>
          ✅ Completed
        </button>
      );
    }
    
    const nextStatus = getNextStatus(task.status);
    
    // Use different endpoints based on the action
    const buttonConfig = {
      'IN_PROGRESS': { 
        text: '🚀 Start Task', 
        color: '#CCFF66',
        action: () => updateTaskStatus(task.id, 'IN_PROGRESS', task.title)
      },
      'COMPLETED': { 
        text: '✅ Mark Complete', 
        color: '#2EC4B6',
        action: () => markTaskComplete(task.id, task.title) // Use complete endpoint for final completion
      }
    };
    
    const config = buttonConfig[nextStatus] || buttonConfig.COMPLETED;
    
    return (
      <button
        className="status-btn"
        style={{ backgroundColor: config.color }}
        onClick={config.action}
        disabled={completingTask === task.id}
      >
        {completingTask === task.id ? '⏳ Updating...' : config.text}
      </button>
    );
  };

  // Rest of your existing functions (pagination, filtering, etc.)
  const filteredTasks = getFilteredTasks();
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.date || a.deadlineDate);
    const dateB = new Date(b.date || b.deadlineDate);
    return dateB - dateA;
  });

  const totalTasks = sortedTasks.length;
  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="home-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2 className="dashboard-title">Task Dashboard</h2>
          <div className="tasks-summary">
            <span className="total-tasks">Total: {totalTasks} tasks</span>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        <div className="dashboard-controls">
          <div className="filter-buttons">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Tasks</button>
            <button className={`filter-btn ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Today</button>
            <button className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Upcoming</button>
            <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
            <button className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`} onClick={() => setFilter('in-progress')}>In Progress</button>
            <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
          </div>

          <div className="pagination-controls-top">
            <div className="items-per-page">
              <label>Show: </label>
              <select value={tasksPerPage} onChange={(e) => { setTasksPerPage(Number(e.target.value)); setCurrentPage(1); }} className="page-select">
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={15}>15</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Deleting task...</p>
        </div>
      )}

      {totalTasks === 0 ? (
        <div className="no-tasks">
          <div className="no-tasks-icon">📝</div>
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
        </div>
      ) : (
        <>
          <div className="tasks-grid">
            {currentTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <h3 className="task-title">{task.title}</h3>
                  {getStatusBadge(task.status)}
                </div>

                <p className="task-description">{task.description || 'No description provided'}</p>

                <div className="task-meta">
                  <div className="task-date">
                    <span className="date-icon">📅</span>
                    {formatDate(task.date)}
                  </div>
                </div>

                <div className="task-card-footer">
                  <div className="task-actions">
                    {getStatusButton(task)}
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id, task.title)}
                      title="Delete task"
                      disabled={loading}
                    >
                      {loading ? '⏳' : '🗑️'}
                    </button>
                  </div>
                  <div className="task-id">ID: #{task.id}</div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, totalTasks)} of {totalTasks} tasks
              </div>

              <div className="pagination">
                <button className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} onClick={prevPage} disabled={currentPage === 1}>◀ Previous</button>

                <div className="page-numbers">
                  {getPageNumbers().map((number, index) => (
                    number === '...' ? (
                      <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                    ) : (
                      <button key={number} className={`page-number ${currentPage === number ? 'active' : ''}`} onClick={() => paginate(number)}>{number}</button>
                    )
                  ))}
                </div>

                <button className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`} onClick={nextPage} disabled={currentPage === totalPages}>Next ▶</button>
              </div>

              <div className="page-jump">
                <span>Go to page: </span>
                <input type="number" min="1" max={totalPages} value={currentPage} onChange={(e) => { const page = Math.max(1, Math.min(totalPages, Number(e.target.value))); setCurrentPage(page || 1); }} className="page-input" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;