import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './CalendarView.css';

const CalendarView = ({ tasks, onTaskUpdate, apiBaseUrl }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateString);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const showTaskDetails = (task) => {
    Swal.fire({
      title: task.title,
      html: `
        <div style="text-align: left; color: var(--text-primary);">
          <p><strong>📝 Description:</strong> ${task.description || 'No description provided'}</p>
          <p><strong>📅 Date:</strong> ${new Date(task.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>
          <p><strong>🎯 Status:</strong> <span style="color: ${getStatusColor(task.status)}">${task.status}</span></p>
          <p><strong>🆔 Task ID:</strong> ${task.id}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#2EC4B6',
      background: 'var(--surface-color)',
      color: 'var(--text-primary)',
      width: '500px'
    });
  };

  const deleteTask = async (taskId, taskTitle) => {
    const result = await Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${taskTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6666',
      cancelButtonColor: '#5D2E8C',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/tasks/${taskId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        onTaskUpdate();
        Swal.fire({
          title: 'Deleted!',
          text: 'Task has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#2EC4B6'
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete task. Please try again.',
          icon: 'error',
          confirmButtonColor: '#FF6666'
        });
      }
    }
  };

  const handleTaskAction = (task, e) => {
    e.stopPropagation();
    Swal.fire({
      title: `Task: ${task.title}`,
      text: 'What would you like to do with this task?',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'View Details',
      denyButtonText: 'Delete Task',
      cancelButtonText: 'Close',
      confirmButtonColor: '#2EC4B6',
      denyButtonColor: '#FF6666',
      cancelButtonColor: '#5D2E8C',
      background: 'var(--surface-color)',
      color: 'var(--text-primary)'
    }).then((result) => {
      if (result.isConfirmed) {
        showTaskDetails(task);
      } else if (result.isDenied) {
        deleteTask(task.id, task.title);
      }
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTasks = getTasksForDate(date);
      const isToday = formatDate(date) === formatDate(new Date());

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
        >
          <div className="day-number">{day}</div>
          <div className="day-tasks">
            {dayTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className="task-indicator"
                style={{
                  backgroundColor: getStatusColor(task.status),
                }}
                onClick={(e) => handleTaskAction(task, e)}
              >
                <span className="task-title-short">
                  {task.title.length > 12 ? task.title.substring(0, 12) + '...' : task.title}
                </span>
                <span className="task-status-icon">
                  {getStatusIcon(task.status)}
                </span>
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="more-tasks" onClick={() => {
                Swal.fire({
                  title: `All tasks for ${day}/${currentDate.getMonth() + 1}`,
                  html: dayTasks.map(task => `
<div style="text-align: left; margin-bottom: 1rem; padding: 0.5rem; border-left: 4px solid ${getStatusColor(task.status)}; background: var(--background-color);">
<strong>${task.title}</strong><br/>
<small>Status: ${task.status}</small>
</div>
`).join(''),
                  confirmButtonColor: '#2EC4B6',
                  background: 'var(--surface-color)',
                  color: 'var(--text-primary)'
                });
              }}>
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#2EC4B6';
      case 'In Progress': return '#CCFF66';
      default: return '#FF6666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return '✅';
      case 'In Progress': return '🚀';
      default: return '⏳';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="nav-btn" onClick={() => navigateMonth(-1)}>
          ◀ Previous
        </button>

        <h2 className="calendar-month">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <button className="nav-btn" onClick={() => navigateMonth(1)}>
          Next ▶
        </button>
      </div>

      <div className="calendar-stats">
        <div className="stat-item">
          <span className="stat-number">{tasks.length}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tasks.filter(t => t.status === 'Completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tasks.filter(t => t.status === 'In Progress').length}</span>
          <span className="stat-label">In Progress</span>
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-color in-progress"></div>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pending"></div>
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
};

export default CalendarView;