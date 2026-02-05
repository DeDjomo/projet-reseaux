import apiClient from '@/lib/axios';
import { Organization, OrganizationCreate, OrganizationUpdate, OrganizationType, SubscriptionPlan, Fleet, Driver, Trip, Incident, Maintenance, FleetManager, Admin, Vehicle } from '@/types';
import { Geofence } from '@/types/geofence';

// Organization endpoints from OrganizationController - Base path: /organizations

export const organizationApi = {
    // CRUD Operations
    create: async (organization: OrganizationCreate): Promise<Organization> => {
        const response = await apiClient.post<Organization>('/organizations', organization);
        return response.data;
    },

    getById: async (organizationId: number): Promise<Organization> => {
        const response = await apiClient.get<Organization>(`/organizations/${organizationId}`);
        return response.data;
    },

    getAll: async (): Promise<Organization[]> => {
        const response = await apiClient.get<Organization[]>('/organizations');
        return response.data;
    },

    getByType: async (type: OrganizationType): Promise<Organization[]> => {
        const response = await apiClient.get<Organization[]>(`/organizations/type/${type}`);
        return response.data;
    },

    getBySubscription: async (plan: SubscriptionPlan): Promise<Organization[]> => {
        const response = await apiClient.get<Organization[]>(`/organizations/subscription/${plan}`);
        return response.data;
    },

    update: async (organizationId: number, organization: OrganizationUpdate): Promise<Organization> => {
        const response = await apiClient.put<Organization>(`/organizations/${organizationId}`, organization);
        return response.data;
    },

    updateSubscriptionPlan: async (organizationId: number, plan: SubscriptionPlan): Promise<Organization> => {
        const response = await apiClient.patch<Organization>(`/organizations/${organizationId}/subscription`, null, {
            params: { plan }
        });
        return response.data;
    },

    delete: async (organizationId: number): Promise<void> => {
        await apiClient.delete(`/organizations/${organizationId}`);
    },

    // Logo Operations
    uploadLogo: async (organizationId: number, file: File): Promise<Organization> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<Organization>(`/organizations/${organizationId}/logo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteLogo: async (organizationId: number): Promise<Organization> => {
        const response = await apiClient.delete<Organization>(`/organizations/${organizationId}/logo`);
        return response.data;
    },

    // Count Operations
    count: async (): Promise<number> => {
        const response = await apiClient.get<number>('/organizations/count');
        return response.data;
    },

    countDeleted: async (): Promise<number> => {
        const response = await apiClient.get<number>('/organizations/count/deleted');
        return response.data;
    },

    countByPlan: async (plan: SubscriptionPlan): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/count/subscription/${plan}`);
        return response.data;
    },

    // ========== ORGANIZATION RESOURCES ==========

    // Fleets
    getFleets: async (organizationId: number): Promise<Fleet[]> => {
        const response = await apiClient.get<Fleet[]>(`/organizations/${organizationId}/fleets`);
        return response.data;
    },

    countFleets: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/fleets/count`);
        return response.data;
    },

    // Vehicles
    getVehicles: async (organizationId: number): Promise<Vehicle[]> => {
        const response = await apiClient.get<Vehicle[]>(`/organizations/${organizationId}/vehicles`);
        return response.data;
    },

    countVehicles: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/vehicles/count`);
        return response.data;
    },

    // Drivers
    getDrivers: async (organizationId: number): Promise<Driver[]> => {
        const response = await apiClient.get<Driver[]>(`/organizations/${organizationId}/drivers`);
        return response.data;
    },

    countDrivers: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/drivers/count`);
        return response.data;
    },

    // Trips
    getTrips: async (organizationId: number): Promise<Trip[]> => {
        const response = await apiClient.get<Trip[]>(`/organizations/${organizationId}/trips`);
        return response.data;
    },

    countTrips: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/trips/count`);
        return response.data;
    },

    // Incidents
    getIncidents: async (organizationId: number): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>(`/organizations/${organizationId}/incidents`);
        return response.data;
    },

    countIncidents: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/incidents/count`);
        return response.data;
    },

    // Maintenances
    getMaintenances: async (organizationId: number): Promise<Maintenance[]> => {
        const response = await apiClient.get<Maintenance[]>(`/organizations/${organizationId}/maintenances`);
        return response.data;
    },

    countMaintenances: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/maintenances/count`);
        return response.data;
    },

    // Geofences
    getGeofences: async (organizationId: number): Promise<Geofence[]> => {
        const response = await apiClient.get<Geofence[]>(`/organizations/${organizationId}/geofences`);
        return response.data;
    },

    countGeofences: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/geofences/count`);
        return response.data;
    },

    // Fleet Managers
    getFleetManagers: async (organizationId: number): Promise<FleetManager[]> => {
        const response = await apiClient.get<FleetManager[]>(`/organizations/${organizationId}/fleet-managers`);
        return response.data;
    },

    countFleetManagers: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/fleet-managers/count`);
        return response.data;
    },

    // Admins
    getAdmins: async (organizationId: number): Promise<Admin[]> => {
        const response = await apiClient.get<Admin[]>(`/organizations/${organizationId}/admins`);
        return response.data;
    },

    countAdmins: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/admins/count`);
        return response.data;
    },

    // Members (total count)
    countMembers: async (organizationId: number): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/${organizationId}/members/count`);
        return response.data;
    },

    // Creator
    getCreator: async (organizationId: number): Promise<Admin> => {
        const response = await apiClient.get<Admin>(`/organizations/${organizationId}/creator`);
        return response.data;
    },
};

export default organizationApi;
