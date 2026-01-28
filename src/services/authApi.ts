import apiClient from '@/lib/axios';
import { LoginRequest, LoginResponse } from '@/types';

// Auth endpoints from backend: /auth/admin/login, /auth/fleet-manager/login, /auth/driver/login

export const authApi = {
    // Admin login
    loginAdmin: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/admin/login', credentials);
        return response.data;
    },

    // Fleet Manager login
    loginFleetManager: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/fleet-manager/login', credentials);
        return response.data;
    },

    // Driver login
    loginDriver: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/driver/login', credentials);
        return response.data;
    },

    // Generic login (determines user type)
    login: async (credentials: LoginRequest, userType: 'admin' | 'fleet-manager' | 'driver'): Promise<LoginResponse> => {
        const endpoints = {
            'admin': '/auth/admin/login',
            'fleet-manager': '/auth/fleet-manager/login',
            'driver': '/auth/driver/login',
        };
        const response = await apiClient.post<LoginResponse>(endpoints[userType], credentials);
        return response.data;
    },

    // Logout (client-side only for now)
    logout: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('fleetman-token');
            localStorage.removeItem('fleetman-user');
        }
    },

    // Get current user from localStorage
    getCurrentUser: (): LoginResponse | null => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('fleetman-user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    },

    // Save user to localStorage
    saveUser: (user: LoginResponse): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('fleetman-user', JSON.stringify(user));
        }
    },
};

export default authApi;
