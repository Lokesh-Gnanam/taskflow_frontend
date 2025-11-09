import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          &copy; 2025 <span className="footer-highlight">TaskFlow</span>. Developed by LOKESH T
        </p>
        <div className="footer-decoration">
          <span>✨</span>
          <span>🚀</span>
          <span>🎯</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;