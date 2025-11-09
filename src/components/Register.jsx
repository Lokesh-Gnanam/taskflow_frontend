import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Auth.css';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch!',
        text: 'Passwords do not match',
        icon: 'error',
        confirmButtonColor: '#FF6666'
      });
      return false;
    }
    if (formData.password.length < 6) {
      Swal.fire({
        title: 'Weak Password!',
        text: 'Password must be at least 6 characters',
        icon: 'warning',
        confirmButtonColor: '#FF6666'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('https://8080-ffaecebdaabfcecbbeafafdaebbadedff.premiumproject.examly.io/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        await Swal.fire({
          title: 'Welcome Aboard! 🎉',
          text: `Account created successfully for ${data.user.firstName}`,
          icon: 'success',
          confirmButtonColor: '#2EC4B6',
          background: 'var(--surface-color)',
          color: 'var(--text-primary)'
        });

        onRegister(data.user);
        navigate('/dashboard');
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      await Swal.fire({
        title: 'Registration Failed!',
        text: error.message || 'Please try again',
        icon: 'error',
        confirmButtonColor: '#FF6666'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTermsClick = () => {
    Swal.fire({
      title: 'Terms & Conditions',
      html: `
        <div style="text-align: left; color: var(--text-primary); max-height: 400px; overflow-y: auto;">
          <h3>Welcome to TaskFlow!</h3>
          <p>By creating an account, you agree to the following terms:</p>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You must not misuse or abuse the service</li>
            <li>We respect your privacy and protect your personal data</li>
            <li>You can delete your account at any time</li>
          </ul>
          <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#2EC4B6',
      background: 'var(--surface-color)',
      color: 'var(--text-primary)',
      width: '500px'
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">📋</span>
            <h1>TaskFlow</h1>
          </div>
          <h2 className="auth-title">Create Account 🚀</h2>
          <p className="auth-subtitle">Join thousands managing their tasks efficiently</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">👤 First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">👤 Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">📧 Email Address</label>
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
            <label className="form-label">🎯 Account Type</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="USER">👤 Regular User</option>

            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">🔒 Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create password"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">🔒 Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              I agree to the <button type="button" className="terms-link" onClick={handleTermsClick}>Terms & Conditions</button>
            </label>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              '🎉 Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? 
            <Link to="/login" className="auth-link"> Sign in here</Link>
          </p>
        </div>
      </div>

      <div className="auth-decoration">
        <div className="floating-icon">⭐</div>
        <div className="floating-icon">✨</div>
        <div className="floating-icon">🌟</div>
      </div>
    </div>
  );
};

export default Register;