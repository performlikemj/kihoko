import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ isDarkMode, toggleTheme }) {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid px-4 py-3">
        <Link className="navbar-brand fs-4 me-4" to="/">
          <span className="fw-light">Kihoko</span>
          <span className="fw-bold"> Mizuno Jones</span>
        </Link>

        <button
          className="navbar-toggler custom-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="toggler-line"></span>
          <span className="toggler-line"></span>
          <span className="toggler-line"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={isActive('/tattoo')} to="/tattoo">Tattoo</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/ceramics')} to="/ceramics">Ceramics</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/about')} to="/about">About</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="mailto:kiho@kihoko.com">Contact</a>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-auto nav-icons">
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
