"use client";

import React, { useEffect, useState } from 'react';
import { UserCog, Search, MoreVertical, Edit, Trash2, Key, Truck } from 'lucide-react';
import { fleetManagerApi } from '@/services/userApi';
import { FleetManager } from '@/types';

export default function FleetManagersPage() {
    const [managers, setManagers] = useState<FleetManager[]>([]);
    const [filteredManagers, setFilteredManagers] = useState<FleetManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState<string>('ALL');
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    useEffect(() => {
        fetchManagers();
    }, []);

    useEffect(() => {
        let filtered = managers;

        if (stateFilter !== 'ALL') {
            filtered = filtered.filter(m => m.managerState === stateFilter);
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.managerFirstName?.toLowerCase().includes(query) ||
                m.managerLastName?.toLowerCase().includes(query) ||
                m.managerEmail?.toLowerCase().includes(query)
            );
        }

        setFilteredManagers(filtered);
    }, [searchQuery, stateFilter, managers]);

    const fetchManagers = async () => {
        try {
            const data = await fleetManagerApi.getAll();
            setManagers(Array.isArray(data) ? data : []);
            setFilteredManagers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch fleet managers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (managerId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce gestionnaire ?')) {
            try {
                await fleetManagerApi.delete(managerId);
                fetchManagers();
            } catch (error) {
                console.error("Failed to delete manager", error);
            }
        }
        setActionMenuOpen(null);
    };

    const getStateBadge = (state: string) => {
        const styles: Record<string, { bg: string; label: string }> = {
            ACTIVE: { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Actif' },
            INACTIVE: { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', label: 'Inactif' },
            SUSPENDED: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Suspendu' },
            ON_LEAVE: { bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'En congé' },
        };
        return styles[state] || styles.INACTIVE;
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        const f = firstName?.charAt(0) || '';
        const l = lastName?.charAt(0) || '';
        return (f + l).toUpperCase() || 'FM';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <UserCog className="h-7 w-7 text-indigo-500" />
                        Fleet Managers
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Vue globale de tous les gestionnaires de flottes.
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Total</p>
                    <p className="text-2xl font-bold text-text-main">{managers.length}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Actifs</p>
                    <p className="text-2xl font-bold text-green-500">
                        {managers.filter(m => m.managerState === 'ACTIVE' || m.isActive).length}
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Inactifs</p>
                    <p className="text-2xl font-bold text-slate-500">
                        {managers.filter(m => m.managerState === 'INACTIVE' || !m.isActive).length}
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Total Flottes</p>
                    <p className="text-2xl font-bold text-indigo-500">
                        {managers.reduce((acc, m) => acc + (m.fleetsCount || 0), 0)}
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
                            placeholder="Rechercher un gestionnaire..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm"
                        >
                            <option value="ALL">Tous les états</option>
                            <option value="ACTIVE">Actif</option>
                            <option value="INACTIVE">Inactif</option>
                            <option value="SUSPENDED">Suspendu</option>
                            <option value="ON_LEAVE">En congé</option>
                        </select>
                        <span className="text-sm text-text-sub">
                            {filteredManagers.length} résultat(s)
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-text-sub font-medium">
                            <tr>
                                <th className="px-6 py-3">Gestionnaire</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Téléphone</th>
                                <th className="px-6 py-3">Flottes</th>
                                <th className="px-6 py-3">État</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass text-text-main">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredManagers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                                        Aucun gestionnaire trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredManagers.map((manager) => {
                                    const stateBadge = getStateBadge(manager.managerState);
                                    return (
                                        <tr key={manager.managerId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                        {getInitials(manager.managerFirstName, manager.managerLastName)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {manager.managerFirstName} {manager.managerLastName}
                                                        </p>
                                                        {manager.adminName && (
                                                            <p className="text-xs text-text-muted">
                                                                Admin: {manager.adminName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-sub">
                                                {manager.managerEmail}
                                            </td>
                                            <td className="px-6 py-4 text-text-sub">
                                                {manager.managerPhoneNumber || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Truck size={16} className="text-text-muted" />
                                                    <span className="font-medium">{manager.fleetsCount || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stateBadge.bg}`}>
                                                    {stateBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === manager.managerId ? null : manager.managerId)}
                                                    className="text-text-sub hover:text-text-main p-2 hover:bg-glass rounded-full transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {actionMenuOpen === manager.managerId && (
                                                    <div className="absolute right-6 top-12 z-10 w-48 bg-surface border border-glass rounded-lg shadow-lg py-1">
                                                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2">
                                                            <Edit size={16} />
                                                            Modifier
                                                        </button>
                                                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2">
                                                            <Key size={16} />
                                                            Reset Mot de passe
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(manager.managerId)}
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
