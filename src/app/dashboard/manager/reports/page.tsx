"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fuelRechargeApi, maintenanceApi, vehicleApi, incidentApi, tripApi } from '@/services';
import { FuelRecharge, Maintenance, Vehicle, Incident, Trip } from '@/types';
import {
    Fuel,
    Wrench,
    TrendingUp,
    AlertTriangle,
    Calendar,
    DollarSign,
    Gauge,
    MapPin,
    Clock,
    Car
} from 'lucide-react';
import { IncidentSeverity, IncidentStatus, VehicleState } from '@/types/enums';

export default function ReportsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [fuelRecharges, setFuelRecharges] = useState<FuelRecharge[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [fuelData, maintenanceData, vehicleData, incidentData, tripData] = await Promise.all([
                fuelRechargeApi.getAll().catch(() => []),
                maintenanceApi.getAll().catch(() => []),
                vehicleApi.getAll().catch(() => []),
                incidentApi.getAll().catch(() => []),
                tripApi.getAll().catch(() => [])
            ]);

            setFuelRecharges(fuelData);
            setMaintenances(maintenanceData);
            setVehicles(vehicleData);
            setIncidents(incidentData);
            setTrips(tripData);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' FCFA';
    };

    // Calcul des statistiques
    const totalFuelCost = fuelRecharges.reduce((sum, r) => sum + (Number(r.rechargePrice) || 0), 0);
    const totalFuelAmount = fuelRecharges.reduce((sum, r) => sum + (Number(r.rechargeQuantity) || 0), 0);
    const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + (Number(m.maintenanceCost) || 0), 0);
    const totalDistance = trips.reduce((sum, t) => sum + (Number(t.actualDistance) || 0), 0);
    const activeVehicles = vehicles.filter(v => v.state === VehicleState.IN_SERVICE).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main">
                    {t('reports.title')}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    {t('reports.subtitle')}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface rounded-xl border border-glass p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                            <Fuel size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">{t('reports.fuelCost.total')}</p>
                            <p className="text-xl font-bold text-text-main">{formatCurrency(totalFuelCost)}</p>
                            <p className="text-xs text-text-sub">{totalFuelAmount.toFixed(1)} {t('reports.fuel.consumed')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-xl border border-glass p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                            <Wrench size={24} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">{t('reports.maintenanceCost.total')}</p>
                            <p className="text-xl font-bold text-text-main">{formatCurrency(totalMaintenanceCost)}</p>
                            <p className="text-xs text-text-sub">{maintenances.length} {t('reports.maintenances.count')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-xl border border-glass p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <MapPin size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">{t('reports.distance.total')}</p>
                            <p className="text-xl font-bold text-text-main">{totalDistance.toFixed(1)} km</p>
                            <p className="text-xs text-text-sub">{trips.length} {t('reports.trips.count')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-xl border border-glass p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">{t('reports.incidents.count')}</p>
                            <p className="text-xl font-bold text-text-main">{incidents.length}</p>
                            <p className="text-xs text-text-sub">{activeVehicles} {t('reports.vehicles.active.count')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Fuel Recharges */}
                <div className="bg-surface rounded-xl border border-glass overflow-hidden">
                    <div className="px-5 py-4 border-b border-glass flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Fuel size={20} className="text-green-600" />
                            <h3 className="font-semibold text-text-main">{t('reports.fuel.recent')}</h3>
                        </div>
                        <span className="text-sm text-text-muted">{fuelRecharges.length} {t('reports.recharges.count')}</span>
                    </div>
                    <div className="divide-y divide-glass max-h-80 overflow-y-auto">
                        {fuelRecharges.length === 0 ? (
                            <div className="p-8 text-center text-text-muted">
                                {t('reports.fuel.noData')}
                            </div>
                        ) : (
                            fuelRecharges.slice(0, 10).map((recharge, index) => (
                                <div key={recharge.rechargeId ?? `recharge-${index}`} className="px-5 py-3 hover:bg-glass/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-text-main">
                                                {recharge.rechargeQuantity} L
                                            </p>
                                            <p className="text-sm text-text-muted">
                                                {recharge.stationName || t('reports.fuel.unknownStation')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                {formatCurrency(recharge.rechargePrice)}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {formatDate(recharge.rechargeDateTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Maintenances */}
                <div className="bg-surface rounded-xl border border-glass overflow-hidden">
                    <div className="px-5 py-4 border-b border-glass flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wrench size={20} className="text-orange-600" />
                            <h3 className="font-semibold text-text-main">{t('reports.maintenances.title')}</h3>
                        </div>
                        <span className="text-sm text-text-muted">{maintenances.length} {t('reports.maintenances.count')}</span>
                    </div>
                    <div className="divide-y divide-glass max-h-80 overflow-y-auto">
                        {maintenances.length === 0 ? (
                            <div className="p-8 text-center text-text-muted">
                                {t('reports.maintenance.noData')}
                            </div>
                        ) : (
                            maintenances.slice(0, 10).map((maintenance) => (
                                <div key={maintenance.maintenanceId} className="px-5 py-3 hover:bg-glass/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-text-main">
                                                {maintenance.maintenanceSubject}
                                            </p>
                                            <p className="text-sm text-text-muted">
                                                {maintenance.maintenanceReport || t('reports.maintenance.noReport')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-orange-600">
                                                {formatCurrency(maintenance.maintenanceCost || 0)}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {formatDate(maintenance.maintenanceDateTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Incidents Section */}
            <div className="bg-surface rounded-xl border border-glass overflow-hidden">
                <div className="px-5 py-4 border-b border-glass flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-600" />
                        <h3 className="font-semibold text-text-main">{t('reports.incidents.recent')}</h3>
                    </div>
                    <span className="text-sm text-text-muted">{incidents.length} {t('reports.incidents.countLabel')}</span>
                </div>
                <div className="divide-y divide-glass max-h-64 overflow-y-auto">
                    {incidents.length === 0 ? (
                        <div className="p-8 text-center text-text-muted">
                            {t('reports.incidents.noData')}
                        </div>
                    ) : (
                        incidents.slice(0, 5).map((incident) => (
                            <div key={incident.incidentId} className="px-5 py-3 hover:bg-glass/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${incident.incidentSeverity === IncidentSeverity.CRITICAL ? 'bg-red-100 text-red-700 dark:bg-red-900/20' :
                                            incident.incidentSeverity === IncidentSeverity.MAJOR ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20' :
                                                incident.incidentSeverity === IncidentSeverity.MODERATE ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20' :
                                                    'bg-green-100 text-green-700 dark:bg-green-900/20'
                                            }`}>
                                            {incident.incidentSeverity}
                                        </span>
                                        <div>
                                            <p className="font-medium text-text-main">{incident.incidentTitle}</p>
                                            <p className="text-sm text-text-muted">{incident.incidentType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${incident.incidentStatus === IncidentStatus.RESOLVED ? 'bg-green-100 text-green-700' :
                                            incident.incidentStatus === IncidentStatus.UNDER_INVESTIGATION ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {incident.incidentStatus}
                                        </span>
                                        <p className="text-xs text-text-muted mt-1">
                                            {formatDate(incident.incidentDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Fleet Overview */}
            <div className="bg-surface rounded-xl border border-glass overflow-hidden">
                <div className="px-5 py-4 border-b border-glass flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Car size={20} className="text-secondary" />
                        <h3 className="font-semibold text-text-main">{t('reports.fleet.overview')}</h3>
                    </div>
                    <span className="text-sm text-text-muted">{vehicles.length} {t('reports.vehicles.countLabel')}</span>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-glass/30">
                            <p className="text-3xl font-bold text-green-600">{vehicles.filter(v => v.state === VehicleState.IN_SERVICE).length}</p>
                            <p className="text-sm text-text-muted">{t('reports.status.active')}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-glass/30">
                            <p className="text-3xl font-bold text-yellow-600">{vehicles.filter(v => v.state === VehicleState.OUT_OF_SERVICE).length}</p>
                            <p className="text-sm text-text-muted">{t('reports.status.inactive')}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-glass/30">
                            <p className="text-3xl font-bold text-orange-600">{vehicles.filter(v => v.state === VehicleState.UNDER_MAINTENANCE).length}</p>
                            <p className="text-sm text-text-muted">{t('reports.status.maintenance')}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-glass/30">
                            <p className="text-3xl font-bold text-blue-600">{vehicles.filter(v => v.state === VehicleState.PARKED).length}</p>
                            <p className="text-sm text-text-muted">{t('reports.status.service')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
