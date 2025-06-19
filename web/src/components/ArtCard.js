import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Grid({ children }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: 16 }}>
      {children}
    </div>
  );
}

export function Card({ item }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      style={{ flex: '1 0 calc(33% - 16px)', position: 'relative' }}
    >
      <Link to={`/art/${item.id}`} style={{ textDecoration: 'none' }}>
        <img
          src={item.image}
          alt={item.title}
          style={{ width: '100%', borderRadius: 8 }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            color: '#fff',
            background: 'rgba(0,0,0,0.5)',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          {item.title}
        </div>
      </Link>
    </motion.div>
  );
}
