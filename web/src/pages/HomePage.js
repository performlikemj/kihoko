import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import { apiService, handleApiError } from '../services/api';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiService.getProjects();
      // Transform images to project format for backward compatibility
      const projectData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const transformedProjects = projectData.map(image => ({
        id: image.id,
        title: image.title,
        slug: image.id, // Use ID as slug for now
        image: image.thumbnailUrl || image.url,
        description: image.description
      }));
      setProjects(transformedProjects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(handleApiError(err));
      
      // Fallback to demo data if API not available
      setProjects([
        {
          id: 1,
          title: 'Digital Art Collection',
          slug: 'digital-art-collection',
          image: 'https://picsum.photos/400/300?random=1',
          description: 'A collection of digital artwork'
        },
        {
          id: 2,
          title: 'Portrait Series',
          slug: 'portrait-series',
          image: 'https://picsum.photos/400/300?random=2',
          description: 'Contemporary portrait series'
        },
        {
          id: 3,
          title: 'Abstract Expressions',
          slug: 'abstract-expressions',
          image: 'https://picsum.photos/400/300?random=3',
          description: 'Abstract art expressions'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error loading projects</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="display-1 text-center">Kihoko Mizuno Jones</h1>
        <div className="social-links">
          <a 
            href="https://www.instagram.com/kihokomizuno/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a 
            href="https://www.youtube.com/@MizunoJones" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {Array.isArray(projects) && projects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
} 