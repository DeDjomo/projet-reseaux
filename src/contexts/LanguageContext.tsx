'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'FR' | 'EN';

interface Translations {
    [key: string]: {
        FR: string;
        EN: string;
    };
}

// Translation dictionary
export const translations: Translations = {
    // Navigation
    'nav.features': { FR: 'Fonctionnalités', EN: 'Features' },
    'nav.stats': { FR: 'Statistiques', EN: 'Statistics' },
    'nav.register': { FR: 'Créer un compte', EN: 'Create account' },
    'nav.login': { FR: 'Se connecter', EN: 'Sign in' },

    // Hero Section
    'hero.badge': { FR: 'Gestion de flotte nouvelle génération', EN: 'Next-generation fleet management' },
    'hero.title.part1': { FR: 'La gestion de flotte', EN: 'Fleet management' },
    'hero.title.part2': { FR: 'et moderne', EN: 'and modern' },
    'hero.word1': { FR: 'intelligente', EN: 'intelligent' },
    'hero.word2': { FR: 'sécurisée', EN: 'secure' },
    'hero.word3': { FR: 'simplifiée', EN: 'simplified' },
    'hero.word4': { FR: 'fiable', EN: 'reliable' },
    'hero.word5': { FR: 'efficace', EN: 'efficient' },
    'hero.subtitle': {
        FR: 'FleetMan est la solution complète pour optimiser la gestion de votre flotte de véhicules. Suivez vos véhicules en temps réel, gérez vos chauffeurs, et prenez des décisions éclairées grâce à nos analyses avancées.',
        EN: 'FleetMan is the complete solution to optimize your vehicle fleet management. Track your vehicles in real time, manage your drivers, and make informed decisions with our advanced analytics.'
    },
    'hero.cta.register': { FR: 'Créer un compte gratuit', EN: 'Create free account' },
    'hero.cta.login': { FR: 'Se connecter', EN: 'Sign in' },

    // Features Section
    'features.title': { FR: 'Fonctionnalités puissantes', EN: 'Powerful Features' },
    'features.subtitle': {
        FR: 'Tout ce dont vous avez besoin pour gérer efficacement votre flotte de véhicules, au même endroit.',
        EN: 'Everything you need to efficiently manage your vehicle fleet, in one place.'
    },
    'features.tracking.title': { FR: 'Suivi en temps réel', EN: 'Real-time Tracking' },
    'features.tracking.desc': {
        FR: 'Visualisez la position exacte de tous vos véhicules sur une carte interactive. Suivez les trajets et optimisez vos itinéraires.',
        EN: 'View the exact position of all your vehicles on an interactive map. Track routes and optimize your itineraries.'
    },
    'features.drivers.title': { FR: 'Gestion des chauffeurs', EN: 'Driver Management' },
    'features.drivers.desc': {
        FR: 'Assignez des chauffeurs à vos véhicules, suivez leurs performances et gérez les plannings efficacement.',
        EN: 'Assign drivers to your vehicles, track their performance and manage schedules efficiently.'
    },
    'features.alerts.title': { FR: 'Alertes intelligentes', EN: 'Smart Alerts' },
    'features.alerts.desc': {
        FR: 'Recevez des notifications en temps réel pour les événements importants : maintenance, carburant bas, zones de géofencing.',
        EN: 'Receive real-time notifications for important events: maintenance, low fuel, geofencing zones.'
    },
    'features.analytics.title': { FR: 'Analyses avancées', EN: 'Advanced Analytics' },
    'features.analytics.desc': {
        FR: 'Tableaux de bord détaillés avec indicateurs clés : consommation de carburant, kilométrage, coûts de maintenance.',
        EN: 'Detailed dashboards with key indicators: fuel consumption, mileage, maintenance costs.'
    },
    'features.management.title': { FR: 'Gestion complète', EN: 'Complete Management' },
    'features.management.desc': {
        FR: 'Centralisez toutes les informations de vos véhicules : documents, assurances, historique de maintenance.',
        EN: 'Centralize all your vehicle information: documents, insurance, maintenance history.'
    },
    'features.security.title': { FR: 'Sécurité avancée', EN: 'Advanced Security' },
    'features.security.desc': {
        FR: "Données sécurisées et chiffrées. Contrôle d'accès par rôle pour protéger les informations sensibles.",
        EN: 'Secure and encrypted data. Role-based access control to protect sensitive information.'
    },

    // Stats Section
    'stats.availability': { FR: 'Disponibilité du service', EN: 'Service Availability' },
    'stats.realtime': { FR: 'Suivi en temps réel', EN: 'Real-time Tracking' },
    'stats.cost': { FR: 'Réduction des coûts', EN: 'Cost Reduction' },
    'stats.efficiency': { FR: 'Efficacité opérationnelle', EN: 'Operational Efficiency' },

    // CTA Section
    'cta.title': { FR: 'Prêt à optimiser votre flotte ?', EN: 'Ready to optimize your fleet?' },
    'cta.text': {
        FR: "Rejoignez FleetMan et transformez la gestion de vos véhicules dès aujourd'hui.",
        EN: 'Join FleetMan and transform your vehicle management today.'
    },
    'cta.hasAccount': { FR: "J'ai déjà un compte", EN: 'I already have an account' },

    // Footer
    'footer.copyright': {
        FR: 'FleetMan 2025 - Tous droits réservés | Solution de gestion de flotte intelligente',
        EN: 'FleetMan 2025 - All rights reserved | Intelligent fleet management solution'
    },

    // Theme
    'theme.light': { FR: 'Thème clair', EN: 'Light theme' },
    'theme.dark': { FR: 'Thème sombre', EN: 'Dark theme' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('FR');
    const [mounted, setMounted] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('fleetman-language') as Language;
        if (savedLang && (savedLang === 'FR' || savedLang === 'EN')) {
            setLanguageState(savedLang);
        }
    }, []);

    // Save language when it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('fleetman-language', language);
        }
    }, [language, mounted]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const toggleLanguage = () => {
        setLanguageState(prev => prev === 'FR' ? 'EN' : 'FR');
    };

    // Translation function
    const t = (key: string): string => {
        if (translations[key]) {
            return translations[key][language];
        }
        console.warn(`Translation missing for key: ${key}`);
        return key;
    };

    if (!mounted) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
