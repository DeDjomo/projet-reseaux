export interface DriverStatistics {
    totalDistance: number;
    totalDuration: number;
    averageSpeed: number;
    maxSpeed: number;
    tripsCount: number;
    id?: number; // Optional as it might be an aggregate
    driverId?: number;
    period?: string;
}

export interface DriverStatisticsDTO { // In case backend uses DTO suffix widely
    totalDistance: number;
    totalDuration: number;
    averageSpeed: number;
    maxSpeed: number;
    tripsCount: number;
}
