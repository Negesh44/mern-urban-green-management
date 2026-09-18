// Dynamically determine backend base URL:
// 1. Explicit VITE_API_URL if configured in environment
// 2. Relative root '' in production (for unified same-domain Vercel deployment)
// 3. http://localhost:5000 for local development
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.PROD ? '' : 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., token expired)
      console.warn('Unauthorized access or session expired');
    }
    return Promise.reject(error);
  }
);

export default API;
