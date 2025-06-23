import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'request',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await apiService.submitContactForm(formData);
      setSubmitStatus({
        type: 'success',
        message: response.data.message || 'Your message has been sent successfully!'
      });
      setFormData({
        name: '',
        email: '',
        subject: 'request',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: handleApiError(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="contact-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="contact-header">
        <h1>Contact</h1>
        <p>
          If you have any questions or comments, please fill out the form below, 
          and I'll get back to you as soon as possible.
        </p>
      </div>
      
      {submitStatus && (
        <div className={`alert alert-${submitStatus.type === 'success' ? 'success' : 'danger'}`}>
          {submitStatus.message}
        </div>
      )}

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="request">Request a quote</option>
            <option value="question">General question</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </motion.div>
  );
} 