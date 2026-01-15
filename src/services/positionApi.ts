import apiClient from '@/lib/axios';
import { Position, PositionCreate } from '@/types';

// Position endpoints from PositionController - Base path: /positions

export const positionApi = {
    // CRUD Operations
    create: async (position: PositionCreate): Promise<Position> => {
        const response = await apiClient.post<Position>('/positions', position);
        return response.data;
    },

    getById: async (positionId: number): Promise<Position> => {
        const response = await apiClient.get<Position>(`/positions/${positionId}`);
        return response.data;
    },

    getAll: async (): Promise<Position[]> => {
        const response = await apiClient.get<Position[]>('/positions');
        return response.data;
    },

    getByVehicleId: async (vehicleId: number): Promise<Position[]> => {
        const response = await apiClient.get<Position[]>(`/positions/vehicle/${vehicleId}`);
        return response.data;
    },

    getLatestByVehicleId: async (vehicleId: number): Promise<Position> => {
        const response = await apiClient.get<Position>(`/positions/vehicle/${vehicleId}/latest`);
        return response.data;
    },

    delete: async (positionId: number): Promise<void> => {
        await apiClient.delete(`/positions/${positionId}`);
    },
};

export default positionApi;
