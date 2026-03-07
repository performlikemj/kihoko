import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-gradient-divider"></div>
      <div className="footer-content">
        <div>
          <div className="footer-brand">Kihoko Mizuno Jones</div>
          <div className="footer-tagline">Tattoo Art &middot; Photography &middot; Digital Art</div>
        </div>
        <div>
          <div className="footer-heading">Navigate</div>
          <ul className="footer-links">
            <li><Link to="/">Portfolio</Link></li>
            <li><Link to="/category">Categories</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-heading">Connect</div>
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
        &copy; {currentYear} Kihoko Mizuno Jones. All rights reserved.
      </div>
    </footer>
  );
}
