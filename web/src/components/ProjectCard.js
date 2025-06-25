import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProjectCard({ project, index }) {
  return (
    <motion.div
      className="project-card"
      data-aos="fade-up"
      data-aos-delay={`${index}00`}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/art/${project.id}`} className="project-link">
        <div className="project-image">
          {project.image ? (
            <img 
              src={project.image} 
              alt={project.title} 
              loading="lazy"
            />
          ) : (
            <div style={{ padding: '1rem' }}>
              No image available for: {project.title}
            </div>
          )}
        </div>
        <div className="project-overlay">
          <h2 className="project-title">{project.title}</h2>
        </div>
      </Link>
    </motion.div>
  );
} 