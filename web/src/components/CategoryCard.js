import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CategoryCard({ category, index }) {
  return (
    <motion.div
      className="project-card"
      data-aos="fade-up"
      data-aos-delay={`${index}00`}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/category/${category.slug}`} className="project-link">
        <div className={category.image ? 'project-image' : 'project-image placeholder'}>
          {category.image && <img src={category.image} alt={category.name} loading="lazy" />}

        </div>
        <div className="project-overlay">
          <h2 className="project-title">{category.name}</h2>
        </div>
      </Link>
    </motion.div>
  );
}
