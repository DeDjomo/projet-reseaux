import apiClient from '@/lib/axios';
import { Trip, TripCreate, TripUpdate } from '@/types';

// Trip endpoints from TripController - Base path: /trips

export const tripApi = {
    // CRUD Operations
    create: async (trip: TripCreate): Promise<Trip> => {
        const response = await apiClient.post<Trip>('/trips', trip);
        return response.data;
    },

    getById: async (tripId: number): Promise<Trip> => {
        const response = await apiClient.get<Trip>(`/trips/${tripId}`);
        return response.data;
    },

    getAll: async (): Promise<Trip[]> => {
        const response = await apiClient.get<Trip[]>('/trips');
        return response.data;
    },

    getByVehicleId: async (vehicleId: number): Promise<Trip[]> => {
        const response = await apiClient.get<Trip[]>(`/trips/vehicle/${vehicleId}`);
        return response.data;
    },

    getByDriverId: async (driverId: number): Promise<Trip[]> => {
        const response = await apiClient.get<Trip[]>(`/trips/driver/${driverId}`);
        return response.data;
    },

    getOngoing: async (): Promise<Trip[]> => {
        const response = await apiClient.get<Trip[]>('/trips/ongoing');
        return response.data;
    },

    update: async (tripId: number, trip: TripUpdate): Promise<Trip> => {
        const response = await apiClient.put<Trip>(`/trips/${tripId}`, trip);
        return response.data;
    },

    delete: async (tripId: number): Promise<void> => {
        await apiClient.delete(`/trips/${tripId}`);
    },
};

export default tripApi;
