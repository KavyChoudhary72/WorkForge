import axios from 'axios';

export const getApiBaseUrl = () => {
  // If running on production hosted domain (e.g. Vercel), use same-origin /api proxy
  // This completely eliminates ERR_NAME_NOT_RESOLVED ISP DNS blocks and CORS issues
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('10.') &&
    !window.location.hostname.startsWith('192.168.')
  ) {
    return '/api';
  }

  // Local development on localhost or 127.0.0.1
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1') || envUrl.startsWith('/'))) {
      const clean = envUrl.replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
    return 'http://localhost:5000/api';
  }

  // Local network testing on phone / LAN (e.g., http://192.168.x.x:5173 or 10.x.x.x)
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const getSocketUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  if (typeof window !== 'undefined' && (window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('192.168.'))) {
    return `http://${window.location.hostname}:5000`;
  }
  const envSocket = import.meta.env.VITE_SOCKET_URL;
  if (envSocket && !envSocket.includes('localhost') && !envSocket.includes('127.0.0.1')) {
    return envSocket.replace(/\/+$/, '');
  }
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        if (data.accessToken) {
          localStorage.setItem('nexus_auth_token', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Token refresh failed - session expired
        localStorage.removeItem('nexus_auth_token');
        localStorage.removeItem('nexus_current_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
