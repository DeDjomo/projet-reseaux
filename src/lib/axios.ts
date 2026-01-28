import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9080/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage if available
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('fleetman-token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;

            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('fleetman-token');
                    localStorage.removeItem('fleetman-user');
                    window.location.href = '/login';
                }
            }

            if (status === 403) {
                // Forbidden - user doesn't have permission
                // Access denied
            }

            if (status >= 500) {
                // Server error
            }
        } else if (error.request) {
            // Request made but no response received
            // Network error
        } else {
            // Something else went wrong
        }

        return Promise.reject(error);
    }
);

export default apiClient;
export { API_BASE_URL };
