import { NotificationType, IncidentType, IncidentSeverity, IncidentStatus, GeofenceType } from './enums';

// Notification DTOs

export interface Notification {
    notificationId: number;
    notificationSubject: string;
    notificationContent: string;
    notificationType: NotificationType;
    notificationState?: string; // e.g. "READ", "UNREAD" - handled as string in backend entity
    notificationDate: string;
    notificationTime: string;
    fleetManagerId: number;
}

export interface NotificationCreate {
    notificationSubject: string;
    notificationContent: string;
    notificationType: NotificationType;
    fleetManagerId: number;
}

// Incident DTOs

export interface Incident {
    incidentId: number;
    incidentTitle: string;
    incidentDescription: string;
    incidentType: IncidentType;
    incidentSeverity: IncidentSeverity;
    incidentStatus: IncidentStatus;
    incidentDate: string;
    vehicleId: number;
    driverId: number | null;
    reportedById: number;
    createdAt: string;
    updatedAt: string;
}

export interface IncidentCreate {
    incidentTitle: string;
    incidentDescription: string;
    incidentType: IncidentType;
    incidentSeverity: IncidentSeverity;
    incidentDate: string;
    vehicleId: number;
    driverId?: number;
    reportedById: number;
}

export interface IncidentUpdate {
    incidentTitle?: string;
    incidentDescription?: string;
    incidentType?: IncidentType;
    incidentSeverity?: IncidentSeverity;
    incidentStatus?: IncidentStatus;
    incidentDate?: string;
    driverId?: number;
}


// Geofence DTOs - MOVED to geofence.ts
// Interfaces removed to avoid duplicate identifier errors in index.ts re-exports


// Maintenance DTOs

export interface Maintenance {
    maintenanceId: number;
    maintenanceSubject: string;
    maintenanceReport?: string;
    maintenanceDateTime: string;
    maintenanceCost?: number;
    // No type or status fields in backend entity
    vehicleId: number;
    driverId?: number;
}

export interface MaintenanceCreate {
    maintenanceSubject: string;
    maintenanceReport?: string;
    maintenanceDateTime: string;
    maintenanceCost?: number;
    vehicleId: number;
    driverId?: number;
}

export interface MaintenanceUpdate {
    maintenanceSubject?: string;
    maintenanceReport?: string;
    maintenanceDateTime?: string;
    maintenanceCost?: number;
    vehicleId?: number;
    driverId?: number;
}

// Fuel Recharge DTOs

export interface FuelRecharge {
    fuelRechargeId: number;
    fuelAmount: number;
    fuelCost: number;
    fuelStation: string;
    rechargeDate: string;
    vehicleId: number;
    driverId: number;
    createdAt: string;
}

export interface FuelRechargeCreate {
    fuelAmount: number;
    fuelCost: number;
    fuelStation: string;
    rechargeDate: string;
    vehicleId: number;
    driverId: number;
}

export interface FuelRechargeUpdate {
    fuelAmount?: number;
    fuelCost?: number;
    fuelStation?: string;
    rechargeDate?: string;
    vehicleId?: number;
    driverId?: number;
}

// Statistics DTOs

export interface DriverStatistics {
    driverId: number;
    totalTrips: number;
    totalDistance: number;
    averageSpeed: number;
    totalFuelConsumption: number;
    incidentCount: number;
    safetyScore: number;
}

export interface FleetStatistics {
    fleetId: number;
    totalVehicles: number;
    activeVehicles: number;
    totalDrivers: number;
    activeDrivers: number;
    totalTripsToday: number;
    totalDistanceToday: number;
}
