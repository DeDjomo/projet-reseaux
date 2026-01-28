import apiClient from '@/lib/axios';
import { Fleet, FleetCreate, FleetUpdate, FleetType } from '@/types';

// Fleet endpoints from FleetController - Base path: /fleets

export const fleetApi = {
    // CRUD Operations
    create: async (fleetManagerId: number, fleet: FleetCreate): Promise<Fleet> => {
        const response = await apiClient.post<Fleet>(`/fleets/fleet-manager/${fleetManagerId}`, fleet);
        return response.data;
    },

    getById: async (fleetId: number): Promise<Fleet> => {
        const response = await apiClient.get<Fleet>(`/fleets/${fleetId}`);
        return response.data;
    },

    getAll: async (): Promise<Fleet[]> => {
        const response = await apiClient.get<Fleet[]>('/fleets');
        return response.data;
    },

    getByFleetManagerId: async (fleetManagerId: number): Promise<Fleet[]> => {
        const response = await apiClient.get<Fleet[]>(`/fleets/fleet-manager/${fleetManagerId}`);
        return response.data;
    },

    getByType: async (type: FleetType): Promise<Fleet[]> => {
        const response = await apiClient.get<Fleet[]>(`/fleets/type/${type}`);
        return response.data;
    },

    update: async (fleetId: number, fleet: FleetUpdate): Promise<Fleet> => {
        const response = await apiClient.put<Fleet>(`/fleets/${fleetId}`, fleet);
        return response.data;
    },

    delete: async (fleetId: number): Promise<void> => {
        await apiClient.delete(`/fleets/${fleetId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/fleets/count');
        return response.data;
    },

    // Organization Operations
    getByOrganization: async (organizationId: number): Promise<Fleet[]> => {
        // Fallback or error if adminId is unknown. Ideally we need adminId.
        // But dashboard might be calling this with orgId.
        // We will add getByAdminId and expect callers to migrate or use that.
        // getByOrganization is deprecated on frontend without organization context, use getByAdminId
        return [];
    },

    getByAdminId: async (adminId: number): Promise<Fleet[]> => {
        const response = await apiClient.get<Fleet[]>(`/fleets/admin/${adminId}`);
        return response.data;
    },

    countByOrganization: async (organizationId: number): Promise<number> => {
        // Placeholder
        return 0;
    },

    countByAdminId: async (adminId: number): Promise<number> => {
        const fleets = await fleetApi.getByAdminId(adminId);
        return fleets.length;
    },
};

export default fleetApi;
