"use client";

import React, { useState, useEffect } from 'react';
import { User, Lock, Settings as SettingsIcon, Save, Globe, Smartphone, Mail, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import authApi from '@/services/authApi';
import { Language } from '@/types/enums';

export default function SuperAdminSettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    // const { theme, toggleTheme } = useTheme(); // Theme not used in this simplified view yet

    // State for profile form
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        language: 'FR' // Default to string, will cast to Enum
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const user = authApi.getCurrentUser();
        if (user) {
            // Note: LoginResponse structure depends on backend. 
            // Assuming user object is directly in specific fields or "user" property.
            // Adjust based on LoginResponse type. 
            // Based on authApi.ts, it stores "LoginResponse".
            // Let's assume LoginResponse includes specific fields.
            // If user is inside user property:
            const u = (user as any).user || user; // Fallback
            setProfileData({
                firstName: u.adminFirstName || u.managerFirstName || u.firstName || 'Super',
                lastName: u.adminLastName || u.managerLastName || u.lastName || 'Admin',
                email: u.email || u.adminEmail || u.managerEmail || '',
                phone: u.phone || u.adminPhoneNumber || u.managerPhoneNumber || '',
                language: (u.language as string) || 'FR'
            });
        }
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulation d'une sauvegarde API
        setTimeout(() => {
            // Helper to cast string to Language enum safely
            const lang: Language = profileData.language === 'ENG' ? Language.ENG : Language.FR;
            setLanguage(lang);
            setSuccess("Profil mis à jour avec succès !");
            setLoading(false);
            setTimeout(() => setSuccess(null), 3000);
        }, 800);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <SettingsIcon className="h-7 w-7 text-gray-500" />
                        Paramètres
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Gestion du compte Super Admin et préférences
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Settings Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Profile Card */}
                    <div className="bg-surface rounded-xl border border-glass overflow-hidden">
                        <div className="px-6 py-4 border-b border-glass bg-background/50 flex justify-between items-center">
                            <h2 className="font-semibold text-text-main flex items-center gap-2">
                                <User size={18} className="text-purple-500" />
                                Informations Personnelles
                            </h2>
                        </div>
                        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">Nom</label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">
                                        <Mail size={14} className="inline mr-1" /> Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg bg-glass text-text-muted border border-transparent cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">
                                        <Smartphone size={14} className="inline mr-1" /> Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <hr className="border-glass my-2" />

                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">
                                    <Globe size={14} className="inline mr-1" /> Langue Interface
                                </label>
                                <select
                                    value={profileData.language}
                                    onChange={e => setProfileData({ ...profileData, language: e.target.value })}
                                    className="w-full sm:w-1/2 px-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                >
                                    <option value="FR">Français</option>
                                    <option value="ENG">English</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                                {success && <span className="ml-3 text-green-500 text-sm animate-fade-in">{success}</span>}
                            </div>
                        </form>
                    </div>

                    {/* Security Card */}
                    <div className="bg-surface rounded-xl border border-glass overflow-hidden">
                        <div className="px-6 py-4 border-b border-glass bg-background/50 flex justify-between items-center">
                            <h2 className="font-semibold text-text-main flex items-center gap-2">
                                <Shield size={18} className="text-green-500" />
                                Sécurité
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-orange-900 dark:text-orange-400">Mot de passe</h3>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">Dernière modification il y a 3 mois</p>
                                </div>
                                <button className="px-4 py-2 bg-background border border-glass hover:bg-glass rounded-lg text-sm font-medium transition-colors">
                                    Changer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Info Column */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                {profileData.firstName[0]}{profileData.lastName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{profileData.firstName} {profileData.lastName}</h3>
                                <p className="text-purple-200 text-sm">Super Administrator</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-purple-100">
                            <p className="flex justify-between">
                                <span>Rôle:</span>
                                <span className="font-medium bg-white/20 px-2 rounded">SUPER_ADMIN</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Status:</span>
                                <span className="font-medium text-green-300">Actif</span>
                            </p>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-surface rounded-xl border border-glass p-6">
                        <h3 className="font-semibold text-text-main mb-4">Information Système</h3>
                        <ul className="space-y-3 text-sm text-text-sub">
                            <li className="flex justify-between">
                                <span>Version Frontend</span>
                                <span className="font-mono text-text-muted">v2.1.0</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Version Backend</span>
                                <span className="font-mono text-text-muted">v1.1.0-beta</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Environnement</span>
                                <span className="font-mono text-green-500">Production</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
