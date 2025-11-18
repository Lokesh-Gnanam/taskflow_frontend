import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { adminAPI } from '../api';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    inactiveUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // ✅ CORRECT: Use adminAPI instead of hardcoded URL
      const userData = await adminAPI.getUsers();
      
      console.log('Fetched users:', userData);
      setUsers(userData);
      
      // Calculate stats
      const activeUsers = userData.filter(user => user.active === true).length;
      const adminUsers = userData.filter(user => user.role === 'ADMIN').length;
      
      setStats({
        totalUsers: userData.length,
        activeUsers: activeUsers,
        adminUsers: adminUsers,
        inactiveUsers: userData.length - activeUsers
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load users data',
        icon: 'error',
        confirmButtonColor: '#FF6666'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (userId, currentStatus, userName) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';

    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} user "${userName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#2EC4B6' : '#FF6666',
      cancelButtonColor: '#5D2E8C',
      confirmButtonText: `Yes, ${action} it!`
    });

    if (result.isConfirmed) {
      try {
        setUpdatingUser(userId);
        
        // ✅ CORRECT: Use adminAPI method
        await adminAPI.updateUserStatus(userId, newStatus);

        await Swal.fire({
          title: 'Success!',
          text: `User ${action}d successfully`,
          icon: 'success',
          confirmButtonColor: '#2EC4B6'
        });
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error('Error updating user:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to update user status',
          icon: 'error',
          confirmButtonColor: '#FF6666'
        });
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: `This will permanently delete user "${userName}". This action cannot be undone!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#FF6666',
      cancelButtonColor: '#5D2E8C',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setUpdatingUser(userId);
        
        // ✅ CORRECT: Use adminAPI method
        await adminAPI.deleteUser(userId);

        await Swal.fire({
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#2EC4B6'
        });
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to delete user',
          icon: 'error',
          confirmButtonColor: '#FF6666'
        });
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const handlePromoteToAdmin = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Promote to Admin?',
      text: `Do you want to promote "${userName}" to Administrator role?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5D2E8C',
      cancelButtonColor: '#6C757D',
      confirmButtonText: 'Yes, promote!'
    });

    if (result.isConfirmed) {
      try {
        setUpdatingUser(userId);
        
        // ✅ CORRECT: Use adminAPI method
        await adminAPI.updateUserRole(userId, 'ADMIN');

        await Swal.fire({
          title: 'Promoted!',
          text: `User "${userName}" is now an Administrator.`,
          icon: 'success',
          confirmButtonColor: '#2EC4B6'
        });
        fetchUsers();
      } catch (error) {
        console.error('Error promoting user:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to promote user',
          icon: 'error',
          confirmButtonColor: '#FF6666'
        });
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const handleDemoteToUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Demote to User?',
      text: `Do you want to demote "${userName}" from Administrator to regular User role?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6666',
      cancelButtonColor: '#6C757D',
      confirmButtonText: 'Yes, demote!'
    });

    if (result.isConfirmed) {
      try {
        setUpdatingUser(userId);
        
        // ✅ CORRECT: Use adminAPI method
        await adminAPI.updateUserRole(userId, 'USER');

        await Swal.fire({
          title: 'Demoted!',
          text: `User "${userName}" is now a regular User.`,
          icon: 'success',
          confirmButtonColor: '#2EC4B6'
        });
        fetchUsers();
      } catch (error) {
        console.error('Error demoting user:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to demote user',
          icon: 'error',
          confirmButtonColor: '#FF6666'
        });
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const getRoleBadge = (role) => {
    return role === 'ADMIN' 
      ? <span className="role-badge admin">👑 Admin</span>
      : <span className="role-badge user">👤 User</span>;
  };

  const getStatusBadge = (active) => {
    return active 
      ? <span className="status-badge active">✅ Active</span>
      : <span className="status-badge inactive">❌ Inactive</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentUser = () => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  };

  const isCurrentUser = (userId) => {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.id === userId;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">👑 Admin Dashboard</h1>
        <p className="admin-subtitle">Manage users and system settings</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">👥</div>
          <div className="stat-info">
            <h3 className="stat-number">{stats.totalUsers}</h3>
            <p className="stat-label">Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">✅</div>
          <div className="stat-info">
            <h3 className="stat-number">{stats.activeUsers}</h3>
            <p className="stat-label">Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin">👑</div>
          <div className="stat-info">
            <h3 className="stat-number">{stats.adminUsers}</h3>
            <p className="stat-label">Admin Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">⏸️</div>
          <div className="stat-info">
            <h3 className="stat-number">{stats.inactiveUsers}</h3>
            <p className="stat-label">Inactive Users</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-section">
        <div className="section-header">
          <h2>User Management</h2>
          <div className="header-actions">
            <span className="user-count">{users.length} users found</span>
            <button 
              className="refresh-btn"
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User Information</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="user-info">
                    <div className="user-avatar">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                        {isCurrentUser(user.id) && (
                          <span className="current-user-badge"> (You)</span>
                        )}
                      </div>
                      <div className="user-meta">
                        <span className="user-id">ID: {user.id}</span>
                        <span className="user-joined">
                          Joined: {formatDate(user.createdAt || user.registrationDate)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="user-contact">
                    <div className="user-email">{user.email}</div>
                    <div className="contact-actions">
                      <button 
                        className="contact-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(user.email);
                          Swal.fire({
                            title: 'Copied!',
                            text: 'Email address copied to clipboard',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                          });
                        }}
                      >
                        📧 Copy Email
                      </button>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.active)}</td>
                  <td className="action-buttons">
                    <div className="action-group">
                      {/* Don't allow modifying your own account */}
                      {!isCurrentUser(user.id) ? (
                        <>
                          <button
                            className={`action-btn ${user.active ? 'deactivate' : 'activate'} ${updatingUser === user.id ? 'loading' : ''}`}
                            onClick={() => handleUserStatus(user.id, user.active, `${user.firstName} ${user.lastName}`)}
                            disabled={updatingUser === user.id}
                          >
                            {updatingUser === user.id ? '⏳ Updating...' : user.active ? '⏸️ Deactivate' : '✅ Activate'}
                          </button>
                          
                          {user.role !== 'ADMIN' ? (
                            <button
                              className={`action-btn promote ${updatingUser === user.id ? 'loading' : ''}`}
                              onClick={() => handlePromoteToAdmin(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={updatingUser === user.id}
                            >
                              {updatingUser === user.id ? '⏳ Updating...' : '👑 Promote to Admin'}
                            </button>
                          ) : (
                            <button
                              className={`action-btn demote ${updatingUser === user.id ? 'loading' : ''}`}
                              onClick={() => handleDemoteToUser(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={updatingUser === user.id}
                            >
                              {updatingUser === user.id ? '⏳ Updating...' : '👤 Demote to User'}
                            </button>
                          )}
                          
                          <button
                            className={`action-btn delete ${updatingUser === user.id ? 'loading' : ''}`}
                            onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                            disabled={updatingUser === user.id}
                          >
                            {updatingUser === user.id ? '⏳ Deleting...' : '🗑️ Delete'}
                          </button>
                        </>
                      ) : (
                        <span className="current-user-note">Your account</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <h3>No Users Found</h3>
            <p>There are no users registered in the system yet.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons-grid">
          <button 
            className="quick-action-btn refresh"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Users'}
          </button>
          <button 
            className="quick-action-btn export"
            onClick={() => {
              // Simple export functionality
              const csvContent = "data:text/csv;charset=utf-8," 
                + "ID,Name,Email,Role,Status,Joined\n"
                + users.map(user => 
                    `${user.id},"${user.firstName} ${user.lastName}",${user.email},${user.role},${user.active ? 'Active' : 'Inactive'},"${formatDate(user.createdAt || user.registrationDate)}"`
                  ).join("\n");
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "users_export.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            📊 Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;