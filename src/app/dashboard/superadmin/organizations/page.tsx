"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Search, MoreVertical, Trash2, CreditCard, PauseCircle, PlayCircle, X, AlertTriangle, Clock, Car, Users, LayoutGrid, CheckCircle, AlertCircle as IncidentIcon } from 'lucide-react';
import organizationApi from '@/services/organizationApi';
import { Organization } from '@/types';
import toast from 'react-hot-toast';

// Modal de confirmation (Reused)
interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

function ConfirmModal({ isOpen, title, message, confirmText, confirmColor = 'bg-red-600 hover:bg-red-700', onConfirm, onCancel, loading }: ConfirmModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-surface rounded-lg shadow-xl border border-glass w-full max-w-md mx-4 animate-fade-in">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-main">{title}</h3>
                    </div>
                    <p className="text-text-sub mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg border border-glass hover:bg-glass transition-colors"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-lg text-white transition-colors ${confirmColor}`}
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal de suspension simplifié
interface SuspendModalProps {
    isOpen: boolean;
    organization: Organization | null;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

function SuspendModal({ isOpen, organization, onConfirm, onCancel, loading }: SuspendModalProps) {
    if (!isOpen || !organization) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-xl shadow-2xl border border-glass w-full max-w-md mx-4 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <PauseCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-text-main">Suspendre l'organisation</h3>
                    </div>

                    <p className="text-sm text-text-sub mb-6">
                        Êtes-vous sûr de vouloir suspendre <strong>{organization.organizationName}</strong> ?
                        L'accès à la plateforme sera immédiatement bloqué pour tous ses utilisateurs.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-lg border border-glass hover:bg-glass font-medium transition-all"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/20"
                            disabled={loading}
                        >
                            {loading ? 'Suspension...' : 'Suspendre'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal de suppression avancée
interface DeleteOrgModalProps {
    isOpen: boolean;
    organization: Organization | null;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

function DeleteOrgModal({ isOpen, organization, onConfirm, onCancel, loading }: DeleteOrgModalProps) {
    const [confirmName, setConfirmName] = React.useState('');

    React.useEffect(() => {
        if (isOpen) setConfirmName('');
    }, [isOpen]);

    if (!isOpen || !organization) return null;

    const isMatch = confirmName.trim().toLowerCase() === organization.organizationName.toLowerCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="bg-surface rounded-xl shadow-2xl border border-glass w-full max-w-md mx-4 overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <AlertTriangle size={24} />
                        <h3 className="text-xl font-bold">Suppression Définitive</h3>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-6">
                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                            Attention: Cette action est irréversible. Elle supprimera définitivement l'organisation <strong>{organization.organizationName}</strong> ainsi que toutes ses flottes, véhicules, chauffeurs et historiques d'incidents.
                        </p>
                    </div>

                    <p className="text-sm text-text-main mb-4">
                        Pour confirmer les conséquences liées à la suppression, veuillez saisir le nom de l'organisation : <strong>{organization.organizationName}</strong>
                    </p>

                    <input
                        autoFocus
                        type="text"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder="Saisissez le nom ici"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-glass focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all mb-6 font-medium text-text-main"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl border border-glass hover:bg-glass font-bold transition-all text-text-sub"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!isMatch || loading}
                            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${isMatch ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20' : 'bg-gray-400 cursor-not-allowed opacity-50'}`}
                        >
                            {loading ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal de liste des administrateurs
interface AdminListModalProps {
    isOpen: boolean;
    organization: Organization | null;
    onClose: () => void;
}

function AdminListModal({ isOpen, organization, onClose }: AdminListModalProps) {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && organization) {
            setLoading(true);
            organizationApi.getAdmins(organization.organizationId)
                .then(setAdmins)
                .catch(err => console.error("Failed to fetch admins", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, organization]);

    if (!isOpen || !organization) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-xl shadow-2xl border border-glass w-full max-w-2xl mx-4 animate-scale-in max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-glass">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Administrateurs - {organization.organizationName}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-glass rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="py-12 text-center text-text-muted text-sm tracking-wide">Chargement des administrateurs...</div>
                    ) : (admins || []).length === 0 ? (
                        <div className="py-12 text-center text-text-muted text-sm tracking-wide">Aucun administrateur trouvé pour cette organisation.</div>
                    ) : (
                        <div className="grid gap-3">
                            {(admins || []).map(admin => (
                                <div key={admin.adminId} className="flex items-center justify-between p-4 rounded-lg bg-glass/20 border border-glass hover:bg-glass/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold uppercase shadow-sm">
                                            {admin.adminFirstName?.[0] || '?'}{admin.adminLastName?.[0] || '?'}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-text-main text-sm">{admin.adminFirstName} {admin.adminLastName}</div>
                                            <div className="text-xs text-text-sub opacity-80">{admin.adminEmail}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 inline-block font-medium uppercase tracking-tight">
                                            {admin.adminRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Gestionnaire'}
                                        </div>
                                        <div className="text-[9px] text-text-muted mt-1 uppercase tracking-tighter opacity-70">
                                            Statut: {admin.adminState || 'ACTIF'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-glass flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-glass hover:bg-glass/50 text-text-main font-medium transition-colors text-sm"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

interface OrgStats {
    fleets: number;
    vehicles: number;
    drivers: number;
    incidents: number;
}

export default function OrganizationsPage() {
    const { t } = useLanguage();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [deletedCount, setDeletedCount] = useState(0);
    const [stats, setStats] = useState<Record<number, OrgStats>>({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    // Modals
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; org: Organization | null }>({ isOpen: false, org: null });
    const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; org: Organization | null }>({ isOpen: false, org: null });
    const [adminListModal, setAdminListModal] = useState<{ isOpen: boolean; org: Organization | null }>({ isOpen: false, org: null });

    useEffect(() => {
        fetchOrganizationsAndStats();
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

    const fetchOrganizationsAndStats = async () => {
        try {
            setLoading(true);
            const [data, delCount] = await Promise.all([
                organizationApi.getAll(),
                organizationApi.countDeleted()
            ]);
            const orgs = Array.isArray(data) ? data : [];
            setOrganizations(orgs);
            setFilteredOrgs(orgs);
            setDeletedCount(delCount);

            // Fetch stats in parallel for visible orgs (fetching all for now as pagination is client side)
            // Warning: Limit concurrent requests if list is huge.
            const statsMap: Record<number, OrgStats> = {};

            await Promise.all(orgs.map(async (org) => {
                try {
                    const [fleets, vehicles, drivers, incidents] = await Promise.all([
                        organizationApi.countFleets(org.organizationId).catch(() => 0),
                        organizationApi.countVehicles(org.organizationId).catch(() => 0),
                        organizationApi.countDrivers(org.organizationId).catch(() => 0),
                        organizationApi.countIncidents(org.organizationId).catch(() => 0)
                    ]);
                    statsMap[org.organizationId] = { fleets, vehicles, drivers, incidents };
                } catch (e) {
                    console.error(`Stats error for org ${org.organizationId}`, e);
                    statsMap[org.organizationId] = { fleets: 0, vehicles: 0, drivers: 0, incidents: 0 };
                }
            }));

            setStats(statsMap);

        } catch (error) {
            console.error("Failed to fetch organizations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.org) return;
        setActionLoading(true);
        try {
            await organizationApi.delete(deleteModal.org.organizationId);
            // Quick update without full refetch
            const newOrgs = organizations.filter(o => o.organizationId !== deleteModal.org!.organizationId);
            setOrganizations(newOrgs);
            setFilteredOrgs(newOrgs);
            setDeleteModal({ isOpen: false, org: null });
            toast.success(`Organisation "${deleteModal.org.organizationName}" supprimée définitivement`);
            // Trigger full refresh to be safe
            await fetchOrganizationsAndStats();
        } catch (error) {
            console.error("Failed to delete organization", error);
            toast.error("Échec de la suppression de l'organisation");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!suspendModal.org) return;
        setActionLoading(true);
        try {
            await organizationApi.update(suspendModal.org.organizationId, {
                organizationName: suspendModal.org.organizationName,
                organizationUIN: suspendModal.org.organizationUIN,
                organizationPhone: suspendModal.org.organizationPhone,
                organizationAddress: suspendModal.org.organizationAddress,
                organizationCity: suspendModal.org.organizationCity,
                organizationCountry: suspendModal.org.organizationCountry,
                organizationType: suspendModal.org.organizationType,
                subscriptionPlan: suspendModal.org.subscriptionPlan,
                createdByAdminId: suspendModal.org.createdByAdminId,
                isActive: false
            });
            await fetchOrganizationsAndStats();
            setSuspendModal({ isOpen: false, org: null });
            toast.success(`Organisation "${suspendModal.org.organizationName}" suspendue avec succès`);
        } catch (error) {
            console.error("Failed to suspend organization", error);
            toast.error("Échec de la suspension de l'organisation");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async (org: Organization) => {
        setActionLoading(true);
        try {
            await organizationApi.update(org.organizationId, {
                organizationName: org.organizationName,
                organizationUIN: org.organizationUIN,
                organizationPhone: org.organizationPhone,
                organizationAddress: org.organizationAddress,
                organizationCity: org.organizationCity,
                organizationCountry: org.organizationCountry,
                organizationType: org.organizationType,
                subscriptionPlan: org.subscriptionPlan,
                createdByAdminId: org.createdByAdminId,
                isActive: !org.isActive
            });
            await fetchOrganizationsAndStats();
        } catch (error) {
            console.error("Failed to toggle organization status", error);
        } finally {
            setActionLoading(false);
            setActionMenuOpen(null);
        }
    };

    const getSubscriptionBadge = (plan: string) => {
        const styles: Record<string, string> = {
            FREE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            BASIC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            PROFESSIONAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            ENTERPRISE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        };
        return styles[plan] || styles.FREE;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    // Stats Global
    const totalOrgs = organizations.length;
    const activeOrgs = organizations.filter(o => o.isActive).length;
    const suspendedOrgs = organizations.filter(o => !o.isActive).length;
    const expiredOrgs = organizations.filter(o => o.subscriptionExpiry && new Date(o.subscriptionExpiry) < new Date()).length;

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
                        Gestion des organisations et statistiques détaillées
                    </p>
                </div>

            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="bg-surface rounded-2xl border border-glass p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg text-white">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-sub uppercase tracking-wider">Total</p>
                            <p className="text-3xl font-black text-text-main">{totalOrgs}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-glass p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg text-white">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-sub uppercase tracking-wider">Actives</p>
                            <p className="text-3xl font-black text-green-500">{activeOrgs}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-glass p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg text-white">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-sub uppercase tracking-wider">Suspendues</p>
                            <p className="text-3xl font-black text-orange-500">{suspendedOrgs}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-glass p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg text-white">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-sub uppercase tracking-wider">Supprimées</p>
                            <p className="text-3xl font-black text-red-500">{deletedCount}</p>
                        </div>
                    </div>
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
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none"
                        />
                    </div>
                    <span className="text-sm text-text-sub">
                        {filteredOrgs.length} résultat(s)
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-text-main font-semibold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Organisation</th>
                                <th className="px-4 py-3 text-center" title="Flottes">
                                    <LayoutGrid size={16} className="mx-auto" />
                                </th>
                                <th className="px-4 py-3 text-center" title="Véhicules">
                                    <Car size={16} className="mx-auto" />
                                </th>
                                <th className="px-4 py-3 text-center" title="Chauffeurs">
                                    <Users size={16} className="mx-auto" />
                                </th>
                                <th className="px-4 py-3 text-center" title="Incidents">
                                    <IncidentIcon size={16} className="mx-auto" />
                                </th>
                                <th className="px-6 py-3">Statut</th>
                                <th className="px-6 py-3">Créée le</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass text-text-main">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-text-main">
                                        Chargement des données...
                                    </td>
                                </tr>
                            ) : filteredOrgs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-text-main">
                                        Aucune organisation trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredOrgs.map((org) => {
                                    const orgStats = stats[org.organizationId] || { fleets: 0, vehicles: 0, drivers: 0, incidents: 0 };
                                    return (
                                        <tr key={org.organizationId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${org.isActive
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                        }`}>
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div>
                                                        <div className={!org.isActive ? 'text-text-muted' : ''}>{org.organizationName}</div>
                                                        <div className="text-xs text-text-sub">{org.organizationType || 'Autre'} • {org.subscriptionPlan}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Stats Counters */}
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded text-xs font-medium ${orgStats.fleets > 0 ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' : 'text-text-muted'}`}>
                                                    {orgStats.fleets}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded text-xs font-medium ${orgStats.vehicles > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-text-muted'}`}>
                                                    {orgStats.vehicles}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded text-xs font-medium ${orgStats.drivers > 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-text-muted'}`}>
                                                    {orgStats.drivers}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded text-xs font-medium ${orgStats.incidents > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'text-text-muted'}`}>
                                                    {orgStats.incidents}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${org.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}>
                                                    {org.isActive ? 'Active' : 'Suspendue'}
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
                                                    <div className="absolute right-6 top-12 z-10 w-52 bg-surface border border-glass rounded-lg shadow-lg py-1">
                                                        <button
                                                            onClick={() => {
                                                                setAdminListModal({ isOpen: true, org });
                                                                setActionMenuOpen(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2"
                                                        >
                                                            <Users size={16} />
                                                            Voir les administrateurs
                                                        </button>
                                                        <hr className="my-1 border-glass" />
                                                        {org.isActive ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSuspendModal({ isOpen: true, org });
                                                                    setActionMenuOpen(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2 text-orange-500"
                                                            >
                                                                <PauseCircle size={16} />
                                                                Suspendre
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggleActive(org)}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-glass flex items-center gap-2 text-green-500"
                                                            >
                                                                <PlayCircle size={16} />
                                                                Remettre active
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setDeleteModal({ isOpen: true, org });
                                                                setActionMenuOpen(null);
                                                            }}
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

            {/* Delete Confirmation Modal */}
            <DeleteOrgModal
                isOpen={deleteModal.isOpen}
                organization={deleteModal.org}
                onConfirm={() => handleDelete()}
                onCancel={() => setDeleteModal({ isOpen: false, org: null })}
                loading={actionLoading}
            />

            {/* Suspend Modal */}
            <AdminListModal
                isOpen={adminListModal.isOpen}
                organization={adminListModal.org}
                onClose={() => setAdminListModal({ isOpen: false, org: null })}
            />

            <SuspendModal
                isOpen={suspendModal.isOpen}
                organization={suspendModal.org}
                onConfirm={() => handleSuspend()}
                onCancel={() => setSuspendModal({ isOpen: false, org: null })}
                loading={actionLoading}
            />
        </div>
    );
}
