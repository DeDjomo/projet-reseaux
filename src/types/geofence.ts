
import { GeofenceType } from './enums';

// Matches backend GeofenceStatus enum
export type GeofenceStatus = 'PARKING' | 'OPERATIONAL_ZONE' | 'RESTRICTED_ZONE';

// Matches backend GeofenceDTO
export interface Geofence {
    geofenceId: number;
    geofenceName: string;
    geofenceType: GeofenceType;
    geofenceStatus?: GeofenceStatus; // Added field
    perimeter?: number;
    area?: number;
    center?: any; // JTS Point serialized
    radius?: number;
    vertices?: any; // JTS LineString serialized
    fleetManagerId?: number;
    fleetManagerName?: string;
    vehiclesCount?: number;
}


// GeoJSON Point format expected by backend
export interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

// GeoJSON LineString format expected by backend
export interface GeoJSONLineString {
    type: 'LineString';
    coordinates: [number, number][]; // [[lon, lat], [lon, lat], ...]
}

export interface CircleGeofenceCreate {
    geofenceName: string;
    center: GeoJSONPoint;
    radius: number;
    geofenceStatus?: GeofenceStatus;
    fleetManagerId?: number;
}

export interface PolygonGeofenceCreate {
    geofenceName: string;
    vertices: GeoJSONLineString;
    geofenceStatus?: GeofenceStatus;
    fleetManagerId?: number;
}

export interface GeofenceUpdate {
    name?: string;
    description?: string;
    isActive?: boolean;
}
