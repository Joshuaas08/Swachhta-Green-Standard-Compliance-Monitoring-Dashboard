import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swachhta_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('swachhta_token');
        localStorage.removeItem('swachhta_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// Building endpoints
export const buildingApi = {
  getAll: (params) => api.get('/buildings', { params }),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (data) => api.post('/buildings', data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
};

// Criteria endpoints
export const criteriaApi = {
  getAll: (params) => api.get('/criteria', { params }),
  getById: (id) => api.get(`/criteria/${id}`),
  create: (data) => api.post('/criteria', data),
  update: (id, data) => api.put(`/criteria/${id}`, data),
  delete: (id) => api.delete(`/criteria/${id}`),
};

// Inspection endpoints
export const inspectionApi = {
  getAll: (params) => api.get('/inspections', { params }),
  getById: (id) => api.get(`/inspections/${id}`),
  create: (data) => api.post('/inspections', data),
};

// Issue endpoints
export const issueApi = {
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  updateStatus: (id, data) => api.patch(`/issues/${id}/status`, data),
  resolve: (id, data) => api.patch(`/issues/${id}/resolve`, data),
};

// Analytics endpoints
export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getCategoryComparison: () => api.get('/analytics/category-comparison'),
  getBuildingComparison: () => api.get('/analytics/building-comparison'),
  getTrends: () => api.get('/analytics/trends'),
};

// Photo Upload
export const uploadApi = {
  uploadPhoto: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
