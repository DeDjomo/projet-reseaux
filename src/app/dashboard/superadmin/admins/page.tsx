"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Search, Plus, MoreVertical, Edit, Trash2, Key, Shield } from 'lucide-react';
import { adminApi } from '@/services/userApi';
import { Admin } from '@/types';

export default function AdminsPage() {
    const { t } = useLanguage();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        let filtered = admins;

        // Role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(admin => admin.adminRole === roleFilter);
        }

        // Search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(admin =>
                admin.adminFirstName?.toLowerCase().includes(query) ||
                admin.adminLastName?.toLowerCase().includes(query) ||
                admin.adminEmail?.toLowerCase().includes(query)
            );
        }

        setFilteredAdmins(filtered);
    }, [searchQuery, roleFilter, admins]);

    const fetchAdmins = async () => {
        try {
            const data = await adminApi.getAll();
            setAdmins(Array.isArray(data) ? data : []);
            setFilteredAdmins(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (adminId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
            try {
                await adminApi.delete(adminId);
                fetchAdmins();
            } catch (error) {
                console.error("Failed to delete admin", error);
            }
        }
        setActionMenuOpen(null);
    };

    const getRoleBadge = (role: string) => {
        if (role === 'SUPER_ADMIN') {
            return {
                style: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                icon: Shield,
                label: 'Super Admin'
            };
        }
        return {
            style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            icon: Users,
            label: 'Org Manager'
        };
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        const f = firstName?.charAt(0) || '';
        const l = lastName?.charAt(0) || '';
        return (f + l).toUpperCase() || 'AD';
    };

    // Stats
    const totalAdmins = admins.length;
    const superAdmins = admins.filter(a => a.adminRole === 'SUPER_ADMIN').length;
    const orgManagers = admins.filter(a => a.adminRole === 'ORGANIZATION_MANAGER').length;
    const activeAdmins = admins.filter(a => a.isActive).length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Users className="h-7 w-7 text-green-500" />
                        Administrateurs
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Gestion des administrateurs de la plateforme
                    </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm">
                    <Plus size={20} className="mr-2" />
                    Nouvel Administrateur
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Total</p>
                    <p className="text-2xl font-bold text-text-main">{totalAdmins}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Super Admins</p>
                    <p className="text-2xl font-bold text-purple-500">{superAdmins}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Org Managers</p>
                    <p className="text-2xl font-bold text-blue-500">{orgManagers}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Actifs</p>
                    <p className="text-2xl font-bold text-green-500">{activeAdmins}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface shadow rounded-lg border border-glass overflow-hidden">
                <div className="p-4 border-b border-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un administrateur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm"
                        >
                            <option value="ALL">Tous les rôles</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="ORGANIZATION_MANAGER">Org Manager</option>
                        </select>
                        <span className="text-sm text-text-sub">
                            {filteredAdmins.length} résultat(s)
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-text-sub font-medium">
                            <tr>
                                <th className="px-6 py-3">Administrateur</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Rôle</th>
                                <th className="px-6 py-3">Organisation</th>
                                <th className="px-6 py-3">Statut</th>
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
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                                        Aucun administrateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => {
                                    const roleBadge = getRoleBadge(admin.adminRole);
                                    return (
                                        <tr key={admin.adminId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-sm">
                                                        {getInitials(admin.adminFirstName, admin.adminLastName)}
                                                    </div>
                                                    <span>{admin.adminFirstName} {admin.adminLastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-sub">
                                                {admin.adminEmail}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge.style}`}>
                                                    <roleBadge.icon size={12} />
                                                    {roleBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-text-sub">
                                                {admin.organizationName || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${admin.isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {admin.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === admin.adminId ? null : admin.adminId)}
                                                    className="text-text-sub hover:text-text-main p-2 hover:bg-glass rounded-full transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {actionMenuOpen === admin.adminId && (
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
                                                            onClick={() => handleDelete(admin.adminId)}
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

            {/* Click outside to close menu */}
            {actionMenuOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setActionMenuOpen(null)} />
            )}
        </div>
    );
}
