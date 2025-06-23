import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      const [projectResponse, imagesResponse] = await Promise.all([
        apiService.getProject(slug),
        apiService.getProjectImages(slug)
      ]);
      
      setProject(projectResponse.data);
      setProjectImages(imagesResponse.data);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError(handleApiError(err));
      
      // Fallback to demo data
      const demoProject = {
        id: 1,
        title: 'Sample Project',
        description: 'This is a sample project description that would come from your Django backend.',
        image: 'https://picsum.photos/800/600?random=10',
        slug: slug
      };
      
      const demoImages = [
        { id: 1, title: 'Project Image 1', image: 'https://picsum.photos/400/300?random=11' },
        { id: 2, title: 'Project Image 2', image: 'https://picsum.photos/400/300?random=12' },
        { id: 3, title: 'Project Image 3', image: 'https://picsum.photos/400/300?random=13' }
      ];
      
      setProject(demoProject);
      setProjectImages(demoImages);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="error-message">
        <h2>Project not found</h2>
        <p>The requested project could not be loaded.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="project-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="project-header">
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
        
        {project.image && (
          <div className="project-main-image">
            <img 
              src={project.image} 
              alt={project.title}
              style={{ width: '100%', maxWidth: '800px', height: 'auto', margin: '2rem auto', display: 'block' }}
            />
          </div>
        )}

        {projectImages.length > 0 && (
          <div className="artwork-grid">
            {projectImages.map((image, index) => (
              <motion.div
                key={image.id}
                className="artwork-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={`/art/${image.id}`} className="artwork-link">
                  <div className="artwork-image">
                    <img 
                      src={image.image} 
                      alt={image.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="artwork-overlay">
                    <h3 className="artwork-title">{image.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/" className="btn btn-primary">
            Back to Portfolio
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 