import axios from 'axios';
import { getToken, clearAuthStorage } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
        clearAuthStorage();
        window.dispatchEvent(new Event('rentcar-unauthorized'));
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unable to connect to RentCar server.';
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default api;
