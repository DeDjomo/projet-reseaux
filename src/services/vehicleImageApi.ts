import apiClient from '@/lib/axios';

// VehicleImage endpoints from VehicleImageController - Base path: /vehicle-images

import { VehicleImage, VehicleImageCreate } from '@/types';

// VehicleImage endpoints from VehicleImageController - Base path: /vehicle-images

export const vehicleImageApi = {
    // CRUD Operations
    create: async (image: VehicleImageCreate): Promise<VehicleImage> => {
        const response = await apiClient.post<VehicleImage>('/vehicle-images', image);
        return response.data;
    },

    getById: async (imageId: number): Promise<VehicleImage> => {
        const response = await apiClient.get<VehicleImage>(`/vehicle-images/${imageId}`);
        return response.data;
    },

    getByVehicleId: async (vehicleId: number): Promise<VehicleImage[]> => {
        const response = await apiClient.get<VehicleImage[]>(`/vehicle-images/vehicle/${vehicleId}`);
        return response.data;
    },

    // Alias for component compatibility
    getImagesByVehicle: async (vehicleId: number): Promise<VehicleImage[]> => {
        return vehicleImageApi.getByVehicleId(vehicleId);
    },

    delete: async (imageId: number): Promise<void> => {
        await apiClient.delete(`/vehicle-images/${imageId}`);
    },

    // Alias for component compatibility
    deleteImage: async (imageId: number): Promise<void> => {
        return vehicleImageApi.delete(imageId);
    },

    deleteAllByVehicleId: async (vehicleId: number): Promise<void> => {
        await apiClient.delete(`/vehicle-images/vehicle/${vehicleId}`);
    },

    uploadImage: async (vehicleId: number, file: File): Promise<VehicleImage> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<VehicleImage>(`/vehicle-images/${vehicleId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default vehicleImageApi;
