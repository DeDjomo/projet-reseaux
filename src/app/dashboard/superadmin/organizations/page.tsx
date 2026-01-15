"use client";

import { useEffect, useState } from 'react';
import { Building2, Search, Filter, Edit, Trash2, Eye, CreditCard, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { organizationApi } from '@/services';
import { Organization, SubscriptionPlan } from '@/types';

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState<SubscriptionPlan | 'ALL'>('ALL');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<Organization | null>(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const data = await organizationApi.getAll();
            setOrganizations(data);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrganizations = organizations.filter(org => {
        const matchesSearch =
            org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.organizationCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.organizationCountry?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPlan = planFilter === 'ALL' || org.subscriptionPlan === planFilter;

        return matchesSearch && matchesPlan;
    });

    const handleDelete = async (orgId: number) => {
        try {
            await organizationApi.delete(orgId);
            setOrganizations(prev => prev.filter(o => o.organizationId !== orgId));
            setShowDeleteModal(null);
        } catch (error) {
            console.error('Failed to delete organization:', error);
        }
    };

    const handleChangePlan = async (orgId: number, plan: SubscriptionPlan) => {
        try {
            await organizationApi.updateSubscriptionPlan(orgId, plan);
            setOrganizations(prev => prev.map(o =>
                o.organizationId === orgId ? { ...o, subscriptionPlan: plan } : o
            ));
        } catch (error) {
            console.error('Failed to update subscription:', error);
        }
    };

    const getPlanColor = (plan?: string) => {
        switch (plan) {
            case 'BASIC': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'PROFESSIONAL': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'ENTERPRISE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Building2 className="text-purple-500" />
                        Organisations
                    </h1>
                    <p className="text-text-muted mt-1">
                        Gérez toutes les organisations de la plateforme ({organizations.length})
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-text-muted" />
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value as SubscriptionPlan | 'ALL')}
                        className="px-3 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="ALL">Tous les plans</option>
                        <option value="BASIC">Basic</option>
                        <option value="PROFESSIONAL">Professional</option>
                        <option value="ENTERPRISE">Enterprise</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-glass">
                        <thead className="bg-glass/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Organisation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Localisation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Abonnement</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Créé le</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-sub uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass">
                            {filteredOrganizations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        Aucune organisation trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredOrganizations.map(org => (
                                    <tr key={org.organizationId} className="hover:bg-glass/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-500/10">
                                                    <Building2 size={20} className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-main">{org.organizationName}</p>
                                                    <p className="text-sm text-text-muted">{org.organizationPhone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub">
                                            {org.organizationCity}, {org.organizationCountry}
                                        </td>
                                        <td className="px-6 py-4 text-text-sub">
                                            {org.organizationType || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={org.subscriptionPlan || 'BASIC'}
                                                onChange={(e) => handleChangePlan(org.organizationId, e.target.value as SubscriptionPlan)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getPlanColor(org.subscriptionPlan)}`}
                                            >
                                                <option value="BASIC">Basic</option>
                                                <option value="PROFESSIONAL">Professional</option>
                                                <option value="ENTERPRISE">Enterprise</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub text-sm">
                                            {formatDate(org.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedOrg(org)}
                                                    className="p-1.5 rounded hover:bg-glass text-text-muted hover:text-text-main transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteModal(org)}
                                                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedOrg && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-lg">
                        <div className="p-6 border-b border-glass flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-text-main">Détails de l'organisation</h2>
                            <button onClick={() => setSelectedOrg(null)} className="p-1 hover:bg-glass rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-text-muted">Nom</p>
                                    <p className="font-medium text-text-main">{selectedOrg.organizationName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Téléphone</p>
                                    <p className="font-medium text-text-main">{selectedOrg.organizationPhone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Adresse</p>
                                    <p className="font-medium text-text-main">{selectedOrg.organizationAddress || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Ville</p>
                                    <p className="font-medium text-text-main">{selectedOrg.organizationCity}, {selectedOrg.organizationCountry}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Type</p>
                                    <p className="font-medium text-text-main">{selectedOrg.organizationType || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">RCCM</p>
                                    <p className="font-medium text-text-main">{selectedOrg.registrationNumber || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">NIU</p>
                                    <p className="font-medium text-text-main">{selectedOrg.organizationUIN || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Abonnement</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(selectedOrg.subscriptionPlan)}`}>
                                        {selectedOrg.subscriptionPlan || 'BASIC'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-text-main mb-2">Supprimer l'organisation ?</h2>
                            <p className="text-text-muted mb-4">
                                Cette action supprimera définitivement "{showDeleteModal.organizationName}" et toutes ses données associées.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(null)}
                                    className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteModal.organizationId)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
