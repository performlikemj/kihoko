import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div>
          <div className="footer-brand">Kihoko Mizuno Jones</div>
        </div>

        <div>
          <div className="footer-heading">Explore</div>
          <ul className="footer-links">
            <li><Link to="/tattoo">Tattoo</Link></li>
            <li><Link to="/ceramics">Ceramics</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><a href="mailto:kiho@kihoko.com">Contact</a></li>
          </ul>
        </div>

        <div>
          <div className="footer-heading">Follow</div>
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
