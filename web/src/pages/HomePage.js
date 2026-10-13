import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const bgUrl = '/hero.jpg';

export default function HomePage() {
  const pageRef = useRef(null);
  const linksRef = useRef(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const links = linksRef.current;
    const header = page.closest('.flex-container').querySelector('.navbar');
    const updateSizes = () => {
      page.style.setProperty('--home-header-height', `${header.getBoundingClientRect().height}px`);
      page.style.setProperty('--home-links-height', `${links.getBoundingClientRect().height}px`);
    };

    // Account for the real header height and for buttons wrapping on small screens.
    updateSizes();
    const observer = new ResizeObserver(updateSizes);
    observer.observe(header);
    observer.observe(links);
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
      <div className="home-photo" style={{ backgroundImage: `url(${bgUrl})` }} />
      <nav ref={linksRef} className="home-links" aria-label="Explore Kihoko">
        <Link to="/tattoo" className="home-nav-link">
          Tattoo
        </Link>
        <Link to="/flash" className="home-nav-link">
          Flash
        </Link>
        <Link to="/ceramics" className="home-nav-link">
          Ceramics
        </Link>
        <Link to="/about" className="home-nav-link">
          About
        </Link>
        <Link to="/shop" className="home-nav-link">
          Shop
        </Link>
        <a href="mailto:kiho@kihoko.com" className="home-nav-link">
          Contact
        </a>
      </nav>
    </motion.div>
  );
}
