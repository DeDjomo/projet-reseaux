import apiClient from '@/lib/axios';
import { Admin, AdminCreate, AdminUpdate, AdminRole, PasswordChangeRequest, PasswordResetRequest, PasswordVerificationRequest, Organization } from '@/types';

// Admin endpoints from AdminController - Base path: /admins

export const adminApi = {
    // CRUD Operations
    create: async (organizationId: number, admin: AdminCreate): Promise<Admin> => {
        const response = await apiClient.post<Admin>(`/admins/organization/${organizationId}`, admin);
        return response.data;
    },

    createSuperAdmin: async (admin: AdminCreate): Promise<Admin> => {
        const response = await apiClient.post<Admin>('/admins', admin);
        return response.data;
    },

    getById: async (adminId: number): Promise<Admin> => {
        const response = await apiClient.get<Admin>(`/admins/${adminId}`);
        return response.data;
    },

    getByEmail: async (email: string): Promise<Admin> => {
        const response = await apiClient.get<Admin>(`/admins/email/${email}`);
        return response.data;
    },

    getAll: async (): Promise<Admin[]> => {
        const response = await apiClient.get<Admin[]>('/admins');
        return response.data;
    },

    getByOrganizationId: async (organizationId: number): Promise<Admin[]> => {
        const response = await apiClient.get<Admin[]>(`/admins/organization/${organizationId}`);
        return response.data;
    },

    getByRole: async (role: AdminRole): Promise<Admin[]> => {
        const response = await apiClient.get<Admin[]>(`/admins/role/${role}`);
        return response.data;
    },

    update: async (adminId: number, admin: AdminUpdate): Promise<Admin> => {
        const response = await apiClient.put<Admin>(`/admins/${adminId}`, admin);
        return response.data;
    },

    delete: async (adminId: number): Promise<void> => {
        await apiClient.delete(`/admins/${adminId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/admins/count');
        return response.data;
    },

    // Password Operations
    changePassword: async (adminId: number, passwordData: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/admins/${adminId}/password/change`, passwordData);
        return response.data;
    },

    verifyPassword: async (adminId: number, verificationData: PasswordVerificationRequest): Promise<{ valid: boolean }> => {
        const response = await apiClient.post<{ valid: boolean }>(`/admins/${adminId}/password/verify`, verificationData);
        return response.data;
    },

    resetPassword: async (adminId: number, resetData: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put<{ success: boolean; message: string }>(`/admins/${adminId}/password/reset`, resetData);
        return response.data;
    },

    // Get admin's organization (backend returns organizationId, we then fetch the full org)
    getOrganization: async (adminId: number): Promise<Organization> => {
        // First get the organization ID from the admin
        const orgIdResponse = await apiClient.get<number>(`/admins/${adminId}/organization`);
        const organizationId = orgIdResponse.data;

        // Then fetch the full organization details
        const { organizationApi } = await import('./organizationApi');
        return organizationApi.getById(organizationId);
    },
};

export default adminApi;
