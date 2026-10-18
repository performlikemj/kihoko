import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const header = page.closest('.flex-container').querySelector('.navbar');
    const updateSizes = () => {
      page.style.setProperty('--home-header-height', `${header.getBoundingClientRect().height}px`);
    };

    // Account for the real header height, including the expanded mobile menu.
    updateSizes();
    const observer = new ResizeObserver(updateSizes);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={pageRef}
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="home-photo">
        <img src="/hero.jpg" alt="" width="606" height="409" />
        <nav className="home-links" aria-label="Explore Kihoko">
          <Link to="/about" className="home-nav-link">
            About
          </Link>
          <Link to="/tattoo" className="home-nav-link">
            Tattoo
          </Link>
          <Link to="/flash" className="home-nav-link">
            Flash
          </Link>
          <Link to="/ceramics" className="home-nav-link">
            Ceramics
          </Link>
          <Link to="/collaborations" className="home-nav-link">
            Collaborations
          </Link>
          <Link to="/shop" className="home-nav-link">
            Shop
          </Link>
          <a href="mailto:kiho@kihoko.com" className="home-nav-link">
            Contact
          </a>
        </nav>
      </div>
    </motion.div>
  );
}
