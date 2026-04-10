import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-gradient-divider"></div>
      <div className="footer-content">
        <div>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/kihokomizuno/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        &copy; {currentYear}. All rights reserved.
      </div>
    </footer>
  );
}
