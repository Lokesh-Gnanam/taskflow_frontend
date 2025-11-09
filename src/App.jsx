// src/App.js
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

  // Wrap fetchUserTasks in useCallback to avoid dependency issues
  const fetchUserTasks = useCallback(async () => {
    if (!backendOnline) return;
    
    try {
      const tasksData = await taskAPI.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [backendOnline]);

  // Load user from storage
  const loadUserFromStorage = useCallback(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      return true;
    }
    return false;
  }, []);

  // Check backend status on app start
  useEffect(() => {
    const initializeApp = async () => {
      const isOnline = await healthAPI.checkBackend();
      setBackendOnline(isOnline);
      
      const userLoaded = loadUserFromStorage();
      if (userLoaded) {
        await fetchUserTasks();
      }
      
      setLoading(false);
    };

    initializeApp();
  }, [loadUserFromStorage, fetchUserTasks]);

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
    fetchUserTasks();
  };

  const handleRegister = (userData) => {
    setUser(userData);
    fetchUserTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
  };

  const handleTaskUpdate = () => {
    fetchUserTasks();
  };

  const handleTaskAdded = () => {
    fetchUserTasks();
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
            {/* Public Routes */}
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
                    apiBaseUrl="https://8080-ffaecebdaabfcecbbeafafdaebbadedff.premiumproject.examly.io"
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