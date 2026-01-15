"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Truck, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import vehicleApi from '@/services/vehicleApi';
import driverApi from '@/services/driverApi';
import incidentApi from '@/services/incidentApi';
import fleetApi from '@/services/fleetApi';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardAdminPage() {
    const { t } = useLanguage();
    const [counts, setCounts] = React.useState({
        vehicles: 0,
        drivers: 0,
        incidents: 0,
        fleets: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user from localStorage to find organizationId
                const userStr = localStorage.getItem('fleetman-user');
                let organizationId: number | undefined;
                if (userStr) {
                    const user = JSON.parse(userStr);
                    organizationId = user.organizationId;
                }

                let vehicleCount, driverCount, incidentCount, fleetCount;

                // Use adminId if available for better filtering support via existing endpoints
                const adminId = userStr ? JSON.parse(userStr).userId : undefined;

                if (adminId) {
                    // Parallel fetch using adminId
                    [
                        vehicleCount,
                        driverCount,
                        incidentCount,
                        fleetCount
                    ] = await Promise.all([
                        vehicleApi.countByAdminId(adminId),
                        // Prefer organization-based count for drivers as backend supports it directly
                        organizationId ? driverApi.countByOrganization(organizationId) : driverApi.countByAdminId(adminId),
                        incidentApi.countByAdminId(adminId),
                        fleetApi.countByAdminId(adminId)
                    ]);
                } else if (organizationId) {
                    // Fallback to organizationId
                    [
                        vehicleCount,
                        driverCount,
                        incidentCount,
                        fleetCount
                    ] = await Promise.all([
                        vehicleApi.countByOrganization(organizationId),
                        driverApi.countByOrganization(organizationId),
                        incidentApi.countByOrganization(organizationId),
                        fleetApi.countByOrganization(organizationId)
                    ]);
                } else {
                    // Fallback to all (or maybe should handle as error if strictly org-based)
                    [
                        vehicleCount,
                        driverCount, // drivers.length
                        incidentCount,
                        fleetCount
                    ] = await Promise.all([
                        vehicleApi.countAll(),
                        driverApi.getAll().then(drivers => drivers.length),
                        incidentApi.count(),
                        fleetApi.count()
                    ]);
                }

                setCounts({
                    vehicles: vehicleCount,
                    drivers: driverCount,
                    incidents: incidentCount,
                    fleets: fleetCount
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Stats configuration
    const stats = [
        { name: t('sidebar.vehicles') || 'Véhicules', value: loading ? '...' : counts.vehicles, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { name: t('sidebar.drivers') || 'Chauffeurs', value: loading ? '...' : counts.drivers, icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
        { name: 'Incidents', value: loading ? '...' : counts.incidents, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
        { name: t('sidebar.fleets') || 'Flottes', value: loading ? '...' : counts.fleets, icon: LayoutDashboard, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-text-main">
                    {t('dashboard.welcome')}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    Voici un aperçu de l'activité de votre organisation aujourd'hui.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-surface overflow-hidden rounded-lg shadow border border-glass hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`p-3 rounded-md ${item.bg}`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-text-sub truncate">
                                            {item.name}
                                        </dt>
                                        <dd>
                                            <div className="text-lg font-medium text-text-main">
                                                {item.value}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Map Placeholder */}
            <div className="bg-surface shadow rounded-lg border border-glass p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-text-muted">Carte interactive des véhicules (À venir)</p>
                </div>
            </div>
        </div>
    );
}
