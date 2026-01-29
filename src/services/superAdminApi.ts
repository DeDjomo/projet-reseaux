import apiClient from '@/lib/axios';

/**
 * Super Admin API - Global platform statistics and management
 * These endpoints are available for SUPER_ADMIN users only
 */
export const superAdminApi = {
    // ========== GLOBAL COUNTS ==========

    getOrganizationsCount: async (): Promise<number> => {
        const response = await apiClient.get<number>('/organizations/count');
        return response.data;
    },

    getAdminsCount: async (): Promise<number> => {
        const response = await apiClient.get<number>('/admins/count');
        return response.data;
    },

    getFleetsCount: async (): Promise<number> => {
        const response = await apiClient.get<number>('/fleets/count');
        return response.data;
    },

    getVehiclesCount: async (): Promise<number> => {
        const response = await apiClient.get<number>('/vehicles/count');
        return response.data;
    },

    getFleetManagersCount: async (): Promise<number> => {
        const response = await apiClient.get<number>('/fleet-managers/count');
        return response.data;
    },

    getGeofencesCount: async (): Promise<number> => {
        const response = await apiClient.get<number>('/geofences/count');
        return response.data;
    },

    getIncidentsCount: async (): Promise<number> => {
        const response = await apiClient.get<number>('/incidents/count');
        return response.data;
    },

    // ========== SUBSCRIPTION STATS ==========

    getOrganizationsCountByPlan: async (plan: string): Promise<number> => {
        const response = await apiClient.get<number>(`/organizations/count/subscription/${plan}`);
        return response.data;
    },

    // ========== DASHBOARD AGGREGATED DATA ==========

    /**
     * Get all dashboard statistics in one call
     * This reduces the number of API calls needed
     */
    getDashboardStats: async (): Promise<{
        organizations: number;
        admins: number;
        fleets: number;
        vehicles: number;
        fleetManagers: number;
        geofences: number;
        incidents: number;
        subscriptionCounts: {
            FREE: number;
            BASIC: number;
            PROFESSIONAL: number;
            ENTERPRISE: number;
        };
    }> => {
        // Make all API calls in parallel
        const [
            organizations,
            admins,
            fleets,
            vehicles,
            fleetManagers,
            geofences,
            incidents,
            freePlan,
            basicPlan,
            proPlan,
            enterprisePlan
        ] = await Promise.all([
            apiClient.get<number>('/organizations/count').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/admins/count').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/fleets/count').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/vehicles/count').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/fleet-managers/count').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/geofences/count').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/incidents/count').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/organizations/count/subscription/FREE').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/organizations/count/subscription/BASIC').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/organizations/count/subscription/PROFESSIONAL').then(r => r.data).catch(() => 0),
            apiClient.get<number>('/organizations/count/subscription/ENTERPRISE').then(r => r.data).catch(() => 0),
        ]);

        return {
            organizations,
            admins,
            fleets,
            vehicles,
            fleetManagers,
            geofences,
            incidents,
            subscriptionCounts: {
                FREE: freePlan,
                BASIC: basicPlan,
                PROFESSIONAL: proPlan,
                ENTERPRISE: enterprisePlan,
            }
        };
    }
};

export default superAdminApi;
