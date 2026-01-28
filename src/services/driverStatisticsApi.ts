import apiClient from '@/lib/axios';

// DriverStatistics endpoints from DriverStatisticsController - Base path: /driver-statistics

interface DriverStatistics {
    statisticsId: number;
    driverId: number;
    driverName: string;
    fleetManagerId: number;
    periodStart: string;
    periodEnd: string;
    totalTrips: number;
    totalDistance: number;
    totalDrivingTime: number;
    averageSpeed: number;
    fuelConsumption: number;
    incidentCount: number;
    safetyScore: number;
    efficiencyScore: number;
    overallRating: number;
    createdAt: string;
    updatedAt: string;
}

interface DriverStatisticsCreate {
    driverId: number;
    fleetManagerId: number;
    periodStart: string;
    periodEnd: string;
    totalTrips?: number;
    totalDistance?: number;
    totalDrivingTime?: number;
    averageSpeed?: number;
    fuelConsumption?: number;
    incidentCount?: number;
    safetyScore?: number;
    efficiencyScore?: number;
    overallRating?: number;
}

export const driverStatisticsApi = {
    // CRUD Operations
    create: async (statistics: DriverStatisticsCreate): Promise<DriverStatistics> => {
        const response = await apiClient.post<DriverStatistics>('/driver-statistics', statistics);
        return response.data;
    },

    getById: async (statisticsId: number): Promise<DriverStatistics> => {
        const response = await apiClient.get<DriverStatistics>(`/driver-statistics/${statisticsId}`);
        return response.data;
    },

    getAll: async (): Promise<DriverStatistics[]> => {
        const response = await apiClient.get<DriverStatistics[]>('/driver-statistics');
        return response.data;
    },

    getByDriverId: async (driverId: number): Promise<DriverStatistics[]> => {
        const response = await apiClient.get<DriverStatistics[]>(`/driver-statistics/driver/${driverId}`);
        return response.data;
    },

    getByFleetManagerId: async (fleetManagerId: number): Promise<DriverStatistics[]> => {
        const response = await apiClient.get<DriverStatistics[]>(`/driver-statistics/fleet-manager/${fleetManagerId}`);
        return response.data;
    },

    getByPeriod: async (driverId: number, periodStart: string, periodEnd: string): Promise<DriverStatistics[]> => {
        const response = await apiClient.get<DriverStatistics[]>(`/driver-statistics/driver/${driverId}/period`, {
            params: { periodStart, periodEnd }
        });
        return response.data;
    },

    getLatestByDriverId: async (driverId: number): Promise<DriverStatistics> => {
        const response = await apiClient.get<DriverStatistics>(`/driver-statistics/driver/${driverId}/latest`);
        return response.data;
    },

    update: async (statisticsId: number, statistics: Partial<DriverStatisticsCreate>): Promise<DriverStatistics> => {
        const response = await apiClient.put<DriverStatistics>(`/driver-statistics/${statisticsId}`, statistics);
        return response.data;
    },

    delete: async (statisticsId: number): Promise<void> => {
        await apiClient.delete(`/driver-statistics/${statisticsId}`);
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/driver-statistics/count');
        return response.data;
    },
};

export default driverStatisticsApi;
