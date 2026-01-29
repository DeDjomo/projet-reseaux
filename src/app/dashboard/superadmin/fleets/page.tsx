"use client";

import React, { useEffect, useState } from 'react';
import { Truck, Search, Plus, MoreVertical, Edit, Trash2, Car } from 'lucide-react';
import fleetApi from '@/services/fleetApi';
import { Fleet } from '@/types';
import { FleetType } from '@/types/enums';
import Link from 'next/link';

export default function FleetsPage() {
    const [fleets, setFleets] = useState<Fleet[]>([]);
    const [filteredFleets, setFilteredFleets] = useState<Fleet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    useEffect(() => {
        fetchFleets();
    }, []);

    useEffect(() => {
        let filtered = fleets;

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(fleet => fleet.fleetType === typeFilter);
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(fleet =>
                fleet.fleetName?.toLowerCase().includes(query) ||
                fleet.fleetDescription?.toLowerCase().includes(query)
            );
        }

        setFilteredFleets(filtered);
    }, [searchQuery, typeFilter, fleets]);

    const fetchFleets = async () => {
        try {
            const data = await fleetApi.getAll();
            setFleets(Array.isArray(data) ? data : []);
            setFilteredFleets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch fleets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fleetId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette flotte ?')) {
            try {
                await fleetApi.delete(fleetId);
                fetchFleets();
            } catch (error) {
                console.error("Failed to delete fleet", error);
            }
        }
        setActionMenuOpen(null);
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, { bg: string; label: string }> = {
            PERSONAL: { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', label: 'Personnel' },
            PASSENGER_TRANSPORT: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Transport Passagers' },
            CARGO_TRANSPORT: { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'Transport Cargo' },
            MIXED: { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Mixte' },
            RENTAL: { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Location' },
            DELIVERY: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Livraison' },
            OTHER: { bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'Autre' },
        };
        return styles[type] || styles.OTHER;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Truck className="h-7 w-7 text-orange-500" />
                        Flottes
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Vue globale de toutes les flottes de la plateforme.
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Total Flottes</p>
                    <p className="text-2xl font-bold text-text-main">{fleets.length}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Transport Cargo</p>
                    <p className="text-2xl font-bold text-orange-500">
                        {fleets.filter(f => f.fleetType === 'CARGO_TRANSPORT').length}
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Transport Passagers</p>
                    <p className="text-2xl font-bold text-blue-500">
                        {fleets.filter(f => f.fleetType === 'PASSENGER_TRANSPORT').length}
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Total Véhicules</p>
                    <p className="text-2xl font-bold text-purple-500">
                        {fleets.reduce((acc, f) => acc + (f.vehiclesCount || 0), 0)}
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
                            placeholder="Rechercher une flotte..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm"
                        >
                            <option value="ALL">Tous les types</option>
                            <option value="PERSONAL">Personnel</option>
                            <option value="PASSENGER_TRANSPORT">Transport Passagers</option>
                            <option value="CARGO_TRANSPORT">Transport Cargo</option>
                            <option value="MIXED">Mixte</option>
                            <option value="RENTAL">Location</option>
                            <option value="DELIVERY">Livraison</option>
                        </select>
                        <span className="text-sm text-text-sub">
                            {filteredFleets.length} résultat(s)
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-text-sub font-medium">
                            <tr>
                                <th className="px-6 py-3">Flotte</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Gestionnaire</th>
                                <th className="px-6 py-3">Véhicules</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass text-text-main">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredFleets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                        Aucune flotte trouvée.
                                    </td>
                                </tr>
                            ) : (
                                filteredFleets.map((fleet) => {
                                    const typeBadge = getTypeBadge(fleet.fleetType);
                                    return (
                                        <tr key={fleet.fleetId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                        <Truck size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{fleet.fleetName}</p>
                                                        {fleet.fleetDescription && (
                                                            <p className="text-xs text-text-muted truncate max-w-[200px]">
                                                                {fleet.fleetDescription}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge.bg}`}>
                                                    {typeBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-text-sub">
                                                {fleet.fleetManagerName || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Car size={16} className="text-text-muted" />
                                                    <span className="font-medium">{fleet.vehiclesCount || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === fleet.fleetId ? null : fleet.fleetId)}
                                                    className="text-text-sub hover:text-text-main p-2 hover:bg-glass rounded-full transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {actionMenuOpen === fleet.fleetId && (
                                                    <div className="absolute right-6 top-12 z-10 w-40 bg-surface border border-glass rounded-lg shadow-lg py-1">
                                                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2">
                                                            <Edit size={16} />
                                                            Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(fleet.fleetId)}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2 text-red-500"
                                                        >
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
