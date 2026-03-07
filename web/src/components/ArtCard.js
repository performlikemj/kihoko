import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Grid({ children }) {
  return <div className="art-grid">{children}</div>;
}

export function Card({ item }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div className="art-card" whileHover={{ scale: 1.02 }}>
      <Link to={`/art/${item.id}`}>
        <img
          src={item.image}
          alt={item.title}
          className={loaded ? 'img-loaded' : 'img-loading'}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
        <div className="art-card-overlay">
          <span className="art-card-title">{item.title}</span>
        </div>
      </Link>
    </motion.div>
  );
}
