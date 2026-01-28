"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import organizationApi from '@/services/organizationApi';
import { Organization, OrganizationUpdate } from '@/types';
import { Building2, MapPin, Phone, Globe, Shield, Calendar, CreditCard, Edit, X, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/axios';

export default function OrganizationPage() {
    const { t } = useLanguage();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchOrganization = async () => {
        try {
            const userStr = localStorage.getItem('fleetman-user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.organizationId) {
                    const org = await organizationApi.getById(user.organizationId);
                    setOrganization(org);
                }
            }
        } catch (error) {
            // Failed to fetch organization
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganization();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
        );
    }

    if (!organization) return null;

    // Secure logo URL construction
    const logoUrl = organization.logoUrl
        ? (organization.logoUrl.startsWith('http') || organization.logoUrl.startsWith('data:')
            ? organization.logoUrl
            : `${API_BASE_URL.replace(/\/$/, '')}/${organization.logoUrl.replace(/^\//, '')}`)
        : null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header / Hero */}
            <div className="relative rounded-2xl overflow-hidden bg-surface border border-glass shadow-sm">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-surface border-4 border-surface shadow-lg flex items-center justify-center overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt={organization.organizationName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-3xl font-bold text-secondary">
                                    {organization.organizationName.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pt-2 md:pt-0">
                            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                                {organization.organizationName}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${organization.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {organization.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </h1>
                            <p className="text-text-muted flex items-center gap-2 mt-1">
                                <Globe size={14} />
                                {organization.organizationDomainName || 'Pas de domaine'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors font-medium border border-secondary/20"
                        >
                            <Edit size={18} />
                            Modifier l'organisation
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* General Info */}
                <div className="bg-surface rounded-xl border border-glass p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                            <Building2 size={20} />
                        </div>
                        <h2 className="font-semibold text-lg text-text-main">A propos</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">Type</span>
                            <span className="text-sm font-medium text-text-main">{organization.organizationType}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">Téléphone</span>
                            <span className="text-sm font-medium text-text-main flex items-center gap-2">
                                <Phone size={14} className="text-text-sub" /> {organization.organizationPhone}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">Adresse</span>
                            <span className="text-sm font-medium text-text-main flex items-center gap-2">
                                <MapPin size={14} className="text-text-sub" /> {organization.organizationAddress}, {organization.organizationCity}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">Pays</span>
                            <span className="text-sm font-medium text-text-main">{organization.organizationCountry}</span>
                        </div>
                    </div>
                </div>

                {/* Legal Info */}
                <div className="bg-surface rounded-xl border border-glass p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <Shield size={20} />
                        </div>
                        <h2 className="font-semibold text-lg text-text-main">Légal</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">NIU</span>
                            <span className="text-sm font-medium text-text-main font-mono">{organization.organizationUIN}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">N° Enregistrement</span>
                            <span className="text-sm font-medium text-text-main font-mono">{organization.registrationNumber}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">N° Fiscal</span>
                            <span className="text-sm font-medium text-text-main font-mono">{organization.taxId || '-'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">Date de création</span>
                            <span className="text-sm font-medium text-text-main flex items-center gap-2">
                                <Calendar size={14} className="text-text-sub" /> {new Date(organization.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-surface rounded-xl border border-glass p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="font-semibold text-lg text-text-main">Abonnement</h2>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4">
                        <p className="text-xs font-medium opacity-80 mb-1">Plan Actuel</p>
                        <p className="text-2xl font-bold">{organization.subscriptionPlan}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-text-muted mb-1">Expiration</span>
                            <span className="text-sm font-medium text-text-main flex items-center gap-2">
                                <Calendar size={14} className="text-text-sub" /> {new Date(organization.subscriptionExpiry).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {showEditModal && (
                <EditOrganizationModal
                    organization={organization}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        fetchOrganization();
                        toast.success('Organisation mise à jour avec succès');
                    }}
                />
            )}
        </div>
    );
}

function EditOrganizationModal({ organization, onClose, onSuccess }: { organization: Organization; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<OrganizationUpdate>({
        organizationName: organization.organizationName || '',
        organizationDomainName: organization.organizationDomainName || '',
        organizationPhone: organization.organizationPhone || '',
        organizationAddress: organization.organizationAddress || '',
        organizationCity: organization.organizationCity || '',
        organizationCountry: organization.organizationCountry || '',
        registrationNumber: organization.registrationNumber || '',
        organizationUIN: organization.organizationUIN || '',
        taxId: organization.taxId || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await organizationApi.update(organization.organizationId, formData);
            onSuccess();
        } catch (err) {
            // Failed to update organization
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl border border-glass shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-glass flex items-center justify-between sticky top-0 bg-surface/95 backdrop-blur z-10">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Edit size={20} className="text-secondary" />
                        Modifier l'organisation
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-glass rounded-full text-text-muted transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="font-semibold text-text-main border-b border-glass pb-2">Informations Générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Nom</label>
                                <input
                                    type="text"
                                    value={formData.organizationName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Domaine</label>
                                <input
                                    type="text"
                                    value={formData.organizationDomainName || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationDomainName: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={formData.organizationPhone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationPhone: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-text-main border-b border-glass pb-2">Adresse</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-sub mb-1">Adresse</label>
                                <input
                                    type="text"
                                    value={formData.organizationAddress}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationAddress: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Ville</label>
                                <input
                                    type="text"
                                    value={formData.organizationCity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationCity: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Pays</label>
                                <input
                                    type="text"
                                    value={formData.organizationCountry}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationCountry: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-text-main border-b border-glass pb-2">Informations Légales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">NIU</label>
                                <input
                                    type="text"
                                    value={formData.organizationUIN}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationUIN: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">N° Enregistrement</label>
                                <input
                                    type="text"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-glass">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
