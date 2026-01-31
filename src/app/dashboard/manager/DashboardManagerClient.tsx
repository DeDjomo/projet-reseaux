"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Truck, Users, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { positionApi, organizationApi } from '@/services';
import { Vehicle, Position } from '@/types';

// Dynamically import map to avoid SSR issues with Leaflet
const FleetMap = dynamic(() => import('@/components/vehicle/FleetMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Chargement de la carte...</div>
});

export default function DashboardManagerPage() {
    const { t } = useLanguage();
    const [counts, setCounts] = React.useState({
        vehicles: 0,
        drivers: 0,
        incidents: 0,
        fleets: 0
    });
    const [loading, setLoading] = React.useState(true);
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [positions, setPositions] = React.useState<Record<number, Position>>({});

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const userStr = localStorage.getItem('fleetman-user');
                let organizationId: number | undefined;

                if (userStr) {
                    const user = JSON.parse(userStr);
                    organizationId = user.organizationId;
                }

                if (!organizationId) {
                    // No organization found for this user
                    setLoading(false);
                    return;
                }

                // Fetch stats
                const [fleetCount, driverCount, incidentCount] = await Promise.all([
                    organizationApi.countFleets(organizationId),
                    organizationApi.countDrivers(organizationId),
                    organizationApi.countIncidents(organizationId)
                ]);

                // Fetch vehicles
                const orgVehicles = await organizationApi.getVehicles(organizationId);
                setVehicles(orgVehicles);

                // Fetch latest positions for all vehicles
                const posMap: Record<number, Position> = {};
                // Use Promise.all with map to fetch concurrent
                await Promise.all(orgVehicles.map(async (v) => {
                    try {
                        const pos = await positionApi.getLatestByVehicleId(v.vehicleId);
                        if (pos) {
                            posMap[v.vehicleId] = pos;
                        }
                    } catch (e) {
                        // No position or error, ignore
                    }
                }));
                setPositions(posMap);

                // Calculate total vehicles from fleets if needed, or just use length of vehicles array
                // The previous code summed fleet.vehiclesCount, which is good for stats
                const fleets = await organizationApi.getFleets(organizationId);
                let vehicleCount = 0;
                for (const fleet of fleets) {
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
        <div className="space-y-6 animate-fade-in pb-10">
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

            {/* Map Section */}
            <div className="bg-surface shadow rounded-lg border border-glass overflow-hidden h-[500px] flex flex-col">
                <div className="p-4 border-b border-glass bg-surface/50 backdrop-blur-sm">
                    <h2 className="font-semibold text-lg text-text-main flex items-center gap-2">
                        <Truck size={20} className="text-blue-500" />
                        Carte de la flotte
                        <span className="text-xs font-normal text-text-muted ml-2">
                            ({Object.keys(positions).length} véhicules localisés)
                        </span>
                    </h2>
                </div>
                <div className="flex-1 relative z-0">
                    <FleetMap vehicles={vehicles} positions={positions} />
                </div>
            </div>
        </div>
    );
}
