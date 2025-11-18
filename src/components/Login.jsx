import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authAPI } from '../api';
import './Auth.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // In your Login.jsx - Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout. Backend might be starting up.')), 10000)
    );

    const loginPromise = authAPI.login(formData);
    
    const data = await Promise.race([loginPromise, timeoutPromise]);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    await Swal.fire({
      title: 'Welcome Back! 🎉',
      text: `Successfully logged in as ${data.user.firstName}`,
      icon: 'success',
      confirmButtonColor: '#2EC4B6',
      background: 'var(--surface-color)',
      color: 'var(--text-primary)'
    });

    onLogin(data.user);
    
    // Redirect based on role
    if (data.user.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = error.message || 'Invalid email or password';
    
    // Specific timeout message
    if (error.message.includes('timeout')) {
      errorMessage = 'Backend is starting up. Please try again in a few seconds.';
    }
    
    // Network error
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
    }

    await Swal.fire({
      title: 'Login Failed!',
      text: errorMessage,
      icon: 'error',
      confirmButtonColor: '#FF6666'
    });
  } finally {
    setLoading(false);
  }
};

  

  

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Forgot Password?',
      html: `
        <div style="text-align: left;">
          <p><strong>Demo Accounts:</strong></p>
          <p>👤 <strong>User:</strong> user@taskflow.com / user123</p>
          <p>👑 <strong>Admin:</strong> admin@taskflow.com / admin123</p>
          <p style="margin-top: 1rem; color: #666;">For real accounts, contact administrator.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#2EC4B6',
      confirmButtonText: 'Got it!',
      width: '500px'
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-emoji">📅</div>
        <div className="floating-emoji">✅</div>
        <div className="floating-emoji">🎯</div>
        <div className="floating-emoji">📝</div>
        <div className="floating-emoji">🚀</div>
        <div className="floating-emoji">⭐</div>
        <div className="floating-emoji">✨</div>
        <div className="floating-emoji">🔔</div>
        <div className="floating-emoji">📊</div>
        <div className="floating-emoji">👑</div>
      </div>

      <div className="auth-card" data-page="login">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon"></span>
            <h1>TaskFlow</h1>
          </div>
          <h2 className="auth-title">Welcome Back!</h2>
          <p className="auth-subtitle">Sign in to manage your tasks and boost productivity</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <button 
              type="button" 
              className="forgot-link"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        
        
        <div className="auth-footer">
          <p>
            Don't have an account? 
            <Link to="/register" className="auth-link"> Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;