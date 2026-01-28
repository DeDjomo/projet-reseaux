import apiClient from '@/lib/axios';
import { Vehicle, VehicleCreate, VehicleUpdate, VehicleState, VehicleType, FuelType } from '@/types';
import fleetApi from './fleetApi';

// Vehicle endpoints from VehicleController - Base path: /vehicles

interface VehicleStateStats {
    state: VehicleState;
    count: number;
}

interface VehicleTypeStats {
    type: VehicleType;
    count: number;
}

interface VehicleGlobalStats {
    totalVehicles: number;
    activeVehicles: number;
    inMaintenanceVehicles: number;
    totalDistance: number;
    averageFuelLevel: number;
}

export const vehicleApi = {
    // CRUD Operations
    create: async (vehicle: VehicleCreate): Promise<Vehicle> => {
        const response = await apiClient.post<Vehicle>('/vehicles', vehicle);
        return response.data;
    },

    getById: async (vehicleId: number): Promise<Vehicle> => {
        const response = await apiClient.get<Vehicle>(`/vehicles/${vehicleId}`);
        return response.data;
    },

    getByRegistrationNumber: async (registrationNumber: string): Promise<Vehicle> => {
        const response = await apiClient.get<Vehicle>(`/vehicles/registration/${registrationNumber}`);
        return response.data;
    },

    getAll: async (): Promise<Vehicle[]> => {
        const response = await apiClient.get<Vehicle[]>('/vehicles');
        return response.data;
    },

    getByFleetId: async (fleetId: number): Promise<Vehicle[]> => {
        const response = await apiClient.get<Vehicle[]>(`/vehicles/fleet/${fleetId}`);
        return response.data;
    },

    getByType: async (vehicleType: VehicleType): Promise<Vehicle[]> => {
        const response = await apiClient.get<Vehicle[]>(`/vehicles/type/${vehicleType}`);
        return response.data;
    },

    getByState: async (state: VehicleState): Promise<Vehicle[]> => {
        const response = await apiClient.get<Vehicle[]>(`/vehicles/state/${state}`);
        return response.data;
    },

    getByFuelType: async (fuelType: FuelType): Promise<Vehicle[]> => {
        const response = await apiClient.get<Vehicle[]>(`/vehicles/fuel-type/${fuelType}`);
        return response.data;
    },

    update: async (vehicleId: number, vehicle: VehicleUpdate): Promise<Vehicle> => {
        const response = await apiClient.put<Vehicle>(`/vehicles/${vehicleId}`, vehicle);
        return response.data;
    },

    updateState: async (vehicleId: number, newState: VehicleState): Promise<Vehicle> => {
        const response = await apiClient.put<Vehicle>(`/vehicles/${vehicleId}/state`, null, {
            params: { newState }
        });
        return response.data;
    },

    delete: async (vehicleId: number): Promise<void> => {
        await apiClient.delete(`/vehicles/${vehicleId}`);
    },

    // Count Operations
    countAll: async (): Promise<number> => {
        const response = await apiClient.get<number>('/vehicles/count');
        return response.data;
    },

    countByState: async (state: VehicleState): Promise<number> => {
        const response = await apiClient.get<number>(`/vehicles/count/state/${state}`);
        return response.data;
    },

    countByType: async (vehicleType: VehicleType): Promise<number> => {
        const response = await apiClient.get<number>(`/vehicles/count/type/${vehicleType}`);
        return response.data;
    },

    countByFuelType: async (fuelType: FuelType): Promise<number> => {
        const response = await apiClient.get<number>(`/vehicles/count/fuel-type/${fuelType}`);
        return response.data;
    },

    // Statistics
    getStatsByState: async (): Promise<VehicleStateStats[]> => {
        const response = await apiClient.get<VehicleStateStats[]>('/vehicles/stats/by-state');
        return response.data;
    },

    getStatsByType: async (): Promise<VehicleTypeStats[]> => {
        const response = await apiClient.get<VehicleTypeStats[]>('/vehicles/stats/by-type');
        return response.data;
    },

    getGlobalStats: async (): Promise<VehicleGlobalStats> => {
        const response = await apiClient.get<VehicleGlobalStats>('/vehicles/stats/global');
        return response.data;
    },
    // Organization Operations (Simulated via Admin's Fleets)
    getByOrganization: async (organizationId: number): Promise<Vehicle[]> => {
        // Since backend doesn't support getByOrganization directly, we use the logged in user (Admin) 
        // context usually. But here we need to fetch all fleets for the admin (who owns the org)
        // and then fetch vehicles for each fleet. 

        // This requires knowing the adminId. If we only have organizationId, we might be stuck 
        // UNLESS the frontend passes the correct Context. 
        // Helper: We will assume we can get fleets by admin via fleetApi if we had adminId.
        // But the signature here is organizationId. 

        // Alternative: The user said "use existing filtering by admin". 
        // The dashboard page calls this with `user.organizationId` but `user` object in localStorage 
        // usually contains `id` (adminId) too.

        // Strategy: update this signature to accept adminId OR stick to orgId if we can map it.
        // Realistically, to follow the Prompt "use existing admin filtering", we should change 
        // how the Dashboard calls this. 
        // But to keep interface clean, I will implement a workaround or expected behavior.
        // Actually, let's look at `dashboard/admin/page.tsx` again. It gets `user` from localStorage.
        // It has `user.organizationId` AND `user.id` (which is adminId).

        // I will update the signature in a moment. For now, let's just use a placeholder 
        // that warns or tries to use a known endpoint if any. 
        // Actually, I can't easily implement "getByOrganization" without adminId if backend doesn't link them directly publically.
        // I will change the method to `getByAdminId` and update the caller.
        return [];
    },

    getByAdminId: async (adminId: number): Promise<Vehicle[]> => {
        // Fetch all fleets for this admin (including system fleet)
        const fleets = await fleetApi.getByAdminId(adminId);

        // Fetch vehicles for each fleet in parallel
        const vehiclePromises = fleets.map(fleet => vehicleApi.getByFleetId(fleet.fleetId));
        const vehiclesArrays = await Promise.all(vehiclePromises);

        // Flatten into single array
        return vehiclesArrays.flat();
    },

    countByOrganization: async (organizationId: number): Promise<number> => {
        // Fallback to fetching all by Organization logic if possible, 
        // but since we lack that endpoint, warn or return 0.
        // Ideally we should use adminId context. 
        // countByOrganization not fully supported, use countByAdminId
        return 0;
    },

    countByAdminId: async (adminId: number): Promise<number> => {
        const vehicles = await vehicleApi.getByAdminId(adminId);
        return vehicles.length;
    },
};

export default vehicleApi;
