export type VehicleGeofenceState = 'ACTIVE' | 'INACTIVE';

export interface VehicleGeofence {
    vehicleGeofenceId: number;
    vehicleId: number;
    geofenceId: number;

    // Flattened info from DTO
    vehicleRegistration?: string;
    vehicleName?: string;
    geofenceName?: string;

    assignmentState: VehicleGeofenceState;
    assignedAt: string; // ISO Date
    deactivatedAt?: string; // ISO Date
    notes?: string;
}

export interface VehicleGeofenceCreate {
    vehicleId: number;
    geofenceId: number;
    notes?: string;
}

export interface VehicleGeofenceUpdate {
    notes: string;
}
