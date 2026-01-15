"use client";

import { Settings, Shield, Moon, Sun, Globe, Bell, Lock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                    <Settings className="text-purple-500" />
                    Paramètres système
                </h1>
                <p className="text-text-muted mt-1">
                    Configurez les paramètres globaux de la plateforme
                </p>
            </div>

            {/* Settings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appearance */}
                <div className="bg-surface border border-glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        Apparence
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-main">Thème</p>
                                <p className="text-sm text-text-muted">Basculer entre le mode clair et sombre</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-purple-500' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Language */}
                <div className="bg-surface border border-glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        <Globe size={20} />
                        Langue
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-main">Langue de l'interface</p>
                                <p className="text-sm text-text-muted">Français / Anglais</p>
                            </div>
                            <button
                                onClick={toggleLanguage}
                                className="px-4 py-2 bg-purple-500/20 text-purple-500 rounded-lg font-medium hover:bg-purple-500/30 transition"
                            >
                                {language === 'fr' ? 'Français' : 'English'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Platform Info */}
                <div className="bg-surface border border-glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        <Shield size={20} />
                        À propos de FleetMan
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-text-muted">Version</span>
                            <span className="font-medium text-text-main">1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Environnement</span>
                            <span className="font-medium text-text-main">Production</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Backend</span>
                            <span className="font-medium text-green-500">Connecté</span>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-surface border border-glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        <Lock size={20} />
                        Sécurité
                    </h2>
                    <div className="space-y-3">
                        <p className="text-text-muted text-sm">
                            Les paramètres de sécurité avancés seront disponibles dans une prochaine version.
                        </p>
                        <ul className="text-sm text-text-sub space-y-2">
                            <li>• Authentification à deux facteurs</li>
                            <li>• Journaux d'audit</li>
                            <li>• Politique de mots de passe</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
