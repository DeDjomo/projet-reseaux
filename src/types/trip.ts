import { TripStatus } from './enums';

// Trip DTOs

export interface Trip {
    tripId: number;
    tripStartTime: string;
    tripEndTime: string | null;
    tripStartLocation: string;
    tripEndLocation: string | null;
    tripDistance: number;
    tripStatus: TripStatus;
    vehicleId: number;
    driverId: number;
    createdAt: string;
    updatedAt: string;
}

export interface TripCreate {
    tripStartLocation: string;
    vehicleId: number;
    driverId: number;
}

export interface TripUpdate {
    tripEndLocation?: string;
    tripStatus?: TripStatus;
}

// Position DTOs

export interface Position {
    positionId: number;
    latitude: number;
    longitude: number;
    altitude: number | null;
    speed: number;
    heading: number | null;
    timestamp: string;
    vehicleId: number;
}

export interface PositionCreate {
    latitude: number;
    longitude: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    vehicleId: number;
}
