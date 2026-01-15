import { AdminRole, Gender, Language, DriverState } from './enums';

// Admin DTOs

export interface Admin {
    adminId: number;
    adminEmail: string;
    adminFirstName: string;
    adminLastName: string;
    adminPhoneNumber: string;
    adminRole: AdminRole;
    adminIdCardNumber: string;
    personalAddress: string;
    personalCity: string;
    personalPostalCode: string;
    personalCountry: string;
    taxNumber: string;
    gender: Gender;
    niu: string;
    language: Language;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    organizationId?: number;
    organizationName?: string;
}

export interface AdminCreate {
    adminEmail: string;
    adminPassword: string;
    adminLastName: string;
    adminFirstName: string;
    adminPhoneNumber?: string;
    gender?: Gender;
    adminRole: AdminRole;
    adminIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

export interface AdminUpdate {
    adminEmail?: string;
    adminLastName?: string;
    adminFirstName?: string;
    adminPhoneNumber?: string;
    gender?: Gender;
    adminRole?: AdminRole;
    adminIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

// Fleet Manager DTOs - Matching backend FleetManagerDTO and FleetManagerCreateDTO
export interface FleetManager {
    managerId: number;
    managerFirstName: string;
    managerLastName: string;
    managerEmail: string;
    managerPhoneNumber: string;
    managerIdCardNumber: string;
    personalAddress: string;
    personalCity: string;
    personalPostalCode: string;
    personalCountry: string;
    taxNumber: string;
    gender: Gender;
    niu: string;
    language: Language;
    managerState: DriverState;
    adminId: number;
    adminName: string;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    fleetsCount: number;
}

export interface FleetManagerCreate {
    managerEmail: string;
    managerPassword: string;
    managerLastName: string;
    managerFirstName: string;
    managerPhoneNumber?: string;
    gender?: Gender;
    managerIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

export interface FleetManagerUpdate {
    managerLastName?: string;
    managerFirstName?: string;
    managerPhoneNumber?: string;
    gender?: Gender;
    managerIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}
