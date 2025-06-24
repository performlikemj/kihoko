import axios from 'axios';

// Base URL for Azure Functions API
// Simple approach: use the actual URL directly for now
const API_BASE_URL = 'https://polite-river-0804e5800.2.azurestaticapps.net/api';

// Note: To use environment variables in Azure Static Web Apps:
// 1. Go to Azure Portal > Your Static Web App > Configuration > Application settings
// 2. Add: REACT_APP_API_URL = https://polite-river-0804e5800.2.azurestaticapps.net/api
// 3. Then replace the line above with: 
//    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://polite-river-0804e5800.2.azurestaticapps.net/api';

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
  getProjects: () => apiService.getCategories(),
  getProject: (slug) => apiService.getImagesByCategory(slug),
  getProjectImages: (slug) => apiService.getImagesByCategory(slug),
  getArtworks: () => apiService.getAllImages(),
  getArtwork: (id) => api.get(`/image/${id}`), // Note: Need to implement this function
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