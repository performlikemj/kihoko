import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const bgUrl = 'https://live.staticflickr.com/65535/54614150947_63ef8bf185_b.jpg';

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
        <Link to="/art" className="btn btn-outline-light me-2">
          Art
        </Link>
        <a href="mailto:kiho@kihoko.com" className="btn btn-outline-light">
          Contact
        </a>


      </div>
    </motion.div>
  );
}


