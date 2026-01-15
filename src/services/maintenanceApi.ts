import apiClient from '@/lib/axios';
import { Maintenance, MaintenanceCreate, MaintenanceUpdate } from '@/types';

// Maintenance endpoints from MaintenanceController - Base path: /maintenances

export const maintenanceApi = {
    // CRUD Operations
    create: async (maintenance: MaintenanceCreate): Promise<Maintenance> => {
        const response = await apiClient.post<Maintenance>('/maintenances', maintenance);
        return response.data;
    },

    getById: async (maintenanceId: number): Promise<Maintenance> => {
        const response = await apiClient.get<Maintenance>(`/maintenances/${maintenanceId}`);
        return response.data;
    },

    getAll: async (): Promise<Maintenance[]> => {
        const response = await apiClient.get<Maintenance[]>('/maintenances');
        return response.data;
    },

    getByVehicleId: async (vehicleId: number): Promise<Maintenance[]> => {
        const response = await apiClient.get<Maintenance[]>(`/maintenances/vehicle/${vehicleId}`);
        return response.data;
    },

    getPending: async (): Promise<Maintenance[]> => {
        const response = await apiClient.get<Maintenance[]>('/maintenances/pending');
        return response.data;
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<Maintenance[]> => {
        const response = await apiClient.get<Maintenance[]>('/maintenances/date-range', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    update: async (maintenanceId: number, maintenance: MaintenanceUpdate): Promise<Maintenance> => {
        const response = await apiClient.put<Maintenance>(`/maintenances/${maintenanceId}`, maintenance);
        return response.data;
    },

    complete: async (maintenanceId: number): Promise<Maintenance> => {
        const response = await apiClient.put<Maintenance>(`/maintenances/${maintenanceId}/complete`);
        return response.data;
    },

    delete: async (maintenanceId: number): Promise<void> => {
        await apiClient.delete(`/maintenances/${maintenanceId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/maintenances/count');
        return response.data;
    },

    getTotalCostByVehicleId: async (vehicleId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/maintenances/cost/vehicle/${vehicleId}`);
        return response.data;
    },
};

export default maintenanceApi;
