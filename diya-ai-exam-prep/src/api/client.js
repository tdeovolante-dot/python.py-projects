import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000,
});

// Request interceptor for logging and auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('diya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Automatically set Content-Type based on data type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('diya_token');
        // Optionally redirect to login
      }
      console.error(`API Error [${status}]:`, data?.detail || data?.message || 'Unknown error');
    } else if (error.request) {
      console.error('Network Error: Backend server may be offline.');
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
