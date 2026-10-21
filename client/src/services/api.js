import axios from 'axios';

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

// --- High-Speed Client Response Cache (0ms instant loads) ---
const clientCache = new Map();
const CLIENT_CACHE_TTL = 15000; // 15 seconds

export const clearApiCache = () => {
  clientCache.clear();
};

// Wrap API.get with instant memory cache
const originalGet = API.get.bind(API);
API.get = async (url, config = {}) => {
  if (config.skipCache) {
    return originalGet(url, config);
  }

  const token = localStorage.getItem('token') || 'anon';
  const cacheKey = `${token}:${url}:${JSON.stringify(config.params || {})}`;
  const entry = clientCache.get(cacheKey);

  if (entry && Date.now() - entry.timestamp < CLIENT_CACHE_TTL) {
    return Promise.resolve({
      ...entry.response,
      headers: { ...entry.response.headers, 'x-client-cache': 'HIT' },
    });
  }

  const res = await originalGet(url, config);

  if (res && res.status >= 200 && res.status < 300) {
    clientCache.set(cacheKey, {
      timestamp: Date.now(),
      response: res,
    });
  }

  return res;
};

// Auto-invalidate client cache on state-changing operations
['post', 'put', 'patch', 'delete'].forEach((method) => {
  const originalMethod = API[method].bind(API);
  API[method] = async (...args) => {
    const result = await originalMethod(...args);
    clearApiCache();
    return result;
  };
});

export default API;

