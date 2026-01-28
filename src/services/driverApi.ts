import apiClient from '@/lib/axios';
import { Driver, DriverCreate, DriverUpdate, DriverState, PasswordChangeRequest, PasswordResetRequest, PasswordVerificationRequest } from '@/types';
import fleetApi from './fleetApi';

// Driver endpoints from DriverController - Base path: /drivers

export const driverApi = {
    // CRUD Operations
    create: async (driver: DriverCreate): Promise<Driver> => {
        const response = await apiClient.post<Driver>('/drivers', driver);
        return response.data;
    },

    // Admin-specific creation (backend assigns FleetManager automatically)
    createAsAdmin: async (adminId: number, driver: DriverCreate): Promise<Driver> => {
        const response = await apiClient.post<Driver>(`/drivers/admin/${adminId}`, driver);
        return response.data;
    },

    getById: async (driverId: number): Promise<Driver> => {
        const response = await apiClient.get<Driver>(`/drivers/${driverId}`);
        return response.data;
    },

    getByEmail: async (email: string): Promise<Driver> => {
        const response = await apiClient.get<Driver>(`/drivers/email/${email}`);
        return response.data;
    },

    getAll: async (): Promise<Driver[]> => {
        const response = await apiClient.get<Driver[]>('/drivers');
        return response.data;
    },

    getByState: async (state: DriverState): Promise<Driver[]> => {
        const response = await apiClient.get<Driver[]>(`/drivers/state/${state}`);
        return response.data;
    },

    update: async (driverId: number, driver: DriverUpdate): Promise<Driver> => {
        const response = await apiClient.put<Driver>(`/drivers/${driverId}`, driver);
        return response.data;
    },

    updateState: async (driverId: number, newState: DriverState): Promise<Driver> => {
        const response = await apiClient.put<Driver>(`/drivers/${driverId}/state`, null, {
            params: { newState }
        });
        return response.data;
    },

    delete: async (driverId: number): Promise<void> => {
        await apiClient.delete(`/drivers/${driverId}`);
    },

    // Count Operations
    countByState: async (state: DriverState): Promise<number> => {
        const response = await apiClient.get<number>(`/drivers/count/state/${state}`);
        return response.data;
    },

    // Photo Operations
    uploadPhoto: async (driverId: number, file: File): Promise<Driver> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<Driver>(`/drivers/${driverId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deletePhoto: async (driverId: number): Promise<Driver> => {
        const response = await apiClient.delete<Driver>(`/drivers/${driverId}/photo`);
        return response.data;
    },

    // Password Operations
    changePassword: async (driverId: number, passwordData: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/drivers/${driverId}/password/change`, passwordData);
        return response.data;
    },

    verifyPassword: async (driverId: number, verificationData: PasswordVerificationRequest): Promise<{ valid: boolean }> => {
        const response = await apiClient.post<{ valid: boolean }>(`/drivers/${driverId}/password/verify`, verificationData);
        return response.data;
    },

    resetPassword: async (driverId: number, resetData: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/drivers/${driverId}/password/reset`, resetData);
        return response.data;
    },
    // Organization Operations
    // Organization Operations (Simulated via Admin's Fleets)
    getByOrganization: async (organizationId: number): Promise<Driver[]> => {
        console.warn("getByOrganization is deprecated on frontend without organization context, use getByAdminId");
        return [];
    },

    getByAdminId: async (adminId: number): Promise<Driver[]> => {
        try {
            // First, get the admin's organizationId by fetching admin details
            const adminResponse = await apiClient.get(`/admins/${adminId}`);
            console.log('Full admin response:', JSON.stringify(adminResponse.data, null, 2));

            // Try different possible field names
            const organizationId = adminResponse.data.organizationId
                || adminResponse.data.organization?.organizationId
                || adminResponse.data.organization?.id;

            if (organizationId) {
                // Then fetch drivers by organization
                const response = await apiClient.get<Driver[]>(`/organizations/${organizationId}/drivers`);
                return response.data;
            }

            console.warn('Admin has no organizationId, cannot fetch drivers');
            return [];
        } catch (error) {
            console.error('Error fetching drivers by admin:', error);
            return [];
        }
    },

    countByOrganization: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/drivers/count/organization/${organizationId}`);
        return response.data;
    },

    countByAdminId: async (adminId: number): Promise<number> => {
        // This is tricky without orgId. 
        // Returing 0 for now to force usage of countByOrganization in Dashboard
        return 0;
    },
};

export default driverApi;
