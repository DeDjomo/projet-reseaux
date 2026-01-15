import { FleetType } from './enums';

// Fleet DTOs - Matching backend FleetDTO

export interface Fleet {
    fleetId: number;
    fleetName: string;
    fleetDescription: string;
    fleetType: FleetType;
    fleetManagerId?: number;
    fleetManagerName?: string;
    vehiclesCount?: number;
}

export interface FleetCreate {
    fleetName: string;
    fleetDescription?: string;
    fleetType: FleetType;
}

export interface FleetUpdate {
    fleetName?: string;
    fleetDescription?: string;
    fleetType?: FleetType;
}
