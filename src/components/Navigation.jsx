// src/components/Navigation.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ThemeToggle from './ThemeToggle';
import './Navigation.css';

const Navigation = ({ user, onLogout, darkMode, setDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FF6666',
      cancelButtonColor: '#5D2E8C',
      confirmButtonText: 'Yes, logout!'
    });

    if (result.isConfirmed) {
      onLogout();
      navigate('/login');
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        confirmButtonColor: '#2EC4B6'
      });
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/dashboard" className="nav-logo">
          <span className="logo-icon">📋</span>
          <span className="logo-text">TaskFlow</span>
        </Link>

        {/* Navigation Links */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          
          <Link 
            to="/add-task" 
            className={`nav-link ${isActive('/add-task') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">➕</span>
            Add Task
          </Link>
          
          <Link 
            to="/calendar" 
            className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">📅</span>
            Calendar
          </Link>
          
          {user?.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">👑</span>
              Admin
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="nav-actions">
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="user-details">
                <span className="user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="user-role">
                  {user?.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </div>
            
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;