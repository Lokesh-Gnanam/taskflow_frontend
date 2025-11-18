// src/App.jsx - Updated version
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import TaskForm from './components/TaskForm';
import CalendarView from './components/CalendarView';
import Admin from './components/Admin';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

// API
import { healthAPI, taskAPI } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [backendChecked, setBackendChecked] = useState(false);

  // Load user from storage immediately without waiting for backend
  const loadUserFromStorage = useCallback(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      return true;
    }
    return false;
  }, []);

  // Fetch tasks only after we know user is logged in
  const fetchUserTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Fetching tasks for user...');
      const tasksData = await taskAPI.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setBackendOnline(false);
    }
  }, [user]);

  // Check backend status in background - don't block UI
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const isOnline = await healthAPI.checkBackend();
        setBackendOnline(isOnline);
        console.log('Backend status:', isOnline ? 'Online' : 'Offline');
      } catch (error) {
        console.log('Backend is offline');
        setBackendOnline(false);
      } finally {
        setBackendChecked(true);
      }
    };

    // Don't wait for backend check to show the app
    const userLoaded = loadUserFromStorage();
    
    // Start backend check but don't wait for it
    checkBackendStatus();
    
    // Set loading to false immediately if no user, or after minimal delay if user exists
    if (!userLoaded) {
      setLoading(false);
    } else {
      // Brief loading state for logged-in users
      setTimeout(() => setLoading(false), 500);
    }
  }, [loadUserFromStorage]);

  // Fetch tasks when user is set and backend is checked
  useEffect(() => {
    if (user && backendChecked) {
      fetchUserTasks();
    }
  }, [user, backendChecked, fetchUserTasks]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const handleLogin = (userData) => {
    setUser(userData);
    // Tasks will be fetched automatically by the useEffect
  };

  const handleRegister = (userData) => {
    setUser(userData);
    // Tasks will be fetched automatically by the useEffect
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
  };

  const handleTaskUpdate = () => {
    if (backendOnline) {
      fetchUserTasks();
    }
  };

  const handleTaskAdded = () => {
    if (backendOnline) {
      fetchUserTasks();
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (requireAdmin && user.role !== 'ADMIN') {
      return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  // Public Route Component (redirect if already logged in)
  const PublicRoute = ({ children }) => {
    if (user) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user && (
          <Navigation 
            user={user} 
            onLogout={handleLogout} 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}
        
        <main className="main-content">
          <Routes>
            {/* Public Routes - Show immediately */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login onLogin={handleLogin} />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register onRegister={handleRegister} />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Home 
                    tasks={tasks} 
                    onTaskUpdate={handleTaskUpdate}
                    backendOnline={backendOnline}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-task" 
              element={
                <ProtectedRoute>
                  <TaskForm 
                    onTaskAdded={handleTaskAdded}
                    apiStatus={backendOnline ? 'online' : 'error'}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarView 
                    tasks={tasks}
                    onTaskUpdate={handleTaskUpdate}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Backend Status Indicator */}
        {!backendOnline && (
          <div className="backend-offline">
            ⚠️ Backend is offline. Some features may not work.
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;