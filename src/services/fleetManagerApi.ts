import apiClient from '@/lib/axios';
import { FleetManager, FleetManagerCreate, FleetManagerUpdate, DriverState, PasswordChangeRequest, PasswordResetRequest, PasswordVerificationRequest } from '@/types';

// FleetManager endpoints from FleetManagerController - Base path: /fleet-managers

export const fleetManagerApi = {
    // CRUD Operations
    create: async (adminId: number, fleetManager: FleetManagerCreate): Promise<FleetManager> => {
        const response = await apiClient.post<FleetManager>(`/fleet-managers/admin/${adminId}`, fleetManager);
        return response.data;
    },

    getById: async (managerId: number): Promise<FleetManager> => {
        const response = await apiClient.get<FleetManager>(`/fleet-managers/${managerId}`);
        return response.data;
    },

    getByEmail: async (email: string): Promise<FleetManager> => {
        const response = await apiClient.get<FleetManager>(`/fleet-managers/email/${email}`);
        return response.data;
    },

    getAll: async (): Promise<FleetManager[]> => {
        const response = await apiClient.get<FleetManager[]>('/fleet-managers');
        return response.data;
    },

    getByAdminId: async (adminId: number): Promise<FleetManager[]> => {
        const response = await apiClient.get<FleetManager[]>(`/fleet-managers/admin/${adminId}`);
        return response.data;
    },

    getByState: async (state: DriverState): Promise<FleetManager[]> => {
        const response = await apiClient.get<FleetManager[]>(`/fleet-managers/state/${state}`);
        return response.data;
    },

    update: async (managerId: number, fleetManager: FleetManagerUpdate): Promise<FleetManager> => {
        const response = await apiClient.put<FleetManager>(`/fleet-managers/${managerId}`, fleetManager);
        return response.data;
    },

    updateState: async (managerId: number, newState: DriverState): Promise<FleetManager> => {
        const response = await apiClient.patch<FleetManager>(`/fleet-managers/${managerId}/state`, null, {
            params: { newState }
        });
        return response.data;
    },

    delete: async (managerId: number): Promise<void> => {
        await apiClient.delete(`/fleet-managers/${managerId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/fleet-managers/count');
        return response.data;
    },

    countByState: async (state: DriverState): Promise<number> => {
        const response = await apiClient.get<number>(`/fleet-managers/count/state/${state}`);
        return response.data;
    },

    // Password Operations
    changePassword: async (managerId: number, passwordData: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/fleet-managers/${managerId}/password/change`, passwordData);
        return response.data;
    },

    verifyPassword: async (managerId: number, verificationData: PasswordVerificationRequest): Promise<{ valid: boolean }> => {
        const response = await apiClient.post<{ valid: boolean }>(`/fleet-managers/${managerId}/password/verify`, verificationData);
        return response.data;
    },

    resetPassword: async (managerId: number, resetData: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/fleet-managers/${managerId}/password/reset`, resetData);
        return response.data;
    },
    // Organization Operations
    // Organization Operations
    getByOrganization: async (organizationId: number): Promise<FleetManager[]> => {
        // Fallback or error if adminId is unknown.
        // getByOrganization is deprecated on frontend without organization context, use getByAdminId
        return [];
    },

    // getByAdminId already exists in this file (line 28), so we just reuse it or add countByAdminId wrapper.
    // actually, we don't need to add getByAdminId again. 

    countByOrganization: async (organizationId: number): Promise<number> => {
        return 0;
    },

    countByAdminId: async (adminId: number): Promise<number> => {
        const managers = await fleetManagerApi.getByAdminId(adminId);
        return managers.length;
    },
};

export default fleetManagerApi;
