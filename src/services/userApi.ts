import apiClient from '@/lib/axios';
import { Admin, AdminCreate, AdminUpdate, FleetManager, FleetManagerCreate, FleetManagerUpdate } from '@/types';

// Admin endpoints from backend: /admins

export const adminApi = {
    // Get all admins
    getAll: async (): Promise<Admin[]> => {
        const response = await apiClient.get<Admin[]>('/admins');
        return response.data;
    },

    // Get admin by ID
    getById: async (id: number): Promise<Admin> => {
        const response = await apiClient.get<Admin>(`/admins/${id}`);
        return response.data;
    },

    // Get admins by organization ID
    getByOrganizationId: async (organizationId: number): Promise<Admin[]> => {
        const response = await apiClient.get<Admin[]>(`/admins/organization/${organizationId}`);
        return response.data;
    },

    // Create new admin
    create: async (admin: AdminCreate): Promise<Admin> => {
        const response = await apiClient.post<Admin>('/admins', admin);
        return response.data;
    },

    // Update admin
    update: async (id: number, admin: AdminUpdate): Promise<Admin> => {
        const response = await apiClient.put<Admin>(`/admins/${id}`, admin);
        return response.data;
    },

    // Delete admin
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admins/${id}`);
    },
};

// Fleet Manager endpoints from backend: /fleet-managers

export const fleetManagerApi = {
    // Get all fleet managers
    getAll: async (): Promise<FleetManager[]> => {
        const response = await apiClient.get<FleetManager[]>('/fleet-managers');
        return response.data;
    },

    // Get fleet manager by ID
    getById: async (id: number): Promise<FleetManager> => {
        const response = await apiClient.get<FleetManager>(`/fleet-managers/${id}`);
        return response.data;
    },

    // Get fleet managers by organization ID
    getByOrganizationId: async (organizationId: number): Promise<FleetManager[]> => {
        const response = await apiClient.get<FleetManager[]>(`/fleet-managers/organization/${organizationId}`);
        return response.data;
    },

    // Create new fleet manager
    create: async (fleetManager: FleetManagerCreate): Promise<FleetManager> => {
        const response = await apiClient.post<FleetManager>('/fleet-managers', fleetManager);
        return response.data;
    },

    // Update fleet manager
    update: async (id: number, fleetManager: FleetManagerUpdate): Promise<FleetManager> => {
        const response = await apiClient.put<FleetManager>(`/fleet-managers/${id}`, fleetManager);
        return response.data;
    },

    // Delete fleet manager
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/fleet-managers/${id}`);
    },

    // Activate fleet manager
    activate: async (id: number): Promise<FleetManager> => {
        const response = await apiClient.put<FleetManager>(`/fleet-managers/${id}/activate`);
        return response.data;
    },

    // Deactivate fleet manager
    deactivate: async (id: number): Promise<FleetManager> => {
        const response = await apiClient.put<FleetManager>(`/fleet-managers/${id}/deactivate`);
        return response.data;
    },
};

export default adminApi;
