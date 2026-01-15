import apiClient from '@/lib/axios';
import { Geofence, CircleGeofenceCreate, PolygonGeofenceCreate, GeofenceUpdate, GeofenceType } from '@/types';
import fleetManagerApi from './fleetManagerApi';

// Geofence endpoints from GeofenceController - Base path: /geofences

export const geofenceApi = {
    // CRUD Operations
    createCircle: async (geofence: CircleGeofenceCreate): Promise<Geofence> => {
        const response = await apiClient.post<Geofence>('/geofences/circle', geofence);
        return response.data;
    },

    createPolygon: async (geofence: PolygonGeofenceCreate): Promise<Geofence> => {
        const response = await apiClient.post<Geofence>('/geofences/polygon', geofence);
        return response.data;
    },

    // Admin-specific creation (backend assigns FleetManager automatically)
    createCircleAsAdmin: async (adminId: number, geofence: CircleGeofenceCreate): Promise<Geofence> => {
        const response = await apiClient.post<Geofence>(`/geofences/circle/admin/${adminId}`, geofence);
        return response.data;
    },

    createPolygonAsAdmin: async (adminId: number, geofence: PolygonGeofenceCreate): Promise<Geofence> => {
        const response = await apiClient.post<Geofence>(`/geofences/polygon/admin/${adminId}`, geofence);
        return response.data;
    },


    getById: async (geofenceId: number): Promise<Geofence> => {
        const response = await apiClient.get<Geofence>(`/geofences/${geofenceId}`);
        return response.data;
    },

    getAll: async (): Promise<Geofence[]> => {
        const response = await apiClient.get<Geofence[]>('/geofences');
        return response.data;
    },

    getByType: async (type: GeofenceType): Promise<Geofence[]> => {
        const response = await apiClient.get<Geofence[]>(`/geofences/type/${type}`);
        return response.data;
    },

    getActive: async (): Promise<Geofence[]> => {
        const response = await apiClient.get<Geofence[]>('/geofences/active');
        return response.data;
    },

    update: async (geofenceId: number, geofence: GeofenceUpdate): Promise<Geofence> => {
        const response = await apiClient.put<Geofence>(`/geofences/${geofenceId}`, geofence);
        return response.data;
    },

    toggleActive: async (geofenceId: number, isActive: boolean): Promise<Geofence> => {
        const response = await apiClient.put<Geofence>(`/geofences/${geofenceId}/active`, null, {
            params: { isActive }
        });
        return response.data;
    },

    delete: async (geofenceId: number): Promise<void> => {
        await apiClient.delete(`/geofences/${geofenceId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/geofences/count');
        return response.data;
    },
    // Organization Operations
    getByOrganization: async (organizationId: number): Promise<Geofence[]> => {
        console.warn("getByOrganization is deprecated on frontend without organization context, use getByAdminId");
        return [];
    },

    getByAdminId: async (adminId: number): Promise<Geofence[]> => {
        // Strategy: Get all geofences and filter by the admin's fleet managers.
        // 1. Get managers for admin
        const managers = await fleetManagerApi.getByAdminId(adminId);
        const managerIds = new Set(managers.map(m => m.managerId));

        // 2. Get all geofences (since no filter endpoint exists yet)
        // Optimization: Use getAll()
        const allGeofences = await geofenceApi.getAll();

        // 3. Filter
        // GeofenceDTO has 'fleetManagerId'
        return allGeofences.filter((g: any) => managerIds.has(g.fleetManagerId));
    },

    countByOrganization: async (organizationId: number): Promise<number> => {
        return 0;
    },

    countByAdminId: async (adminId: number): Promise<number> => {
        const geofences = await geofenceApi.getByAdminId(adminId);
        return geofences.length;
    },
};

// VehicleGeofence endpoints from VehicleGeofenceController - Base path: /vehicle-geofences

export const vehicleGeofenceApi = {
    assignVehicleToGeofence: async (vehicleId: number, geofenceId: number): Promise<void> => {
        await apiClient.post(`/vehicle-geofences/vehicle/${vehicleId}/geofence/${geofenceId}`);
    },

    removeVehicleFromGeofence: async (vehicleId: number, geofenceId: number): Promise<void> => {
        await apiClient.delete(`/vehicle-geofences/vehicle/${vehicleId}/geofence/${geofenceId}`);
    },

    getGeofencesByVehicleId: async (vehicleId: number): Promise<Geofence[]> => {
        const response = await apiClient.get<Geofence[]>(`/vehicle-geofences/vehicle/${vehicleId}/geofences`);
        return response.data;
    },

    getVehiclesByGeofenceId: async (geofenceId: number): Promise<number[]> => {
        const response = await apiClient.get<number[]>(`/vehicle-geofences/geofence/${geofenceId}/vehicles`);
        return response.data;
    },

    checkVehicleInGeofence: async (vehicleId: number, geofenceId: number): Promise<boolean> => {
        const response = await apiClient.get<boolean>(`/vehicle-geofences/check/vehicle/${vehicleId}/geofence/${geofenceId}`);
        return response.data;
    },
};

export default geofenceApi;
