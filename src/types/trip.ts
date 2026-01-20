import { TripStatus } from './enums';

// Trip DTOs

export interface Trip {
    tripId: number;
    tripReference: string;
    departureDateTime: string;
    arrivalDateTime: string | null;
    plannedDistance: number;
    actualDistance: number;
    status: TripStatus;
    vehicleId: number;
    vehicleName?: string;
    vehicleRegistrationNumber?: string;
    driverId: number;
    driverName?: string;
}

export interface TripCreate {
    tripReference: string;
    departureDateTime: string;
    plannedDistance: number;
    vehicleId: number;
    driverId: number;
}

export interface TripUpdate {
    arrivalDateTime?: string;
    actualDistance?: number;
    status?: TripStatus;
}

// Position DTOs (matches backend PositionDTO)

export interface Position {
    positionId: number;
    latitude: number;
    longitude: number;
    positionDateTime: string;
    speed: number | null;
    heading: number | null;
    accuracy: number | null;
    isTripStart?: boolean;
    isTripEnd?: boolean;
    vehicleId: number;
    vehicleName: string | null;
}

export interface PositionCreate {
    latitude: number;
    longitude: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    vehicleId: number;
}
