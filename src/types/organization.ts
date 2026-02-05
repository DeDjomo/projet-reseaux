import { OrganizationType, SubscriptionPlan } from './enums';

// Organization DTOs

export interface Organization {
    organizationId: number;
    organizationName: string;
    organizationDomainName: string;
    organizationPhone: string;
    organizationAddress: string;
    organizationCity: string;
    organizationCountry: string;
    logoUrl: string;
    organizationType: OrganizationType;
    registrationNumber: string;
    taxId: string;
    organizationUIN: string;
    isActive: boolean;
    subscriptionPlan: SubscriptionPlan;
    subscriptionExpiry: string;
    createdAt: string;
    createdByAdminId?: number;
}

export interface OrganizationCreate {
    organizationName: string;
    organizationDomainName?: string;
    organizationPhone: string;
    organizationAddress: string;
    organizationCity: string;
    organizationCountry: string;
    organizationType: OrganizationType;
    registrationNumber: string;
    taxId?: string;
    organizationUIN: string;
    organizationLogo?: string;
    subscriptionPlan: SubscriptionPlan;
    createdByAdminId: number;
}

export interface OrganizationUpdate {
    organizationName?: string;
    organizationDomainName?: string;
    organizationPhone?: string;
    organizationAddress?: string;
    organizationCity?: string;
    organizationCountry?: string;
    organizationType?: OrganizationType;
    organizationLogo?: string;
    registrationNumber?: string;
    taxId?: string;
    organizationUIN?: string;
    subscriptionPlan?: SubscriptionPlan;
    isActive?: boolean;
    createdByAdminId?: number;
}
