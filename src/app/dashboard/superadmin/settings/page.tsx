"use client";

import React, { useState, useEffect } from 'react';
import { User, Lock, Settings as SettingsIcon, Save, Globe, Smartphone, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import authApi from '@/services/authApi';
import { Language } from '@/types/enums';

export default function SuperAdminSettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const { theme } = useTheme();

    // State for profile form
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        language: 'FR'
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const user = authApi.getCurrentUser();
        if (user) {
            const u = (user as any).user || user;
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
            const lang: Language = profileData.language === 'ENG' ? Language.ENG : Language.FR;
            setLanguage(lang);
            setSuccess("Profil mis à jour avec succès !");
            setLoading(false);
            setTimeout(() => setSuccess(null), 3000);
        }, 800);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header section with refined typography */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-text-main flex items-center gap-3 tracking-tight">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                        <SettingsIcon className="h-7 w-7" />
                    </div>
                    Paramètres
                </h1>
                <p className="text-text-muted text-lg max-w-2xl leading-relaxed font-medium">
                    Gérez vos informations personnelles, vos préférences de sécurité et configurez votre interface.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Profile Summary Card - Left Mobile/Right Desktop Column */}
                <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
                    <div className="bg-surface relative overflow-hidden rounded-2xl border border-glass shadow-xl p-8 transition-all hover:shadow-2xl hover:border-cyan-500/20">
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl"></div>

                        <div className="relative flex flex-col items-center text-center">
                            <div className="relative mb-6 group">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                                    {profileData.firstName[0]}{profileData.lastName[0]}
                                </div>
                                <div className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-lg border-4 border-surface shadow-lg">
                                    <CheckCircle2 size={16} className="text-white" />
                                </div>
                            </div>

                            <h3 className="font-bold text-xl text-text-main leading-none mb-2">
                                {profileData.firstName} {profileData.lastName}
                            </h3>
                            <p className="text-cyan-600 font-bold text-sm bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">
                                Super Administrateur
                            </p>

                            <div className="w-full mt-8 pt-6 border-t border-glass space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">Compte</span>
                                    <span className="font-mono text-xs text-text-muted bg-glass px-2 py-0.5 rounded">ID-8829</span>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">État</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Actif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick System Card */}
                    <div className="bg-surface rounded-2xl border border-glass p-8 overflow-hidden relative">
                        <h3 className="font-bold text-text-main text-lg mb-6 flex items-center gap-2">
                            <Globe size={18} className="text-blue-500" />
                            Session
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                    <Mail size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-tighter">Email Principal</p>
                                    <p className="text-sm font-semibold text-text-main truncate italic">{profileData.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                                    <Shield size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-tighter">Sécurité</p>
                                    <p className="text-sm font-semibold text-text-main">Authentification standard</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Settings Column */}
                <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">

                    {/* Profile Information Block */}
                    <div className="bg-surface rounded-2xl border border-glass shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-glass flex items-center gap-4 bg-background/20">
                            <div className="p-2.5 rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                                <User size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-text-main">Informations Personnelles</h2>
                                <p className="text-sm text-text-muted font-medium">Modifiez vos détails d'identité et de contact</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                        className="w-full px-5 py-3 rounded-xl bg-background/50 border border-glass focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-medium text-text-main"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                        className="w-full px-5 py-3 rounded-xl bg-background/50 border border-glass focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-medium text-text-main"
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                                        Adresse Email
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-cyan-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full pl-12 pr-5 py-3 rounded-xl bg-glass text-text-muted border border-transparent cursor-not-allowed font-medium italic"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                                        Téléphone
                                    </label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-cyan-500 transition-colors" size={18} />
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full pl-12 pr-5 py-3 rounded-xl bg-background/50 border border-glass focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-medium text-text-main"
                                            placeholder="+237 ..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-glass">
                                <div className="space-y-2 w-full sm:w-2/3 lg:w-1/2">
                                    <label className="text-sm font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                                        Langue Préférée
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                                        <select
                                            value={profileData.language}
                                            onChange={e => setProfileData({ ...profileData, language: e.target.value })}
                                            className="w-full pl-12 pr-10 py-3 rounded-xl bg-background/50 border border-glass focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-medium text-text-main appearance-none cursor-pointer"
                                        >
                                            <option value="FR">🇫🇷 Français (Cameroun)</option>
                                            <option value="ENG">🇺🇸 English (Universal)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-2 border-r-2 border-text-muted w-2 h-2 rotate-45 transform"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                                </button>
                                {success && (
                                    <span className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-lg animate-fade-in text-sm ring-1 ring-green-500/20">
                                        <CheckCircle2 size={16} />
                                        {success}
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Security Section Block */}
                    <div className="bg-surface rounded-2xl border border-glass shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-glass flex items-center gap-4 bg-background/20">
                            <div className="p-2.5 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-text-main">Contrôles de Sécurité</h2>
                                <p className="text-sm text-text-muted font-medium">Sécurisez votre compte avec des informations robustes</p>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/5 dark:to-orange-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl transition-all hover:shadow-md">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-amber-900 dark:text-amber-400 text-lg flex items-center gap-2">
                                        <Lock size={18} />
                                        Mot de passe
                                    </h3>
                                    <p className="text-sm text-amber-800/70 dark:text-amber-300/60 font-medium">Pour protéger votre compte, utilisez un mot de passe complexe et changez-le régulièrement.</p>
                                </div>
                                <button className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl text-amber-900 dark:text-amber-400 font-bold transition-all shadow-sm">
                                    Mettre à jour
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
