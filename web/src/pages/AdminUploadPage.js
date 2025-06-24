import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function AdminUploadPage() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categorySlug: '',
    tags: '',
    isFeatured: false,
    order: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage('Please select an image file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categorySlug', formData.categorySlug);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isFeatured', formData.isFeatured);
      formDataToSend.append('order', formData.order);

      const response = await apiService.uploadImage(formDataToSend);
      
      setMessage('Image uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        categorySlug: '',
        tags: '',
        isFeatured: false,
        order: 0
      });
      setSelectedFile(null);
      document.getElementById('uploadForm').reset();
      
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Upload New Image</h1>
      
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <form id="uploadForm" onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image File *</label>
          <input
            type="file"
            className="form-control"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title *</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="categorySlug" className="form-label">Category</label>
          <select
            className="form-control"
            id="categorySlug"
            name="categorySlug"
            value={formData.categorySlug}
            onChange={handleInputChange}
          >
            <option value="">Select a category (optional)</option>
            {categories.map(category => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            id="tags"
            name="tags"
            placeholder="portfolio, digital, abstract"
            value={formData.tags}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="order" className="form-label">Display Order</label>
          <input
            type="number"
            className="form-control"
            id="order"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="isFeatured">
            Feature this image (show on homepage)
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  );
} 