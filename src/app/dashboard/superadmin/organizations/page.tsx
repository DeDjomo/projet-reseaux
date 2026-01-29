"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Search, Plus, MoreVertical, Edit, Trash2, CreditCard } from 'lucide-react';
import organizationApi from '@/services/organizationApi';
import { Organization } from '@/types';

export default function OrganizationsPage() {
    const { t } = useLanguage();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredOrgs(organizations);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredOrgs(organizations.filter(org =>
                org.organizationName?.toLowerCase().includes(query) ||
                org.organizationCity?.toLowerCase().includes(query) ||
                org.organizationCountry?.toLowerCase().includes(query)
            ));
        }
    }, [searchQuery, organizations]);

    const fetchOrganizations = async () => {
        try {
            const data = await organizationApi.getAll();
            setOrganizations(Array.isArray(data) ? data : []);
            setFilteredOrgs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch organizations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (orgId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
            try {
                await organizationApi.delete(orgId);
                fetchOrganizations();
            } catch (error) {
                console.error("Failed to delete organization", error);
            }
        }
        setActionMenuOpen(null);
    };

    const getSubscriptionBadge = (plan: string) => {
        const styles: Record<string, string> = {
            FREE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            BASIC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            PROFESSIONAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            ENTERPRISE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        };
        return styles[plan] || styles.FREE;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    // Stats
    const totalOrgs = organizations.length;
    const activeOrgs = organizations.filter(o => o.isActive).length;
    const proOrgs = organizations.filter(o => ['PROFESSIONAL', 'ENTERPRISE'].includes(o.subscriptionPlan)).length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Building2 className="h-7 w-7 text-blue-500" />
                        Organisations
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Gestion des organisations de la plateforme
                    </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm">
                    <Plus size={20} className="mr-2" />
                    Nouvelle Organisation
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Total</p>
                    <p className="text-2xl font-bold text-text-main">{totalOrgs}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Actives</p>
                    <p className="text-2xl font-bold text-green-500">{activeOrgs}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Pro+</p>
                    <p className="text-2xl font-bold text-purple-500">{proOrgs}</p>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <p className="text-sm text-text-sub">Free</p>
                    <p className="text-2xl font-bold text-gray-500">
                        {organizations.filter(o => o.subscriptionPlan === 'FREE').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface shadow rounded-lg border border-glass overflow-hidden">
                <div className="p-4 border-b border-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une organisation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <span className="text-sm text-text-sub">
                        {filteredOrgs.length} résultat(s)
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-text-sub font-medium">
                            <tr>
                                <th className="px-6 py-3">Organisation</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Localisation</th>
                                <th className="px-6 py-3">Statut</th>
                                <th className="px-6 py-3">Créée le</th>
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
                            ) : filteredOrgs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                                        Aucune organisation trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredOrgs.map((org) => (
                                    <tr key={org.organizationId} className="hover:bg-glass/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                    <Building2 size={20} />
                                                </div>
                                                <span>{org.organizationName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub">
                                            {org.organizationType || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSubscriptionBadge(org.subscriptionPlan)}`}>
                                                {org.subscriptionPlan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub">
                                            {org.organizationCity ? `${org.organizationCity}, ${org.organizationCountry}` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${org.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {org.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub">
                                            {formatDate(org.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setActionMenuOpen(actionMenuOpen === org.organizationId ? null : org.organizationId)}
                                                className="text-text-sub hover:text-text-main p-2 hover:bg-glass rounded-full transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {actionMenuOpen === org.organizationId && (
                                                <div className="absolute right-6 top-12 z-10 w-48 bg-surface border border-glass rounded-lg shadow-lg py-1">
                                                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2">
                                                        <Edit size={16} />
                                                        Modifier
                                                    </button>
                                                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2">
                                                        <CreditCard size={16} />
                                                        Changer le plan
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(org.organizationId)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2 text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
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
