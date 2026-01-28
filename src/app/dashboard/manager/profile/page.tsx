"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminApi } from '@/services/adminApi';
import { Admin, AdminUpdate, Gender, AdminRole } from '@/types';
import { User, Mail, Phone, MapPin, BadgeCheck, Calendar, Shield, Building, Edit, X, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { t } = useLanguage();
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);

    const fetchProfile = async () => {
        try {
            const userStr = localStorage.getItem('fleetman-user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const data = await adminApi.getById(user.userId);
                setAdmin(data);
            }
        } catch (error) {
            // Failed to fetch profile
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
        );
    }

    if (!admin) return null;

    const sections = [
        {
            title: "Informations Personnelles",
            icon: User,
            items: [
                { label: "Nom complet", value: `${admin.adminFirstName} ${admin.adminLastName}`, icon: User },
                { label: "Genre", value: admin.gender, icon: User },
            ]
        },
        {
            title: "Coordonnées",
            icon: Phone,
            items: [
                { label: "Email", value: admin.adminEmail, icon: Mail },
                { label: "Téléphone", value: admin.adminPhoneNumber || '-', icon: Phone },
                { label: "Adresse", value: admin.personalAddress || '-', icon: MapPin },
                { label: "Ville", value: `${admin.personalCity || ''} ${admin.personalCountry ? `(${admin.personalCountry})` : ''}`, icon: MapPin },
            ]
        },
        {
            title: "Informations Légales",
            icon: Shield,
            items: [
                { label: "CNI", value: admin.adminIdCardNumber || '-', icon: BadgeCheck },
                { label: "Numéro Fiscal", value: admin.taxNumber || '-', icon: Building },
                { label: "NIU", value: admin.niu || '-', icon: Building },
            ]
        },
        {
            title: "Compte",
            icon: Calendar,
            items: [
                { label: "Rôle", value: admin.adminRole, icon: Shield },
                { label: "Membre depuis", value: new Date(admin.createdAt).toLocaleDateString(), icon: Calendar },
                { label: "Dernière connexion", value: admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : '-', icon: Calendar },
                { label: "Organisation", value: admin.organizationName || '-', icon: Building },
            ]
        }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header / Hero */}
            <div className="relative rounded-2xl overflow-hidden bg-surface border border-glass shadow-sm">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-surface border-4 border-surface shadow-lg flex items-center justify-center text-3xl font-bold text-secondary">
                            {admin.adminFirstName[0]}{admin.adminLastName[0]}
                        </div>
                        <div className="flex-1 pt-2 md:pt-0">
                            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                                {admin.adminFirstName} {admin.adminLastName}
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase">
                                    {admin.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </h1>
                            <p className="text-text-muted">{admin.adminRole} • {admin.organizationName}</p>
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors font-medium border border-secondary/20"
                        >
                            <Edit size={18} />
                            Modifier le profil
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-surface rounded-xl border border-glass p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                                <section.icon size={20} />
                            </div>
                            <h2 className="font-semibold text-lg text-text-main">{section.title}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1">
                                        {/* <item.icon size={12} className="opacity-70" /> */}
                                        {item.label}
                                    </span>
                                    <span className="text-sm font-medium text-text-main truncate" title={item.value?.toString()}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showEditModal && (
                <EditProfileModal
                    admin={admin}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        fetchProfile();
                        toast.success('Profil mis à jour avec succès');
                    }}
                />
            )}
        </div>
    );
}

function EditProfileModal({ admin, onClose, onSuccess }: { admin: Admin; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<AdminUpdate>({
        adminFirstName: admin.adminFirstName,
        adminLastName: admin.adminLastName,
        adminPhoneNumber: admin.adminPhoneNumber,
        gender: admin.gender,
        personalAddress: admin.personalAddress,
        personalCity: admin.personalCity,
        personalPostalCode: admin.personalPostalCode,
        personalCountry: admin.personalCountry,
        adminIdCardNumber: admin.adminIdCardNumber,
        taxNumber: admin.taxNumber,
        niu: admin.niu
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await adminApi.update(admin.adminId, formData);
            onSuccess();
        } catch (err) {
            // Failed to update profile
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
                        Modifier le profil
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
                        <h3 className="font-semibold text-text-main border-b border-glass pb-2">Informations Personnelles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Prénom</label>
                                <input
                                    type="text"
                                    value={formData.adminFirstName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, adminFirstName: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Nom</label>
                                <input
                                    type="text"
                                    value={formData.adminLastName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, adminLastName: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={formData.adminPhoneNumber || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, adminPhoneNumber: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Genre</label>
                                <select
                                    value={formData.gender || Gender.MALE}
                                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                >
                                    <option value={Gender.MALE}>Homme</option>
                                    <option value={Gender.FEMALE}>Femme</option>
                                </select>
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
                                    value={formData.personalAddress || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, personalAddress: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Ville</label>
                                <input
                                    type="text"
                                    value={formData.personalCity || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, personalCity: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Pays</label>
                                <input
                                    type="text"
                                    value={formData.personalCountry || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, personalCountry: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-text-main border-b border-glass pb-2">Informations Légales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">CNI / Passeport</label>
                                <input
                                    type="text"
                                    value={formData.adminIdCardNumber || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, adminIdCardNumber: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">NIU</label>
                                <input
                                    type="text"
                                    value={formData.niu || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, niu: e.target.value }))}
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
