import { FuelType, VehicleState, VehicleType } from './enums';

// Vehicle DTOs

export interface Vehicle {
    vehicleId: number;
    vehicleIdentificationNumber: string;
    vehicleMake: string;
    vehicleRegistrationNumber: string;
    vehicleModel: string;
    vehicleDocument: string;
    vehicleDeviceIdAddress: string;
    fuelLevel: number;
    fuelType: FuelType;
    numberOfPassengers: number;
    speed: number;
    state: VehicleState;
    type: VehicleType;
    fleetId: number;
    driverId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleCreate {
    vehicleIdentificationNumber: string;
    vehicleMake: string;
    vehicleRegistrationNumber: string;
    vehicleModel: string;
    vehicleDocument?: string;
    vehicleDeviceIdAddress?: string;
    fuelLevel?: number;
    fuelType: FuelType;
    numberOfPassengers?: number;
    state: VehicleState;
    type: VehicleType;
    fleetId: number;
}

export interface VehicleUpdate {
    vehicleIdentificationNumber?: string;
    vehicleMake?: string;
    vehicleRegistrationNumber?: string;
    vehicleModel?: string;
    vehicleDocument?: string;
    vehicleDeviceIdAddress?: string;
    fuelLevel?: number;
    fuelType?: FuelType;
    numberOfPassengers?: number;
    state?: VehicleState;
    type?: VehicleType;
    driverId?: number | null;
}
