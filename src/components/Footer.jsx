import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          &copy; 2025 <span className="footer-highlight">TaskFlow</span>. Developed by LOKESH T
        </p>
        {/* <div className="footer-decoration">
          <span>LOKESH T</span>
          <span>[Full Stack Developer]</span>
          <span></span>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;