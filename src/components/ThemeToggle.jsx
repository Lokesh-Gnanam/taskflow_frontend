import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <button 
      className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Toggle theme"
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          {darkMode ? '🌙' : '☀️'}
        </div>
      </div>
      <span className="toggle-label">
        {darkMode ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;