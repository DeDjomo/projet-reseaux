import apiClient from '@/lib/axios';
import { FuelRecharge, FuelRechargeCreate, FuelRechargeUpdate } from '@/types';

// FuelRecharge endpoints from FuelRechargeController - Base path: /fuel-recharges

export const fuelRechargeApi = {
    // CRUD Operations
    create: async (fuelRecharge: FuelRechargeCreate): Promise<FuelRecharge> => {
        const response = await apiClient.post<FuelRecharge>('/fuel-recharges', fuelRecharge);
        return response.data;
    },

    getById: async (rechargeId: number): Promise<FuelRecharge> => {
        const response = await apiClient.get<FuelRecharge>(`/fuel-recharges/${rechargeId}`);
        return response.data;
    },

    getAll: async (): Promise<FuelRecharge[]> => {
        const response = await apiClient.get<FuelRecharge[]>('/fuel-recharges');
        return response.data;
    },

    getByVehicleId: async (vehicleId: number): Promise<FuelRecharge[]> => {
        const response = await apiClient.get<FuelRecharge[]>(`/fuel-recharges/vehicle/${vehicleId}`);
        return response.data;
    },

    getByDriverId: async (driverId: number): Promise<FuelRecharge[]> => {
        const response = await apiClient.get<FuelRecharge[]>(`/fuel-recharges/driver/${driverId}`);
        return response.data;
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<FuelRecharge[]> => {
        const response = await apiClient.get<FuelRecharge[]>('/fuel-recharges/date-range', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    update: async (rechargeId: number, fuelRecharge: FuelRechargeUpdate): Promise<FuelRecharge> => {
        const response = await apiClient.put<FuelRecharge>(`/fuel-recharges/${rechargeId}`, fuelRecharge);
        return response.data;
    },

    delete: async (rechargeId: number): Promise<void> => {
        await apiClient.delete(`/fuel-recharges/${rechargeId}`);
    },

    // Statistics
    getTotalCostByVehicleId: async (vehicleId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/fuel-recharges/cost/vehicle/${vehicleId}`);
        return response.data;
    },

    getTotalQuantityByVehicleId: async (vehicleId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/fuel-recharges/quantity/vehicle/${vehicleId}`);
        return response.data;
    },

    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/fuel-recharges/count');
        return response.data;
    },
};

export default fuelRechargeApi;
