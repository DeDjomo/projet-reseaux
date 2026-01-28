// Enums from backend

export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ORGANIZATION_MANAGER = 'ORGANIZATION_MANAGER',
}

export enum DriverState {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    ON_LEAVE = 'ON_LEAVE',
}

export enum FleetType {
    PERSONAL = 'PERSONAL',
    PASSENGER_TRANSPORT = 'PASSENGER_TRANSPORT',
    CARGO_TRANSPORT = 'CARGO_TRANSPORT',
    MIXED = 'MIXED',
    OTHER = 'OTHER',
    RENTAL = 'RENTAL',
    DELIVERY = 'DELIVERY',
}

export enum FuelType {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    ELECTRIC = 'ELECTRIC',
    HYBRID = 'HYBRID',
    PLUG_IN_HYBRID = 'PLUG_IN_HYBRID',
    LPG = 'LPG',
    CNG = 'CNG',
    HYDROGEN = 'HYDROGEN',
    BIODIESEL = 'BIODIESEL',
    BIOETHANOL = 'BIOETHANOL',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

export enum Language {
    FR = 'FR',
    ENG = 'ENG',
}

export enum GeofenceType {
    CIRCLE = 'CIRCLE',
    POLYGON = 'POLYGON',
    RECTANGLE = 'RECTANGLE',
}

export enum IncidentSeverity {
    MINOR = 'MINOR',
    MODERATE = 'MODERATE',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
    REPORTED = 'REPORTED',
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
    PENDING_INSURANCE = 'PENDING_INSURANCE',
}

export enum IncidentType {
    ACCIDENT = 'ACCIDENT',
    BREAKDOWN = 'BREAKDOWN',
    THEFT = 'THEFT',
    TRAFFIC_VIOLATION = 'TRAFFIC_VIOLATION',
    WEATHER = 'WEATHER',
    OTHER = 'OTHER',
}

export enum NotificationType {
    MAINTENANCE_DUE = 'MAINTENANCE_DUE',
    LICENSE_EXPIRING = 'LICENSE_EXPIRING',
    GEOFENCE_ALERT = 'GEOFENCE_ALERT',
    SPEED_ALERT = 'SPEED_ALERT',
    FUEL_LOW = 'FUEL_LOW',
    INCIDENT = 'INCIDENT',
    TRIP_COMPLETED = 'TRIP_COMPLETED',
}

export enum OrganizationType {
    OTHER = 'OTHER',
    ASSOCIATION = 'ASSOCIATION',
    LLC = 'LLC',
    COOPERATIVE = 'COOPERATIVE',
    SA = 'SA',
    PUBLIC_ESTABLISHMENT = 'PUBLIC_ESTABLISHMENT',
    EIG = 'EIG',
}

export enum SubscriptionPlan {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PROFESSIONAL = 'PROFESSIONAL',
    ENTERPRISE = 'ENTERPRISE',
}

export enum TripStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum VehicleState {
    IN_SERVICE = 'IN_SERVICE',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',
    PARKED = 'PARKED',
    UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
    IN_ALARM = 'IN_ALARM',
}

export enum VehicleType {
    CAR = 'CAR',
    TRUCK = 'TRUCK',
    VAN = 'VAN',
    BUS = 'BUS',
    MOTORCYCLE = 'MOTORCYCLE',
    TRAILER = 'TRAILER',
}

export enum AssignmentState {
    ACTIVE = 'ACTIVE',
    TERMINATED = 'TERMINATED',
}
