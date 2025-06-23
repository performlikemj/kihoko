import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';

export default function SignupPage({ setUser }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
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
    setErrors({});

    // Basic client-side validation
    if (formData.password1 !== formData.password2) {
      setErrors({ password2: 'Passwords do not match.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiService.signup(formData);
      
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
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: handleApiError(error) });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="signup-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}
    >
      <div className="signup-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Sign Up</h1>
        <p>Create an account to get started.</p>
      </div>
      
      {errors.general && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          {errors.general}
        </div>
      )}

      <form className="signup-form" onSubmit={handleSubmit}>
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
          {errors.username && (
            <div className="error-text" style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.username}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <div className="error-text" style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.email}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password1">Password:</label>
          <input
            type="password"
            id="password1"
            name="password1"
            value={formData.password1}
            onChange={handleChange}
            required
          />
          {errors.password1 && (
            <div className="error-text" style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.password1}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password2">Confirm Password:</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
          />
          {errors.password2 && (
            <div className="error-text" style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.password2}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
          style={{ width: '100%' }}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p>
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </motion.div>
  );
} 