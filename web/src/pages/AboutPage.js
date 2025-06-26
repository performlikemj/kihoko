import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const bgUrl = 'https://live.staticflickr.com/65535/54614150947_63ef8bf185_b.jpg';

export default function AboutPage() {
  return (
    <motion.div
      className="about-page"
      style={{ backgroundImage: `url(${bgUrl})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="about-content">
        <p>
          Kihoko Mizuno Jones grew up in a small Gifu town famous for its
          centuries-old ceramic kilns. After immersing herself in ceramic arts at
          university, she later moved to Los Angeles, where vibrant street
          culture sparked her career as an illustrator. Now living in Osaka,
          Japan, Kihoko splits her time between pottery, illustration, and the
          tattoo studio.
        </p>
        <p>
          Whether you’re looking for an illustration, a one-of-a-kind ceramic
          piece, or a thoughtfully designed tattoo, she’d love to hear from you.
        </p>
        <div className="about-links">
          <Link to="/art" className="btn btn-outline-light me-2">
            View Art
          </Link>
          <a href="mailto:kiho@kihoko.com" className="btn btn-outline-light">
            Contact
          </a>
        </div>
      </div>
    </motion.div>
  );
}
