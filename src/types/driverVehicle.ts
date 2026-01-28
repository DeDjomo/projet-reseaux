import { AssignmentState } from './enums';

// Driver-Vehicle Assignment DTOs

export interface DriverVehicle {
    assignmentId: number;
    driverId: number;
    driverFullName: string;
    vehicleId: number;
    vehicleRegistrationNumber: string;
    state: AssignmentState;
    startDate: string;
    endDate: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DriverVehicleCreate {
    driverId: number;
    vehicleId: number;
    startDate: string;
    endDate?: string;
    notes?: string;
}

export interface DriverVehicleUpdate {
    state?: AssignmentState;
    endDate?: string;
    notes?: string;
}
