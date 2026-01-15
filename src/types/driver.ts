import { DriverState } from './enums';

// Driver DTOs

export interface Driver {
    driverId: number;
    driverLastName: string;
    driverFirstName: string;
    driverEmail: string;
    driverPhoneNumber: string;
    driverEmergencyContactName: string;
    driverEmergencyContactPhone: string;
    driverPersonalInformation: string;
    driverLicenseNumber: string;
    driverLicenseExpiryDate: string; // ISO date string
    driverState: DriverState;
    createdAt: string;
    updatedAt: string;
}

export interface DriverCreate {
    driverLastName: string;
    driverFirstName: string;
    driverEmail: string;
    driverPhoneNumber: string;
    driverPassword: string;
    driverEmergencyContactName?: string;
    driverEmergencyContactPhone?: string;
    driverPersonalInformation?: string;
    driverLicenseNumber?: string;
    driverLicenseExpiryDate?: string;
}

export interface DriverUpdate {
    driverLastName?: string;
    driverFirstName?: string;
    driverEmail?: string;
    driverPhoneNumber?: string;
    driverEmergencyContactName?: string;
    driverEmergencyContactPhone?: string;
    driverPersonalInformation?: string;
    driverLicenseNumber?: string;
    driverLicenseExpiryDate?: string;
    driverState?: DriverState;
}
