import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Keep the existing header appearance; give the extra nav item room before
// expanding, and reuse the site's collapsed layout at the added breakpoint.
const HeaderNav = styled.nav`
  @media (min-width: 993px) and (max-width: 1199px) {
    .navbar-collapse { width: 100%; }
    .navbar-nav { flex-direction: column; gap: 0; padding: .5rem 0; width: 100%; }
    .navbar-nav .nav-item { width: 100%; text-align: center; }
    .navbar-nav .nav-link { width: 100%; padding: .75rem 0 !important; }
    .nav-icons { justify-content: center; width: 100%; margin-top: .5rem; }
  }
  @media (min-width: 1200px) and (max-width: 1399px) {
    .navbar-brand { letter-spacing: .05em; }
    .navbar-nav { gap: .25rem; }
  }
`;

export default function Header({ isDarkMode, toggleTheme }) {
  const location = useLocation();
  const { count } = useCart();
  const isActive = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  return (
    <HeaderNav className="navbar navbar-expand-xl">
      <div className="container-fluid px-4 py-3">
        <Link className="navbar-brand me-4" to="/">
          <span className="fw-light">Kihoko</span>
          <span className="fw-light"> Mizuno Jones</span>
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
          <ul className="navbar-nav me-auto mb-2 mb-xl-0">
            <li className="nav-item">
              <Link className={isActive('/tattoo')} to="/tattoo">Tattoo</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/flash')} to="/flash">Flash</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/ceramics')} to="/ceramics">Ceramics</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/about')} to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/shop')} to="/shop">Shop</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="mailto:kiho@kihoko.com">Contact</a>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-auto nav-icons">
            <Link
              className="nav-link px-3 cart-link"
              to="/shop/cart"
              aria-label="Shopping cart"
            >
              <i className="fa fa-shopping-cart"></i>
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>

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
    </HeaderNav>
  );
}
