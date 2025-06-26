import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <motion.div
      className="homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1>Welcome</h1>
      <div className="nav-links">
        <Link to="/about">About</Link>
        <Link to="/art">Art</Link>
        <a href="mailto:kiho@kihoko.com">Contact</a>
      </div>
    </motion.div>
  );
}

