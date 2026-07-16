import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const bgUrl = '/hero.jpg';

export default function HomePage() {
  return (
    <motion.div
      className="home-page"
      style={{ backgroundImage: `url(${bgUrl})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="home-links">
        <Link to="/tattoo" className="home-nav-link me-2">
          Tattoo
        </Link>
        <Link to="/ceramics" className="home-nav-link me-2">
          Ceramics
        </Link>
        <Link to="/about" className="home-nav-link me-2">
          About
        </Link>
        <a href="https://shop.kihoko.com" className="home-nav-link me-2" target="_blank" rel="noopener noreferrer">
          Shop
        </a>
        <a href="mailto:kiho@kihoko.com" className="home-nav-link">
          Contact
        </a>
      </div>
    </motion.div>
  );
}
