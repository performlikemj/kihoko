import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ user, isDarkMode, toggleTheme }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid px-4 py-3">
        <div className="d-flex align-items-center justify-content-between w-100">
          
          {/* Left Nav */}
          <div className="d-flex align-items-center">
            <Link className="navbar-brand fs-4 me-4" to="/">
              <span className="fw-light">Kihoko</span>
              <span className="fw-bold"> Mizuno Jones</span>
            </Link>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className={isActive('/')} to="/">Portfolio</Link>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="mailto:kiho@kihoko.com">Contact</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://shop.kihoko.com" target="_blank" rel="noopener noreferrer">
                  Shop
                </a>
              </li>
            </ul>
          </div>

          {/* Right Nav */}
          <div className="d-flex align-items-center">
            {user?.isAuthenticated ? (
              <Link className="nav-link px-3" to="/profile">
                <i className="fa fa-user"></i>
              </Link>
            ) : (
              <>
                <a className="nav-link px-3" href="https://shop.kihoko.com/shops/kihoo-base-shop/checkout/edit/" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-shopping-cart"></i>
                </a>
                <Link className="nav-link px-3" to="/login">
                  Login
                </Link>
              </>
            )}
            
            {/* Theme toggle button */}
            <button 
              onClick={toggleTheme}
              className="btn btn-link nav-link theme-toggle" 
              aria-label="Toggle dark mode"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 