import apiClient from '@/lib/axios';
import { VehicleGeofence, VehicleGeofenceCreate, VehicleGeofenceUpdate } from '@/types/vehicleGeofence';
import { Vehicle } from '@/types';

// Endpoints for Vehicle-Geofence Association
const BASE_PATH = '/vehicle-geofences';

export const vehicleGeofenceApi = {
    // Create new association
    create: async (data: VehicleGeofenceCreate): Promise<VehicleGeofence> => {
        const response = await apiClient.post<VehicleGeofence>(BASE_PATH, data);
        return response.data;
    },

    // Get by ID
    getById: async (id: number): Promise<VehicleGeofence> => {
        const response = await apiClient.get<VehicleGeofence>(`${BASE_PATH}/${id}`);
        return response.data;
    },

    // Update notes - Backend expects raw string body
    updateNotes: async (id: number, notes: string): Promise<VehicleGeofence> => {
        const response = await apiClient.patch<VehicleGeofence>(`${BASE_PATH}/${id}/notes`, notes, {
            headers: { 'Content-Type': 'text/plain' } // Ensure it's treated as string body
        });
        return response.data;
    },

    // Activate
    activate: async (id: number): Promise<VehicleGeofence> => {
        const response = await apiClient.patch<VehicleGeofence>(`${BASE_PATH}/${id}/activate`);
        return response.data;
    },

    // Deactivate
    deactivate: async (id: number): Promise<VehicleGeofence> => {
        const response = await apiClient.patch<VehicleGeofence>(`${BASE_PATH}/${id}/deactivate`);
        return response.data;
    },

    // Delete
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE_PATH}/${id}`);
    },

    // --- By Vehicle ---

    // List all geofence associations for a vehicle
    getByVehicle: async (vehicleId: number): Promise<VehicleGeofence[]> => {
        const response = await apiClient.get<VehicleGeofence[]>(`${BASE_PATH}/vehicle/${vehicleId}`);
        return response.data;
    },

    // Count active geofences for a vehicle
    countActiveByVehicle: async (vehicleId: number): Promise<number> => {
        const response = await apiClient.get<number>(`${BASE_PATH}/vehicle/${vehicleId}/count`);
        return response.data;
    },

    // Get active associations
    getActiveByVehicle: async (vehicleId: number): Promise<VehicleGeofence[]> => {
        const response = await apiClient.get<VehicleGeofence[]>(`${BASE_PATH}/vehicle/${vehicleId}/active`);
        return response.data;
    },

    // --- By Geofence ---

    getByGeofence: async (geofenceId: number): Promise<VehicleGeofence[]> => {
        const response = await apiClient.get<VehicleGeofence[]>(`${BASE_PATH}/geofence/${geofenceId}`);
        return response.data;
    },

    countActiveByGeofence: async (geofenceId: number): Promise<number> => {
        const response = await apiClient.get<number>(`${BASE_PATH}/geofence/${geofenceId}/count`);
        return response.data;
    },

    getActiveByGeofence: async (geofenceId: number): Promise<VehicleGeofence[]> => {
        const response = await apiClient.get<VehicleGeofence[]>(`${BASE_PATH}/geofence/${geofenceId}/active`);
        return response.data;
    },

    // --- By State ---
    getByState: async (state: 'ACTIVE' | 'INACTIVE'): Promise<VehicleGeofence[]> => {
        const response = await apiClient.get<VehicleGeofence[]>(`${BASE_PATH}/state/${state}`);
        return response.data;
    }
};

export default vehicleGeofenceApi;
