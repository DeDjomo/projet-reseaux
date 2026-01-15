import apiClient from '@/lib/axios';

// VehicleImage endpoints from VehicleImageController - Base path: /vehicle-images

interface VehicleImage {
    imageId: number;
    vehicleId: number;
    imageUrl: string;
    imageFile: string; // Base64 or content
    uploadedAt: string;
}

interface VehicleImageCreate {
    vehicleId: number;
    imageUrl?: string;
    imageFile?: string;
}

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

    delete: async (imageId: number): Promise<void> => {
        await apiClient.delete(`/vehicle-images/${imageId}`);
    },

    deleteAllByVehicleId: async (vehicleId: number): Promise<void> => {
        await apiClient.delete(`/vehicle-images/vehicle/${vehicleId}`);
    },
};

export default vehicleImageApi;
