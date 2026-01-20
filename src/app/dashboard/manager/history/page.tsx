"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { tripApi, vehicleApi, driverApi } from '@/services';
import { Trip, Vehicle, Driver } from '@/types';
import { TripStatus } from '@/types/enums';
import { History, MapPin, Calendar, Clock, ArrowRight, Car, User, Route, Filter, Search } from 'lucide-react';

export default function HistoryPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Map<number, Vehicle>>(new Map());
    const [drivers, setDrivers] = useState<Map<number, Driver>>(new Map());
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | TripStatus>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tripsData, vehiclesData, driversData] = await Promise.all([
                tripApi.getAll().catch(() => []),
                vehicleApi.getAll().catch(() => []),
                driverApi.getAll().catch(() => [])
            ]);

            // Create lookup maps
            const vehicleMap = new Map<number, Vehicle>();
            vehiclesData.forEach((v: Vehicle) => vehicleMap.set(v.vehicleId, v));

            const driverMap = new Map<number, Driver>();
            driversData.forEach((d: Driver) => driverMap.set(d.driverId, d));

            setTrips(tripsData.sort((a: Trip, b: Trip) =>
                new Date(b.departureDateTime).getTime() - new Date(a.departureDateTime).getTime()
            ));
            setVehicles(vehicleMap);
            setDrivers(driverMap);
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (startTime: string, endTime?: string) => {
        if (!endTime) return t('history.stats.ongoing');
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case TripStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20';
            case TripStatus.COMPLETED: return 'bg-green-100 text-green-700 dark:bg-green-900/20';
            case TripStatus.CANCELLED: return 'bg-red-100 text-red-700 dark:bg-red-900/20';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case TripStatus.IN_PROGRESS: return t('history.stats.ongoing');
            case TripStatus.COMPLETED: return t('history.filter.completed');
            case TripStatus.CANCELLED: return t('history.filter.cancelled');
            default: return status || t('history.filter.unknown');
        }
    };

    // Filter trips
    const filteredTrips = trips.filter(trip => {
        const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
        const vehicle = vehicles.get(trip.vehicleId || 0);
        const driver = drivers.get(trip.driverId || 0);
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            trip.tripReference?.toLowerCase().includes(searchLower) ||
            vehicle?.vehicleRegistrationNumber?.toLowerCase().includes(searchLower) ||
            driver?.driverFirstName?.toLowerCase().includes(searchLower) ||
            driver?.driverLastName?.toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
    });

    // Statistics
    const totalDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const completedTrips = trips.filter(t => t.status === TripStatus.COMPLETED).length;
    const ongoingTrips = trips.filter(t => t.status === TripStatus.IN_PROGRESS).length;

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
                    {t('history.title')}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    {t('history.subtitle')}
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface rounded-xl border border-glass p-4 flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <Route size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-main">{trips.length}</p>
                        <p className="text-sm text-text-muted">{t('history.stats.totalTrips')}</p>
                    </div>
                </div>
                <div className="bg-surface rounded-xl border border-glass p-4 flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <MapPin size={24} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-main">{totalDistance.toFixed(1)} km</p>
                        <p className="text-sm text-text-muted">{t('history.stats.totalDistance')}</p>
                    </div>
                </div>
                <div className="bg-surface rounded-xl border border-glass p-4 flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                        <History size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-main">{completedTrips}</p>
                        <p className="text-sm text-text-muted">{t('history.stats.completedTrips')}</p>
                    </div>
                </div>
                <div className="bg-surface rounded-xl border border-glass p-4 flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                        <Clock size={24} className="text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-main">{ongoingTrips}</p>
                        <p className="text-sm text-text-muted">{t('history.stats.ongoing')}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface rounded-lg border border-glass p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-text-muted" />
                    <span className="text-sm text-text-sub">{t('history.filter.label')}</span>
                </div>
                <div className="flex gap-2">
                    {(['all', TripStatus.IN_PROGRESS, TripStatus.COMPLETED, TripStatus.CANCELLED] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-secondary text-white'
                                : 'bg-glass text-text-sub hover:bg-glass/70'
                                }`}
                        >
                            {status === 'all' ? t('history.filter.all') : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder={t('history.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>
                </div>
            </div>

            {/* Trips List */}
            {filteredTrips.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-glass">
                    <History size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-medium text-text-main">{t('history.noTrips')}</h3>
                    <p className="text-text-muted mt-1">{t('history.noTripsDesc')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTrips.map((trip) => {
                        const vehicle = vehicles.get(trip.vehicleId || 0);
                        const driver = drivers.get(trip.driverId || 0);

                        return (
                            <div
                                key={trip.tripId}
                                className="bg-surface rounded-xl border border-glass p-5 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => vehicle && router.push(`/dashboard/manager/vehicles/${vehicle.vehicleId}`)}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Trip ID and Status */}
                                    <div className="flex items-center gap-3 lg:w-48">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                            <Route size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-main">{trip.tripReference || `${t('history.tripPrefix')}#${trip.tripId}`}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                                                {getStatusLabel(trip.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reference / Details - Replacing Location which is missing in DTO */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm text-text-muted italic">{trip.tripReference}</p>
                                        </div>
                                    </div>

                                    {/* Vehicle and Driver */}
                                    <div className="flex items-center gap-4 lg:w-64">
                                        {vehicle && (
                                            <div className="flex items-center gap-2">
                                                <Car size={16} className="text-text-muted" />
                                                <span className="text-sm text-text-sub">{vehicle.vehicleRegistrationNumber}</span>
                                            </div>
                                        )}
                                        {driver && (
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-text-muted" />
                                                <span className="text-sm text-text-sub">{driver.driverFirstName} {driver.driverLastName?.[0]}.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Time and Distance */}
                                    <div className="flex items-center gap-4 lg:w-48 text-sm">
                                        <div className="flex items-center gap-1 text-text-muted">
                                            <Calendar size={14} />
                                            <span>{formatDate(trip.departureDateTime)}</span>
                                        </div>
                                        {trip.actualDistance > 0 && (
                                            <div className="font-semibold text-secondary">
                                                {trip.actualDistance.toFixed(1)} km
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="mt-3 pt-3 border-t border-glass flex flex-wrap items-center gap-4 text-sm text-text-muted">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{t('history.details.departure')} {formatTime(trip.departureDateTime)}</span>
                                    </div>
                                    {trip.arrivalDateTime && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{t('history.details.arrival')} {formatTime(trip.arrivalDateTime)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <span>{t('history.details.duration')} {formatDuration(trip.departureDateTime, trip.arrivalDateTime || undefined)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
