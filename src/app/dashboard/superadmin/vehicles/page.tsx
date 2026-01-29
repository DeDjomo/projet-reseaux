"use client";

import React, { useEffect, useState } from 'react';
import { Car, Search, MoreVertical, Edit, Trash2, Fuel, Gauge } from 'lucide-react';
import vehicleApi from '@/services/vehicleApi';
import { Vehicle } from '@/types';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        let filtered = vehicles;

        if (stateFilter !== 'ALL') {
            filtered = filtered.filter(v => v.state === stateFilter);
        }

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(v => v.type === typeFilter);
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(v =>
                v.vehicleRegistrationNumber?.toLowerCase().includes(query) ||
                v.vehicleMake?.toLowerCase().includes(query) ||
                v.vehicleModel?.toLowerCase().includes(query)
            );
        }

        setFilteredVehicles(filtered);
    }, [searchQuery, stateFilter, typeFilter, vehicles]);

    const fetchVehicles = async () => {
        try {
            const data = await vehicleApi.getAll();
            setVehicles(Array.isArray(data) ? data : []);
            setFilteredVehicles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const getStateBadge = (state: string) => {
        const styles: Record<string, { bg: string; label: string }> = {
            PARKED: { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', label: 'Garé' },
            IN_SERVICE: { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'En service' },
            IN_ALARM: { bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Alarme' },
            UNDER_MAINTENANCE: { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'Maintenance' },
            OUT_OF_SERVICE: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Hors service' },
        };
        return styles[state] || styles.PARKED;
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, { bg: string; label: string }> = {
            CAR: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Voiture' },
            TRUCK: { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'Camion' },
            VAN: { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Fourgon' },
            BUS: { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Bus' },
            MOTORCYCLE: { bg: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', label: 'Moto' },
            TRAILER: { bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'Remorque' },
        };
        return styles[type] || styles.CAR;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Car className="h-7 w-7 text-purple-500" />
                        Véhicules
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Vue globale de tous les véhicules de la plateforme.
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Total</p>
                    <p className="text-2xl font-bold text-text-main">{vehicles.length}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">En service</p>
                    <p className="text-2xl font-bold text-green-500">
                        {vehicles.filter(v => v.state === 'IN_SERVICE').length}
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Garés</p>
                    <p className="text-2xl font-bold text-slate-500">
                        {vehicles.filter(v => v.state === 'PARKED').length}
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Maintenance</p>
                    <p className="text-2xl font-bold text-orange-500">
                        {vehicles.filter(v => v.state === 'UNDER_MAINTENANCE').length}
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Hors service</p>
                    <p className="text-2xl font-bold text-red-500">
                        {vehicles.filter(v => v.state === 'OUT_OF_SERVICE').length}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-surface shadow-sm border border-glass rounded-lg overflow-hidden">
                <div className="p-4 border-b border-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher (immatriculation, marque, modèle)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm"
                        >
                            <option value="ALL">Tous les états</option>
                            <option value="PARKED">Garé</option>
                            <option value="IN_SERVICE">En service</option>
                            <option value="IN_ALARM">Alarme</option>
                            <option value="UNDER_MAINTENANCE">Maintenance</option>
                            <option value="OUT_OF_SERVICE">Hors service</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm"
                        >
                            <option value="ALL">Tous les types</option>
                            <option value="CAR">Voiture</option>
                            <option value="TRUCK">Camion</option>
                            <option value="VAN">Fourgon</option>
                            <option value="BUS">Bus</option>
                            <option value="MOTORCYCLE">Moto</option>
                        </select>
                        <span className="text-sm text-text-sub">
                            {filteredVehicles.length} résultat(s)
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-text-sub font-medium">
                            <tr>
                                <th className="px-6 py-3">Véhicule</th>
                                <th className="px-6 py-3">Immatriculation</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Carburant</th>
                                <th className="px-6 py-3">État</th>
                                <th className="px-6 py-3">Vitesse</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass text-text-main">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                                        Aucun véhicule trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((vehicle) => {
                                    const stateBadge = getStateBadge(vehicle.state);
                                    const typeBadge = getTypeBadge(vehicle.type);
                                    return (
                                        <tr key={vehicle.vehicleId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                                        <Car size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {vehicle.vehicleMake} {vehicle.vehicleModel}
                                                        </p>
                                                        <p className="text-xs text-text-muted">
                                                            VIN: {vehicle.vehicleIdentificationNumber?.slice(-6) || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm">
                                                {vehicle.vehicleRegistrationNumber}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeBadge.bg}`}>
                                                    {typeBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-text-sub">
                                                    <Fuel size={14} />
                                                    <span>{vehicle.fuelType || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stateBadge.bg}`}>
                                                    {stateBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-text-sub">
                                                    <Gauge size={14} />
                                                    <span>{vehicle.speed || 0} km/h</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === vehicle.vehicleId ? null : vehicle.vehicleId)}
                                                    className="text-text-sub hover:text-text-main p-2 hover:bg-glass rounded-full transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {actionMenuOpen === vehicle.vehicleId && (
                                                    <div className="absolute right-6 top-12 z-10 w-40 bg-surface border border-glass rounded-lg shadow-lg py-1">
                                                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2">
                                                            <Edit size={16} />
                                                            Modifier
                                                        </button>
                                                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2 text-red-500">
                                                            <Trash2 size={16} />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {actionMenuOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setActionMenuOpen(null)} />
            )}
        </div>
    );
}
