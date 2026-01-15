import apiClient from '@/lib/axios';
import { Organization, OrganizationCreate, OrganizationUpdate, OrganizationType, SubscriptionPlan } from '@/types';

// Organization endpoints from OrganizationController - Base path: /organizations

export const organizationApi = {
    // CRUD Operations
    create: async (organization: OrganizationCreate): Promise<Organization> => {
        const response = await apiClient.post<Organization>('/organizations', organization);
        return response.data;
    },

    getById: async (organizationId: number): Promise<Organization> => {
        const response = await apiClient.get<Organization>(`/organizations/${organizationId}`);
        return response.data;
    },

    getAll: async (): Promise<Organization[]> => {
        const response = await apiClient.get<Organization[]>('/organizations');
        return response.data;
    },

    getByType: async (type: OrganizationType): Promise<Organization[]> => {
        const response = await apiClient.get<Organization[]>(`/organizations/type/${type}`);
        return response.data;
    },

    getBySubscription: async (plan: SubscriptionPlan): Promise<Organization[]> => {
        const response = await apiClient.get<Organization[]>(`/organizations/subscription/${plan}`);
        return response.data;
    },

    update: async (organizationId: number, organization: OrganizationUpdate): Promise<Organization> => {
        const response = await apiClient.put<Organization>(`/organizations/${organizationId}`, organization);
        return response.data;
    },

    updateSubscriptionPlan: async (organizationId: number, plan: SubscriptionPlan): Promise<Organization> => {
        const response = await apiClient.put<Organization>(`/organizations/${organizationId}/subscription`, null, {
            params: { plan }
        });
        return response.data;
    },

    delete: async (organizationId: number): Promise<void> => {
        await apiClient.delete(`/organizations/${organizationId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/organizations/count');
        return response.data;
    },

    countByPlan: async (plan: SubscriptionPlan): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/count/subscription/${plan}`);
        return response.data;
    },
};

export default organizationApi;
