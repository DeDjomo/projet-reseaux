"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Truck, Users, AlertTriangle } from 'lucide-react';
import { organizationApi } from '@/services';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardManagerPage() {
    const { t } = useLanguage();
    const [counts, setCounts] = React.useState({
        vehicles: 0,
        drivers: 0,
        incidents: 0,
        fleets: 0
    });
    const [loading, setLoading] = React.useState(true);
    const [organizationName, setOrganizationName] = React.useState<string>('');

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Get organization from localStorage
                const orgStr = localStorage.getItem('fleetman-organization');
                const userStr = localStorage.getItem('fleetman-user');

                let organizationId: number | undefined;

                if (orgStr) {
                    const org = JSON.parse(orgStr);
                    organizationId = org.organizationId;
                    setOrganizationName(org.organizationName || '');
                } else if (userStr) {
                    const user = JSON.parse(userStr);
                    organizationId = user.organizationId;
                }

                if (!organizationId) {
                    // No organization found for this user
                    setLoading(false);
                    return;
                }

                // Fetch counts using organization-based endpoints
                const [fleetCount, driverCount, incidentCount] = await Promise.all([
                    organizationApi.countFleets(organizationId),
                    organizationApi.countDrivers(organizationId),
                    organizationApi.countIncidents(organizationId)
                ]);

                // For vehicles, we need to get fleets first then count vehicles
                const fleets = await organizationApi.getFleets(organizationId);
                let vehicleCount = 0;
                for (const fleet of fleets) {
                    // Count vehicles per fleet (use existing vehicle API or estimate)
                    vehicleCount += fleet.vehiclesCount || 0;
                }

                setCounts({
                    vehicles: vehicleCount,
                    drivers: driverCount,
                    incidents: incidentCount,
                    fleets: fleetCount
                });
            } catch (error) {
                // Failed to fetch dashboard stats
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
                    {t('dashboard.overview')}
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
                    <p className="text-text-muted">{t('dashboard.mapComingSoon')}</p>
                </div>
            </div>
        </div>
    );
}
