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
              <Link className={isActive('/')} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/about')} to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/art')} to="/art">Art</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/booking')} to="/booking">Booking</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="mailto:kiho@kihoko.com">Contact</a>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-auto nav-icons">
            <a
              className="nav-link px-3"
              href="https://shop.kihoko.com/shops/kihoo-base-shop/checkout/edit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-shopping-cart"></i>
            </a>

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
