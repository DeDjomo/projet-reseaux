import apiClient from '@/lib/axios';
import { DriverVehicle, DriverVehicleCreate, DriverVehicleUpdate } from '@/types/driverVehicle';
import { AssignmentState } from '@/types/enums';

// Base path: /driver-vehicles

export const driverVehicleApi = {
    /**
     * Get all driver-vehicle assignments
     */
    getAll: async (): Promise<DriverVehicle[]> => {
        const response = await apiClient.get('/driver-vehicles');
        return response.data;
    },

    /**
     * Get assignment by ID
     */
    getById: async (id: number): Promise<DriverVehicle> => {
        const response = await apiClient.get(`/driver-vehicles/${id}`);
        return response.data;
    },

    /**
     * Get all assignments for a specific driver
     */
    getByDriver: async (driverId: number): Promise<DriverVehicle[]> => {
        const response = await apiClient.get(`/driver-vehicles/driver/${driverId}`);
        return response.data;
    },

    /**
     * Get all assignments for a specific vehicle
     */
    getByVehicle: async (vehicleId: number): Promise<DriverVehicle[]> => {
        const response = await apiClient.get(`/driver-vehicles/vehicle/${vehicleId}`);
        return response.data;
    },

    /**
     * Get active assignments for a driver
     */
    getActiveByDriver: async (driverId: number): Promise<DriverVehicle[]> => {
        const response = await apiClient.get(`/driver-vehicles/driver/${driverId}/active`);
        return response.data;
    },

    /**
     * Get active assignments for a vehicle
     */
    getActiveByVehicle: async (vehicleId: number): Promise<DriverVehicle[]> => {
        const response = await apiClient.get(`/driver-vehicles/vehicle/${vehicleId}/active`);
        return response.data;
    },

    /**
     * Get assignments by state
     */
    getByState: async (state: AssignmentState): Promise<DriverVehicle[]> => {
        const response = await apiClient.get(`/driver-vehicles/state/${state}`);
        return response.data;
    },

    /**
     * Create a new driver-vehicle assignment
     */
    create: async (data: DriverVehicleCreate): Promise<DriverVehicle> => {
        const response = await apiClient.post('/driver-vehicles', data);
        return response.data;
    },

    /**
     * Update an assignment
     */
    update: async (id: number, data: DriverVehicleUpdate): Promise<DriverVehicle> => {
        const response = await apiClient.put(`/driver-vehicles/${id}`, data);
        return response.data;
    },

    /**
     * Terminate an assignment (set state to TERMINATED and endDate to now)
     */
    terminate: async (id: number): Promise<DriverVehicle> => {
        const response = await apiClient.patch(`/driver-vehicles/${id}/terminate`, {});
        return response.data;
    },

    /**
     * Delete an assignment permanently
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/driver-vehicles/${id}`);
    },

    /**
     * Count assignments by state
     */
    countByState: async (state: AssignmentState): Promise<number> => {
        const response = await apiClient.get(`/driver-vehicles/count/state/${state}`);
        return response.data;
    },
};

export default driverVehicleApi;
