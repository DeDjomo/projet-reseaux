import apiClient from '@/lib/axios';
import { Incident, IncidentCreate, IncidentUpdate, IncidentType, IncidentSeverity, IncidentStatus } from '@/types';
import vehicleApi from './vehicleApi';

// Incident endpoints from IncidentController - Base path: /incidents

export const incidentApi = {
    // CRUD Operations
    create: async (incident: IncidentCreate): Promise<Incident> => {
        const response = await apiClient.post<Incident>('/incidents', incident);
        return response.data;
    },

    getById: async (incidentId: number): Promise<Incident> => {
        const response = await apiClient.get<Incident>(`/incidents/${incidentId}`);
        return response.data;
    },

    getAll: async (): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>('/incidents');
        return response.data;
    },

    getByDriverId: async (driverId: number): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>(`/incidents/driver/${driverId}`);
        return response.data;
    },

    getByVehicleId: async (vehicleId: number): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>(`/incidents/vehicle/${vehicleId}`);
        return response.data;
    },

    getByType: async (type: IncidentType): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>(`/incidents/type/${type}`);
        return response.data;
    },

    getBySeverity: async (severity: IncidentSeverity): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>(`/incidents/severity/${severity}`);
        return response.data;
    },

    getByStatus: async (status: IncidentStatus): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>(`/incidents/status/${status}`);
        return response.data;
    },

    getOpen: async (): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>('/incidents/open');
        return response.data;
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>('/incidents/date-range', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    update: async (incidentId: number, incident: IncidentUpdate): Promise<Incident> => {
        const response = await apiClient.put<Incident>(`/incidents/${incidentId}`, incident);
        return response.data;
    },

    updateStatus: async (incidentId: number, status: IncidentStatus): Promise<Incident> => {
        const response = await apiClient.put<Incident>(`/incidents/${incidentId}/status/${status}`);
        return response.data;
    },

    resolve: async (incidentId: number): Promise<Incident> => {
        const response = await apiClient.put<Incident>(`/incidents/${incidentId}/resolve`);
        return response.data;
    },

    delete: async (incidentId: number): Promise<void> => {
        await apiClient.delete(`/incidents/${incidentId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/incidents/count');
        return response.data;
    },

    countByStatus: async (status: IncidentStatus): Promise<number> => {
        const response = await apiClient.get<number>(`/incidents/count/status/${status}`);
        return response.data;
    },

    countByDriverId: async (driverId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/incidents/count/driver/${driverId}`);
        return response.data;
    },

    getTotalCostByVehicleId: async (vehicleId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/incidents/cost/vehicle/${vehicleId}`);
        return response.data;
    },

    // Organization Operations
    // Organization Operations
    getByOrganization: async (organizationId: number): Promise<Incident[]> => {
        // getByOrganization is deprecated on frontend without organization context, use getByAdminId
        return [];
    },

    getByAdminId: async (adminId: number): Promise<Incident[]> => {
        // 1. Get all vehicles for the admin
        const vehicles = await vehicleApi.getByAdminId(adminId);

        // 2. Fetch incidents for each vehicle
        // Optimization: calls might be heavy. 
        // Backend Optimization TODO: Add /incidents/admin/{adminId} endpoint later.
        const incidentPromises = vehicles.map(v => incidentApi.getByVehicleId(v.vehicleId));
        const incidentsArrays = await Promise.all(incidentPromises);

        return incidentsArrays.flat();
    },

    countByOrganization: async (organizationId: number): Promise<number> => {
        return 0;
    },

    countByAdminId: async (adminId: number): Promise<number> => {
        const incidents = await incidentApi.getByAdminId(adminId);
        return incidents.length;
    },
};

export default incidentApi;
