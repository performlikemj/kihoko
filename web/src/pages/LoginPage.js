import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';

export default function LoginPage({ setUser }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiService.login(formData);
      
      // Store the auth token
      localStorage.setItem('authToken', response.data.token);
      
      // Update user state
      setUser({
        isAuthenticated: true,
        ...response.data.user
      });
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}
    >
      <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Login</h1>
        <p>Welcome back! Please sign in to your account.</p>
      </div>
      
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
          style={{ width: '100%' }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </motion.div>
  );
} 