import axios from 'axios';

// Base URL for Azure Functions API
// Try to read from an environment variable first. This allows the same build
// to run on any domain (e.g. your own Azure Static Web App).  During local
// development we default to the local Functions host, otherwise we fall back to
// relative "/api" which works in production deployments.
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window?.location?.hostname === 'localhost'
    ? 'http://localhost:7071/api'
    : '/api');

// To use a custom API URL in Azure Static Web Apps, add `REACT_APP_API_URL` in
// the portal's Configuration settings.

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods for Azure Functions
export const apiService = {
  // Categories
  getCategories: () => api.get('/categories'),
  
  // Images
  getAllImages: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.featured) queryParams.append('featured', params.featured);
    
    const queryString = queryParams.toString();
    return api.get(`/images${queryString ? `?${queryString}` : ''}`);
  },
  
  getImagesByCategory: (categorySlug, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    
    const queryString = queryParams.toString();
    return api.get(`/images/${categorySlug}${queryString ? `?${queryString}` : ''}`);
  },
  
  getFeaturedImages: (limit = 10) => api.get(`/images?featured=true&limit=${limit}`),
  
  // Image upload
  uploadImage: (formData) => {
    return axios.post(`${API_BASE_URL}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Legacy methods for backward compatibility (can be removed later)
  getProjects: () => apiService.getFeaturedImages(6),
  getProject: (slug) => apiService.getImagesByCategory(slug),
  getProjectImages: (slug) => apiService.getImagesByCategory(slug),
  getArtworks: () => apiService.getAllImages(),
  getArtwork: (id) => api.get(`/image/${id}`),
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export default api; 