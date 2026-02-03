'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';

interface Translations {
    [key: string]: {
        FR: string;
        ENG: string;
    };
}

// Translation dictionary
export const translations: Translations = {
    // Navigation
    'nav.features': { FR: 'Fonctionnalités', ENG: 'Features' },
    'nav.stats': { FR: 'Statistiques', ENG: 'Statistics' },
    'nav.register': { FR: 'Créer un compte', ENG: 'Create account' },
    'nav.login': { FR: 'Se connecter', ENG: 'Sign in' },

    // Hero Section
    'hero.badge': { FR: 'Gestion de flotte nouvelle génération', ENG: 'Next-generation fleet management' },
    'hero.title.part1': { FR: 'La gestion de flotte', ENG: 'Fleet management' },
    'hero.title.part2': { FR: 'et moderne', ENG: 'and modern' },
    'hero.word1': { FR: 'intelligente', ENG: 'intelligent' },
    'hero.word2': { FR: 'sécurisée', ENG: 'secure' },
    'hero.word3': { FR: 'simplifiée', ENG: 'simplified' },
    'hero.word4': { FR: 'fiable', ENG: 'reliable' },
    'hero.word5': { FR: 'efficace', ENG: 'efficient' },
    'hero.subtitle': {
        FR: 'FleetMan est la solution complète pour optimiser la gestion de votre flotte de véhicules. Suivez vos véhicules en temps réel, gérez vos chauffeurs, et prenez des décisions éclairées grâce à nos analyses avancées.',
        ENG: 'FleetMan is the complete solution to optimize your vehicle fleet management. Track your vehicles in real time, manage your drivers, and make informed decisions with our advanced analytics.'
    },
    'hero.cta.register': { FR: 'Créer un compte gratuit', ENG: 'Create free account' },
    'hero.cta.login': { FR: 'Se connecter', ENG: 'Sign in' },

    // Features Section
    'features.title': { FR: 'Fonctionnalités puissantes', ENG: 'Powerful Features' },
    'features.subtitle': {
        FR: 'Tout ce dont vous avez besoin pour gérer efficacement votre flotte de véhicules, au même endroit.',
        ENG: 'Everything you need to efficiently manage your vehicle fleet, in one place.'
    },
    'features.tracking.title': { FR: 'Suivi en temps réel', ENG: 'Real-time Tracking' },
    'features.tracking.desc': {
        FR: 'Visualisez la position exacte de tous vos véhicules sur une carte interactive. Suivez les trajets et optimisez vos itinéraires.',
        ENG: 'View the exact position of all your vehicles on an interactive map. Track routes and optimize your itineraries.'
    },
    'features.drivers.title': { FR: 'Gestion des chauffeurs', ENG: 'Driver Management' },
    'features.drivers.desc': {
        FR: 'Assignez des chauffeurs à vos véhicules, suivez leurs performances et gérez les plannings efficacement.',
        ENG: 'Assign drivers to your vehicles, track their performance and manage schedules efficiently.'
    },
    'features.alerts.title': { FR: 'Alertes intelligentes', ENG: 'Smart Alerts' },
    'features.alerts.desc': {
        FR: 'Recevez des notifications en temps réel pour les événements importants : maintenance, carburant bas, zones de géofencing.',
        ENG: 'Receive real-time notifications for important events: maintenance, low fuel, geofencing zones.'
    },
    'features.analytics.title': { FR: 'Analyses avancées', ENG: 'Advanced Analytics' },
    'features.analytics.desc': {
        FR: 'Tableaux de bord détaillés avec indicateurs clés : consommation de carburant, kilométrage, coûts de maintenance.',
        ENG: 'Detailed dashboards with key indicators: fuel consumption, mileage, maintenance costs.'
    },
    'features.management.title': { FR: 'Gestion complète', ENG: 'Complete Management' },
    'features.management.desc': {
        FR: 'Centralisez toutes les informations de vos véhicules : documents, assurances, historique de maintenance.',
        ENG: 'Centralize all your vehicle information: documents, insurance, maintenance history.'
    },
    'features.security.title': { FR: 'Sécurité avancée', ENG: 'Advanced Security' },
    'features.security.desc': {
        FR: "Données sécurisées et chiffrées. Contrôle d'accès par rôle pour protéger les informations sensibles.",
        ENG: 'Secure and encrypted data. Role-based access control to protect sensitive information.'
    },

    // Stats Section
    'stats.availability': { FR: 'Disponibilité du service', ENG: 'Service Availability' },
    'stats.realtime': { FR: 'Suivi en temps réel', ENG: 'Real-time Tracking' },
    'stats.cost': { FR: 'Réduction des coûts', ENG: 'Cost Reduction' },
    'stats.efficiency': { FR: 'Efficacité opérationnelle', ENG: 'Operational Efficiency' },

    // CTA Section
    'cta.title': { FR: 'Prêt à optimiser votre flotte ?', ENG: 'Ready to optimize your fleet?' },
    'cta.text': {
        FR: "Rejoignez FleetMan et transformez la gestion de vos véhicules dès aujourd'hui.",
        ENG: 'Join FleetMan and transform your vehicle management today.'
    },
    'cta.hasAccount': { FR: "J'ai déjà un compte", ENG: 'I already have an account' },

    // Footer
    'footer.copyright': {
        FR: 'FleetMan 2025 - Tous droits réservés | Solution de gestion de flotte intelligente',
        ENG: 'FleetMan 2025 - All rights reserved | Intelligent fleet management solution'
    },

    // Theme
    'theme.light': { FR: 'Thème clair', ENG: 'Light theme' },
    'theme.dark': { FR: 'Thème sombre', ENG: 'Dark theme' },

    // Form - Common
    'form.email': { FR: 'Email', ENG: 'Email' },
    'form.password': { FR: 'Mot de passe', ENG: 'Password' },
    'form.confirmPassword': { FR: 'Confirmer le mot de passe', ENG: 'Confirm Password' },
    'form.firstName': { FR: 'Prénom', ENG: 'First Name' },
    'form.lastName': { FR: 'Nom', ENG: 'Last Name' },
    'form.phone': { FR: 'Téléphone', ENG: 'Phone' },
    'form.address': { FR: 'Adresse', ENG: 'Address' },
    'form.city': { FR: 'Ville', ENG: 'City' },
    'form.postalCode': { FR: 'Code Postal', ENG: 'Postal Code' },
    'form.country': { FR: 'Pays', ENG: 'Country' },
    'form.next': { FR: 'Suivant', ENG: 'Next' },
    'form.previous': { FR: 'Précédent', ENG: 'Previous' },
    'form.submit': { FR: 'Valider', ENG: 'Submit' },
    'form.loading': { FR: 'Chargement...', ENG: 'Loading...' },
    'form.login': { FR: 'Se connecter', ENG: 'Login' },
    'form.register': { FR: "S'inscrire", ENG: 'Register' },

    // Register Page
    'register.title': { FR: 'Créer un compte Organisation', ENG: 'Create Organization Account' },
    'register.hasAccount': { FR: 'connectez-vous si vous avez déjà un compte', ENG: 'sign in if you already have an account' },
    'register.step1': { FR: 'Vos Informations', ENG: 'Your Info' },
    'register.step1.desc': { FR: "Identité de l'administrateur", ENG: 'Administrator Identity' },
    'register.step2': { FR: 'Compte', ENG: 'Account' },
    'register.step2.desc': { FR: 'Sécurité du compte', ENG: 'Account Security' },
    'register.step3': { FR: 'Organisation', ENG: 'Organization' },
    'register.step3.desc': { FR: 'Détails de votre entreprise', ENG: 'Company Details' },
    'register.step4': { FR: 'Validation', ENG: 'Review' },
    'register.step4.desc': { FR: 'Récapitulatif', ENG: 'Summary' },

    // Login Page
    'login.title': { FR: 'Connexion', ENG: 'Sign in to your account' },
    'login.subtitle': { FR: 'Ou', ENG: 'Or' },
    'login.createAccount': { FR: 'créer un nouveau compte', ENG: 'create a new account' },
    'login.forgotPassword': { FR: 'Mot de passe oublié ?', ENG: 'Forgot password?' },
    'login.rememberMe': { FR: 'Se souvenir de moi', ENG: 'Remember me' },

    // Dashboard - Sidebar
    'sidebar.dashboard': { FR: 'Mon Dashboard', ENG: 'My Dashboard' },
    'sidebar.fleets': { FR: 'Mes Flottes', ENG: 'My Fleets' },
    'sidebar.vehicles': { FR: 'Mes Véhicules', ENG: 'My Vehicles' },
    'sidebar.drivers': { FR: 'Mes Chauffeurs', ENG: 'My Drivers' },
    'sidebar.managers': { FR: 'Mes Gestionnaires', ENG: 'My Managers' },

    'sidebar.incidents': { FR: 'Incidents', ENG: 'Incidents' },

    // Incidents Page
    'incidents.title': { FR: 'Incidents', ENG: 'Incidents' },
    'incidents.subtitle': { FR: 'Suivi des incidents et alertes', ENG: 'Track incidents and alerts' },
    'incidents.loadError': { FR: 'Erreur lors du chargement des incidents', ENG: 'Error loading incidents' },
    'incidents.resolveSuccess': { FR: 'Incident résolu', ENG: 'Incident resolved' },
    'incidents.resolveError': { FR: 'Erreur lors de la résolution', ENG: 'Error resolving incident' },
    'incidents.filter.all': { FR: 'Tous les statuts', ENG: 'All statuses' },
    'incidents.status.REPORTED': { FR: 'Signalé', ENG: 'Reported' },
    'incidents.status.UNDER_INVESTIGATION': { FR: 'En enquête', ENG: 'Under Investigation' },
    'incidents.status.RESOLVED': { FR: 'Résolu', ENG: 'Resolved' },
    'incidents.status.CLOSED': { FR: 'Fermé', ENG: 'Closed' },
    'incidents.status.PENDING_INSURANCE': { FR: 'Attente Assurance', ENG: 'Pending Insurance' },
    'incidents.noIncidents': { FR: 'Aucun incident trouvé', ENG: 'No incidents found' },
    'incidents.vehicleId': { FR: 'Véhicule ID: {0}', ENG: 'Vehicle ID: {0}' },
    'incidents.resolve': { FR: 'Résoudre', ENG: 'Resolve' },

    // Incident Types
    'incidents.type.ACCIDENT': { FR: 'Accident', ENG: 'Accident' },
    'incidents.type.BREAKDOWN': { FR: 'Panne', ENG: 'Breakdown' },
    'incidents.type.THEFT': { FR: 'Vol', ENG: 'Theft' },
    'incidents.type.VANDALISM': { FR: 'Vandalisme', ENG: 'Vandalisme' },
    'incidents.type.TRAFFIC_VIOLATION': { FR: 'Infraction au code', ENG: 'Traffic Violation' },
    'incidents.type.FUEL_THEFT': { FR: 'Vol de carburant', ENG: 'Fuel Theft' },
    'incidents.type.UNAUTHORIZED_USE': { FR: 'Utilisation non autorisée', ENG: 'Unauthorized Use' },
    'incidents.type.SPEEDING': { FR: 'Excès de vitesse', ENG: 'Speeding' },
    'incidents.type.OTHER': { FR: 'Autre', ENG: 'Other' },

    // Incident Severity
    'incidents.severity.CRITICAL': { FR: 'Critique', ENG: 'Critical' },
    'incidents.severity.MAJOR': { FR: 'Majeur', ENG: 'Major' },
    'incidents.severity.MODERATE': { FR: 'Modéré', ENG: 'Moderate' },
    'incidents.severity.MINOR': { FR: 'Mineur', ENG: 'Minor' },

    'sidebar.geofences': { FR: 'Zones (Geofencing)', ENG: 'Geofences' },
    'sidebar.reports': { FR: 'Bilans', ENG: 'Reports' },
    'sidebar.history': { FR: 'Historique', ENG: 'History' },
    'sidebar.subscription': { FR: 'Abonnement', ENG: 'Subscription' },
    'sidebar.support': { FR: 'Support Client', ENG: 'Customer Support' },
    'sidebar.profile.admin': { FR: 'Administrateur', ENG: 'Administrator' },
    'sidebar.profile.manager': { FR: 'Gestionnaire', ENG: 'Manager' },
    'dashboard.welcome': { FR: 'Bienvenue sur votre tableau de bord', ENG: 'Welcome to your dashboard' },
    'dashboard.overview': { FR: "Voici un aperçu de l'activité de votre organisation aujourd'hui.", ENG: "Here's an overview of your organization's activity today." },

    // Fleet Managers Page
    'managers.title': { FR: 'Mes Gestionnaires', ENG: 'My Fleet Managers' },
    'managers.subtitle': { FR: 'Gérez les responsables de vos flottes', ENG: 'Manage your fleet managers' },
    'managers.new': { FR: 'Nouveau Gestionnaire', ENG: 'New Manager' },
    'managers.searchPlaceholder': { FR: 'Rechercher par nom, email, téléphone...', ENG: 'Search by name, email, phone...' },
    'managers.noManagers': { FR: 'Aucun gestionnaire trouvé', ENG: 'No managers found' },
    'managers.addFirst': { FR: 'Ajoutez votre premier gestionnaire de flotte', ENG: 'Add your first fleet manager' },
    'managers.active': { FR: 'Actif', ENG: 'Active' },
    'managers.inactive': { FR: 'Inactif', ENG: 'Inactive' },
    'managers.onLeave': { FR: 'En congé', ENG: 'On leave' },
    'managers.suspended': { FR: 'Suspendu', ENG: 'Suspended' },
    'managers.fleetsManaged': { FR: 'flotte(s) gérée(s)', ENG: 'fleet(s) managed' },
    'managers.notProvided': { FR: 'Non renseigné', ENG: 'Not provided' },
    'managers.noAdminId': { FR: 'ID administrateur non trouvé', ENG: 'Admin ID not found' },
    'managers.confirmDelete': { FR: 'Êtes-vous sûr de vouloir supprimer ce gestionnaire ?', ENG: 'Are you sure you want to delete this manager?' },
    'managers.deleteWarning': { FR: 'Cette action est irréversible. Les flottes associées seront dissociées.', ENG: 'This action is irreversible. Associated fleets will be unlinked.' },
    'managers.typeNameToConfirm': { FR: 'Saisissez le nom complet du gestionnaire pour confirmer:', ENG: 'Type the full manager name to confirm:' },
    'managers.nameDoesNotMatch': { FR: 'Le nom ne correspond pas', ENG: 'The name does not match' },
    'managers.nameMatches': { FR: 'Nom confirmé', ENG: 'Name confirmed' },


    // Dashboard - Common
    'common.search': { FR: 'Rechercher', ENG: 'Search' },
    'common.new': { FR: 'Nouveau', ENG: 'New' },
    'common.edit': { FR: 'Modifier', ENG: 'Edit' },
    'common.delete': { FR: 'Supprimer', ENG: 'Delete' },
    'common.save': { FR: 'Enregistrer', ENG: 'Save' },
    'common.cancel': { FR: 'Annuler', ENG: 'Cancel' },
    'common.close': { FR: 'Fermer', ENG: 'Close' },
    'common.loading': { FR: 'Chargement...', ENG: 'Loading...' },
    'common.noResults': { FR: 'Aucun résultat', ENG: 'No results' },
    'common.allStates': { FR: 'Tous les états', ENG: 'All states' },
    'common.filter': { FR: 'Filtrer', ENG: 'Filter' },


    'drivers.title': { FR: 'Mes Chauffeurs', ENG: 'My Drivers' },
    'drivers.subtitle': { FR: 'Gérez vos conducteurs', ENG: 'Manage your drivers' },
    'drivers.new': { FR: 'Nouveau Chauffeur', ENG: 'New Driver' },
    'drivers.searchPlaceholder': { FR: 'Rechercher par nom, email, téléphone...', ENG: 'Search by name, email, phone...' },
    'drivers.noDrivers': { FR: 'Aucun chauffeur trouvé', ENG: 'No drivers found' },
    'fleets.filter.allTypes': { FR: 'Tous les types', ENG: 'All types' },
    'fleets.filter.allManagers': { FR: 'Tous les gestionnaires', ENG: 'All managers' },
    'drivers.addFirst': { FR: 'Ajoutez votre premier chauffeur', ENG: 'Add your first driver' },
    'drivers.active': { FR: 'Actif', ENG: 'Active' },
    'drivers.inactive': { FR: 'Inactif', ENG: 'Inactive' },
    'drivers.onLeave': { FR: 'En congé', ENG: 'On leave' },
    'drivers.suspended': { FR: 'Suspendu', ENG: 'Suspended' },
    'drivers.license': { FR: 'Permis', ENG: 'License' },
    'drivers.notProvided': { FR: 'Non renseigné', ENG: 'Not provided' },
    'drivers.confirmDelete': { FR: 'Êtes-vous sûr de vouloir supprimer ce chauffeur ?', ENG: 'Are you sure you want to delete this driver?' },
    'drivers.deleteWarning': { FR: 'Cette action est irréversible. Toutes les données associées seront supprimées.', ENG: 'This action is irreversible. All associated data will be deleted.' },
    'drivers.typeNameToConfirm': { FR: 'Saisissez le nom complet du chauffeur pour confirmer:', ENG: 'Type the full driver name to confirm:' },
    'drivers.nameDoesNotMatch': { FR: 'Le nom ne correspond pas', ENG: 'The name does not match' },
    'drivers.nameMatches': { FR: 'Nom confirmé', ENG: 'Name confirmed' },

    // Driver Actions
    'drivers.actions.title': { FR: 'Actions Rapides', ENG: 'Quick Actions' },
    'drivers.actions.activate': { FR: 'Activer le conducteur', ENG: 'Activate Driver' },
    'drivers.actions.suspend': { FR: 'Suspendre', ENG: 'Suspend' },
    'drivers.actions.leave': { FR: 'Mettre en congé', ENG: 'Set as On Leave' },
    'drivers.actions.deactivate': { FR: 'Désactiver', ENG: 'Deactivate' },
    'drivers.actions.updateSuccess': { FR: 'Statut mis à jour avec succès', ENG: 'Status updated successfully' },
    'drivers.actions.updateError': { FR: 'Erreur lors de la mise à jour', ENG: 'Error updating status' },

    // Reports Page
    'reports.title': { FR: 'Bilans', ENG: 'Reports' },
    'reports.subtitle': { FR: "Générez et consultez vos rapports d'activité", ENG: 'Generate and view your activity reports' },
    'reports.period': { FR: 'Période', ENG: 'Period' },
    'reports.last7days': { FR: '7 derniers jours', ENG: 'Last 7 days' },
    'reports.last30days': { FR: '30 derniers jours', ENG: 'Last 30 days' },
    'reports.last90days': { FR: '90 derniers jours', ENG: 'Last 90 days' },
    'reports.thisYear': { FR: 'Cette année', ENG: 'This year' },
    'reports.custom': { FR: 'Personnalisé', ENG: 'Custom' },
    'reports.generate': { FR: 'Générer', ENG: 'Generate' },
    'reports.fleetPerformance': { FR: 'Performance des Flottes', ENG: 'Fleet Performance' },
    'reports.fuelConsumption': { FR: 'Consommation de Carburant', ENG: 'Fuel Consumption' },
    'reports.maintenanceCosts': { FR: 'Coûts de Maintenance', ENG: 'Maintenance Costs' },
    'reports.driverActivity': { FR: 'Activité des Chauffeurs', ENG: 'Driver Activity' },
    'reports.preview': { FR: 'Aperçu du Rapport', ENG: 'Report Preview' },
    'reports.selectReport': { FR: "Sélectionnez un rapport pour voir l'aperçu ici", ENG: 'Select a report to see preview here' },

    // History Page
    'history.title': { FR: 'Historique', ENG: 'History' },
    'history.subtitle': { FR: "Consultez l'historique des trajets et incidents", ENG: 'View trip and incident history' },
    'history.all': { FR: 'Tout', ENG: 'All' },
    'history.trips': { FR: 'Trajets', ENG: 'Trips' },
    'history.incidents': { FR: 'Incidents', ENG: 'Incidents' },
    'history.noHistory': { FR: 'Aucun historique', ENG: 'No history' },
    'history.eventsAppear': { FR: 'Les événements apparaîtront ici', ENG: 'Events will appear here' },

    // Subscription Page
    'subscription.title': { FR: 'Abonnement', ENG: 'Subscription' },
    'subscription.subtitle': { FR: 'Gérez votre abonnement et vos options de facturation', ENG: 'Manage your subscription and billing options' },
    'subscription.currentPlan': { FR: 'Plan actuel', ENG: 'Current plan' },
    'subscription.organization': { FR: 'Organisation', ENG: 'Organization' },
    'subscription.popular': { FR: 'Populaire', ENG: 'Popular' },
    'subscription.choose': { FR: 'Choisir', ENG: 'Choose' },

    // Support Page
    'support.title': { FR: 'Support Client', ENG: 'Customer Support' },
    'support.subtitle': { FR: "Besoin d'aide ? Nous sommes là pour vous", ENG: 'Need help? We are here for you' },
    'support.email': { FR: 'Email', ENG: 'Email' },
    'support.phone': { FR: 'Téléphone', ENG: 'Phone' },
    'support.liveChat': { FR: 'Chat en direct', ENG: 'Live Chat' },
    'support.available': { FR: 'Disponible 9h-18h', ENG: 'Available 9am-6pm' },
    'support.sendEmail': { FR: 'Envoyer un email', ENG: 'Send email' },
    'support.call': { FR: 'Appeler', ENG: 'Call' },
    'support.startChat': { FR: 'Démarrer le chat', ENG: 'Start chat' },
    'support.usefulResources': { FR: 'Ressources utiles', ENG: 'Useful resources' },
    'support.documentation': { FR: 'Documentation', ENG: 'Documentation' },
    'support.helpCenter': { FR: "Centre d'aide", ENG: 'Help Center' },
    'support.faq': { FR: 'Questions fréquentes', ENG: 'Frequently Asked Questions' },
    'support.contactUs': { FR: 'Nous contacter', ENG: 'Contact Us' },
    'support.name': { FR: 'Nom', ENG: 'Name' },
    'support.yourName': { FR: 'Votre nom', ENG: 'Your name' },
    'support.yourEmail': { FR: 'votre@email.com', ENG: 'your@email.com' },
    'support.subject': { FR: 'Sujet', ENG: 'Subject' },
    'support.technicalQuestion': { FR: 'Question technique', ENG: 'Technical question' },
    'support.billing': { FR: 'Facturation', ENG: 'Billing' },
    'support.feature': { FR: 'Fonctionnalité', ENG: 'Feature' },
    'support.other': { FR: 'Autre', ENG: 'Other' },
    'support.message': { FR: 'Message', ENG: 'Message' },
    'support.describeRequest': { FR: 'Décrivez votre demande...', ENG: 'Describe your request...' },
    'support.send': { FR: 'Envoyer', ENG: 'Send' },

    // FAQ
    'faq.q1': { FR: 'Comment ajouter un nouveau véhicule à ma flotte ?', ENG: 'How do I add a new vehicle to my fleet?' },
    'faq.a1': { FR: "Rendez-vous dans la section 'Mes Véhicules', cliquez sur 'Nouveau Véhicule' et remplissez les informations requises comme l'immatriculation, la marque et le modèle.", ENG: "Go to 'My Vehicles' section, click 'New Vehicle' and fill in the required information like registration, make and model." },
    'faq.q2': { FR: 'Comment assigner un chauffeur à un véhicule ?', ENG: 'How do I assign a driver to a vehicle?' },
    'faq.a2': { FR: "Dans la page de détails du véhicule, vous trouverez une option pour assigner un chauffeur parmi ceux disponibles dans votre organisation.", ENG: "On the vehicle details page, you will find an option to assign a driver from those available in your organization." },
    'faq.q3': { FR: 'Comment configurer les alertes de géofencing ?', ENG: 'How do I configure geofencing alerts?' },
    'faq.a3': { FR: "Accédez aux paramètres de votre flotte, puis à la section Géofences. Vous pouvez créer des zones géographiques et configurer des alertes d'entrée/sortie.", ENG: "Go to your fleet settings, then the Geofences section. You can create geographic zones and configure entry/exit alerts." },
    'faq.q4': { FR: 'Comment exporter mes rapports ?', ENG: 'How do I export my reports?' },
    'faq.a4': { FR: "Dans la section Bilans, sélectionnez le type de rapport souhaité et cliquez sur le bouton PDF pour télécharger une version exportable.", ENG: "In the Reports section, select the desired report type and click the PDF button to download an exportable version." },

    // Report descriptions
    'reports.fleetPerformanceDesc': { FR: 'Analyse de la performance globale de vos flottes', ENG: 'Analysis of the overall performance of your fleets' },
    'reports.fuelConsumptionDesc': { FR: 'Rapport détaillé sur la consommation de carburant', ENG: 'Detailed report on fuel consumption' },
    'reports.maintenanceCostsDesc': { FR: 'Suivi des dépenses de maintenance par véhicule', ENG: 'Tracking maintenance costs by vehicle' },
    'reports.driverActivityDesc': { FR: "Statistiques d'activité et de performance des chauffeurs", ENG: 'Driver activity and performance statistics' },

    // Reports Page - Dashboard
    'reports.fuelCost.total': { FR: 'Coût Total Carburant', ENG: 'Total Fuel Cost' },
    'reports.fuel.consumed': { FR: 'L consommés', ENG: 'L consumed' },
    'reports.maintenanceCost.total': { FR: 'Coût Maintenances', ENG: 'Maintenance Cost' },
    'reports.maintenances.count': { FR: 'maintenances', ENG: 'maintenances' },
    'reports.distance.total': { FR: 'Distance Parcourue', ENG: 'Distance Traveled' },
    'reports.trips.count': { FR: 'trajets', ENG: 'trips' },
    'reports.incidents.count': { FR: 'Incidents', ENG: 'Incidents' },
    'reports.vehicles.active.count': { FR: 'véhicules actifs', ENG: 'active vehicles' },
    'reports.fuel.recent': { FR: 'Recharges de Carburant', ENG: 'Fuel Recharges' },
    'reports.recharges.count': { FR: 'recharges', ENG: 'recharges' },
    'reports.fuel.noData': { FR: 'Aucune recharge enregistrée', ENG: 'No recharges recorded' },
    'reports.fuel.unknownStation': { FR: 'Station inconnue', ENG: 'Unknown station' },
    'reports.maintenances.title': { FR: 'Maintenances', ENG: 'Maintenances' },
    'reports.maintenance.noReport': { FR: 'Pas de rapport', ENG: 'No report' },
    'reports.maintenance.noData': { FR: 'Aucune maintenance enregistrée', ENG: 'No maintenance recorded' },
    'reports.incidents.recent': { FR: 'Incidents Récents', ENG: 'Recent Incidents' },
    'reports.incidents.countLabel': { FR: 'incidents', ENG: 'incidents' },
    'reports.incidents.noData': { FR: 'Aucun incident enregistré', ENG: 'No incidents recorded' },
    'reports.fleet.overview': { FR: 'Aperçu de la Flotte', ENG: 'Fleet Overview' },
    'reports.vehicles.countLabel': { FR: 'véhicules', ENG: 'vehicles' },
    'reports.status.active': { FR: 'Actifs', ENG: 'Active' },
    'reports.status.inactive': { FR: 'Inactifs', ENG: 'Inactive' },
    'reports.status.maintenance': { FR: 'En maintenance', ENG: 'In Maintenance' },
    'reports.status.service': { FR: 'En service', ENG: 'In Service' },

    // History Page
    'history.stats.totalTrips': { FR: 'Total trajets', ENG: 'Total trips' },
    'history.stats.totalDistance': { FR: 'Distance totale', ENG: 'Total distance' },
    'history.stats.completedTrips': { FR: 'Trajets terminés', ENG: 'Completed trips' },
    'history.stats.ongoing': { FR: 'En cours', ENG: 'Ongoing' },
    'history.filter.label': { FR: 'Filtrer:', ENG: 'Filter:' },
    'history.filter.all': { FR: 'Tous', ENG: 'All' },
    'history.filter.ongoing': { FR: 'En cours', ENG: 'Ongoing' },
    'history.filter.completed': { FR: 'Terminé', ENG: 'Completed' },
    'history.filter.cancelled': { FR: 'Annulé', ENG: 'Cancelled' },
    'history.filter.unknown': { FR: 'Inconnu', ENG: 'Unknown' },
    'history.searchPlaceholder': { FR: 'Rechercher par lieu, véhicule, chauffeur...', ENG: 'Search by location, vehicle, driver...' },
    'history.noTrips': { FR: 'Aucun trajet trouvé', ENG: 'No trips found' },
    'history.noTripsDesc': { FR: 'Les trajets apparaîtront ici une fois enregistrés', ENG: 'Trips will appear here once recorded' },
    'history.tripPrefix': { FR: 'Trajet #', ENG: 'Trip #' },
    'history.location.unknown': { FR: 'Lieu inconnu', ENG: 'Unknown location' },
    'history.details.departure': { FR: 'Départ:', ENG: 'Departure:' },
    'history.details.arrival': { FR: 'Arrivée:', ENG: 'Arrival:' },
    'history.details.duration': { FR: 'Durée:', ENG: 'Duration:' },


    // Subscription features
    'subscription.free.f1': { FR: '5 véhicules max', ENG: '5 vehicles max' },
    'subscription.free.f2': { FR: '1 utilisateur', ENG: '1 user' },
    'subscription.free.f3': { FR: 'Suivi GPS basique', ENG: 'Basic GPS tracking' },
    'subscription.free.f4': { FR: 'Support email', ENG: 'Email support' },
    'subscription.basic.f1': { FR: '20 véhicules', ENG: '20 vehicles' },
    'subscription.basic.f2': { FR: '5 utilisateurs', ENG: '5 users' },
    'subscription.basic.f3': { FR: 'Suivi GPS avancé', ENG: 'Advanced GPS tracking' },
    'subscription.basic.f4': { FR: 'Alertes en temps réel', ENG: 'Real-time alerts' },
    'subscription.basic.f5': { FR: 'Support prioritaire', ENG: 'Priority support' },
    'subscription.professional.f1': { FR: '100 véhicules', ENG: '100 vehicles' },
    'subscription.professional.f2': { FR: 'Utilisateurs illimités', ENG: 'Unlimited users' },
    'subscription.professional.f3': { FR: 'Analytics avancés', ENG: 'Advanced analytics' },
    'subscription.professional.f4': { FR: 'Accès API', ENG: 'API access' },
    'subscription.professional.f5': { FR: 'Support 24/7', ENG: '24/7 support' },
    'subscription.professional.f6': { FR: 'Géofencing', ENG: 'Geofencing' },
    'subscription.enterprise.f1': { FR: 'Véhicules illimités', ENG: 'Unlimited vehicles' },
    'subscription.enterprise.f2': { FR: 'Personnalisation complète', ENG: 'Full customization' },
    'subscription.enterprise.f3': { FR: 'SLA garanti', ENG: 'Guaranteed SLA' },
    'subscription.enterprise.f4': { FR: 'Account manager dédié', ENG: 'Dedicated account manager' },
    'subscription.enterprise.f5': { FR: 'Formation incluse', ENG: 'Training included' },
    'subscription.onQuote': { FR: 'Sur devis', ENG: 'On quote' },
    'subscription.perMonth': { FR: '/mois', ENG: '/month' },

    // Fleet Creation Wizard
    'wizard.step1Title': { FR: 'Étape 1: Créer le Gestionnaire', ENG: 'Step 1: Create Manager' },
    'wizard.step2Title': { FR: 'Étape 2: Créer la Flotte', ENG: 'Step 2: Create Fleet' },
    'wizard.complete': { FR: 'Terminé!', ENG: 'Complete!' },
    'wizard.createManagerFirst': { FR: "Créez d'abord un gestionnaire pour cette flotte", ENG: 'First create a manager for this fleet' },
    'wizard.managerCreated': { FR: 'Gestionnaire créé ! Maintenant créez la flotte', ENG: 'Manager created! Now create the fleet' },
    'wizard.next': { FR: 'Suivant', ENG: 'Next' },
    'wizard.back': { FR: 'Retour', ENG: 'Back' },
    'wizard.createFleet': { FR: 'Créer la Flotte', ENG: 'Create Fleet' },
    'wizard.successTitle': { FR: 'Flotte créée avec succès!', ENG: 'Fleet created successfully!' },
    'wizard.successManager': { FR: 'Gestionnaire', ENG: 'Manager' },
    'wizard.successFleet': { FR: 'Flotte', ENG: 'Fleet' },
    'wizard.errorManager': { FR: 'Échec de la création du gestionnaire de flotte', ENG: 'Failed to create fleet manager' },
    'wizard.errorFleet': { FR: 'Échec de la création de la flotte', ENG: 'Failed to create fleet' },
    'wizard.errorNoManager': { FR: 'Aucun gestionnaire de flotte créé', ENG: 'No fleet manager created' },
    'wizard.step1TitleFleet': { FR: 'Étape 1: Informations de la Flotte', ENG: 'Step 1: Fleet Information' },
    'wizard.step2TitleManager': { FR: 'Étape 2: Gestionnaire de la Flotte', ENG: 'Step 2: Fleet Manager' },
    'wizard.step3Confirm': { FR: 'Étape 3: Confirmation', ENG: 'Step 3: Confirmation' },
    'wizard.fleetInfoDesc': { FR: 'Définissez les informations de votre nouvelle flotte', ENG: 'Define the information for your new fleet' },
    'wizard.managerInfoDesc': { FR: 'Créez le gestionnaire qui sera responsable de cette flotte', ENG: 'Create the manager who will be responsible for this fleet' },
    'wizard.confirmDesc': { FR: 'Vérifiez les informations avant de créer', ENG: 'Review the information before creating' },
    'wizard.createAll': { FR: 'Créer la Flotte et le Gestionnaire', ENG: 'Create Fleet and Manager' },
    'wizard.creating': { FR: 'Création en cours...', ENG: 'Creating...' },

    // Form Fields - Additional (not duplicating existing ones)
    'form.gender': { FR: 'Genre', ENG: 'Gender' },
    'form.gender.male': { FR: 'Homme', ENG: 'Male' },
    'form.gender.female': { FR: 'Femme', ENG: 'Female' },
    'form.required': { FR: '(obligatoire)', ENG: '(required)' },
    'form.fleetName': { FR: 'Nom de la flotte', ENG: 'Fleet Name' },
    'form.description': { FR: 'Description', ENG: 'Description' },
    'form.fleetType': { FR: 'Type de flotte', ENG: 'Fleet Type' },
    'form.idCardNumber': { FR: "Numéro de carte d'identité", ENG: 'ID Card Number' },
    'form.taxNumber': { FR: 'Numéro fiscal', ENG: 'Tax Number' },
    'form.niu': { FR: 'NIU (Numéro Unique)', ENG: 'NIU (Unique Number)' },
    'form.language': { FR: 'Langue préférée', ENG: 'Preferred Language' },
    'form.requiredFields': { FR: '* Champs obligatoires', ENG: '* Required fields' },

    // Fleet Types
    'fleetType.personal': { FR: 'Personnel', ENG: 'Personal' },
    'fleetType.passengerTransport': { FR: 'Transport de passagers', ENG: 'Passenger Transport' },
    'fleetType.cargoTransport': { FR: 'Transport de marchandises', ENG: 'Cargo Transport' },
    'fleetType.delivery': { FR: 'Livraison', ENG: 'Delivery' },
    'fleetType.rental': { FR: 'Location', ENG: 'Rental' },
    'fleetType.mixed': { FR: 'Mixte', ENG: 'Mixed' },
    'fleetType.other': { FR: 'Autre', ENG: 'Other' },

    // Geofences Page
    'geofences.title': { FR: 'Zones (Geofencing)', ENG: 'Geofences' },
    'geofences.subtitle': { FR: 'Gérez vos zones de surveillance', ENG: 'Manage your monitoring zones' },
    'geofences.circle': { FR: 'Cercle', ENG: 'Circle' },
    'geofences.polygon': { FR: 'Polygone', ENG: 'Polygon' },
    'geofences.newZone': { FR: 'Nouvelle Zone', ENG: 'New Zone' },
    'geofences.circular': { FR: 'Circulaire', ENG: 'Circular' },
    'geofences.name': { FR: 'Nom', ENG: 'Name' },
    'geofences.description': { FR: 'Description', ENG: 'Description' },
    'geofences.namePlaceholder': { FR: 'Ex: Entrepôt Principal', ENG: 'Ex: Main Warehouse' },
    'geofences.radius': { FR: 'Rayon (mètres)', ENG: 'Radius (meters)' },
    'geofences.circleHint': { FR: 'Cliquez sur la carte pour définir le centre de la zone.', ENG: 'Click on the map to define the zone center.' },
    'geofences.polygonHint': { FR: 'Cliquez sur la carte pour ajouter des points. Le polygone se fermera automatiquement.', ENG: 'Click on the map to add points. The polygon will close automatically.' },
    'geofences.loading': { FR: 'Chargement...', ENG: 'Loading...' },
    'geofences.noZones': { FR: 'Aucune zone définie.', ENG: 'No zones defined.' },
    'geofences.loadError': { FR: 'Erreur lors du chargement des zones', ENG: 'Error loading zones' },
    'geofences.nameRequired': { FR: 'Le nom est obligatoire', ENG: 'Name is required' },
    'geofences.sessionInvalid': { FR: 'Session invalide. Veuillez vous reconnecter.', ENG: 'Invalid session. Please log in again.' },
    'geofences.selectCenter': { FR: 'Veuillez sélectionner un centre sur la carte', ENG: 'Please select a center on the map' },
    'geofences.minPoints': { FR: 'Un polygone doit avoir au moins 3 points', ENG: 'A polygon must have at least 3 points' },
    'geofences.createSuccess': { FR: 'Zone créée avec succès', ENG: 'Zone created successfully' },
    'geofences.createError': { FR: 'Erreur lors de la création', ENG: 'Error creating geofence' },
    'geofences.deleteConfirm': { FR: 'Êtes-vous sûr de vouloir supprimer cette zone ?', ENG: 'Are you sure you want to delete this geofence?' },
    'geofences.deleteWarning': { FR: 'Cette action est irréversible.', ENG: 'This action is irreversible.' },
    'geofences.deleteSuccess': { FR: 'Zone supprimée avec succès', ENG: 'Geofence deleted successfully' },
    'geofences.deleteError': { FR: 'Erreur lors de la suppression', ENG: 'Error deleting geofence' },
    'geofences.typeNameToConfirm': { FR: 'Saisissez le nom de la zone pour confirmer:', ENG: 'Type the geofence name to confirm:' },
    'geofences.nameDoesNotMatch': { FR: 'Le nom ne correspond pas', ENG: 'The name does not match' },
    'geofences.nameMatches': { FR: 'Nom confirmé', ENG: 'Name confirmed' },
    'geofences.loadingMap': { FR: 'Chargement de la carte...', ENG: 'Loading map...' },
    'geofences.status': { FR: 'Statut', ENG: 'Status' },
    'geofences.status.operational': { FR: 'Zone Opérationnelle', ENG: 'Operational Zone' },
    'geofences.status.parking': { FR: 'Parking', ENG: 'Parking' },
    'geofences.status.restricted': { FR: 'Zone Interdite', ENG: 'Restricted Zone' },
    // Keys for list display (lowercase enum)
    'geofences.status.operational_zone': { FR: 'Zone Opérationnelle', ENG: 'Operational Zone' },
    'geofences.status.restricted_zone': { FR: 'Zone Interdite', ENG: 'Restricted Zone' },

    // Header & Global
    'header.search.placeholder': { FR: 'Rechercher véhicule (plaque), conducteur...', ENG: 'Search vehicle (plate), driver...' },
    'header.search.loading': { FR: 'Recherche en cours...', ENG: 'Searching...' },
    'header.search.noResults': { FR: 'Aucun résultat trouvé', ENG: 'No results found' },
    'header.search.vehicles': { FR: 'VÉHICULES', ENG: 'VEHICLES' },
    'header.search.drivers': { FR: 'CONDUCTEURS', ENG: 'DRIVERS' },
    'header.notifications.title.unread': { FR: 'Non lues', ENG: 'Unread' },
    'header.notifications.title.all': { FR: 'Toutes les notifications', ENG: 'All notifications' },
    'header.notifications.filter.unread': { FR: 'Non lues', ENG: 'Unread' },
    'header.notifications.filter.all': { FR: 'Toutes', ENG: 'All' },
    'header.notifications.markAll': { FR: 'Tout marquer comme lu', ENG: 'Mark all as read' },
    'header.notifications.empty': { FR: 'Aucune notification', ENG: 'No notifications' },
    'header.notifications.viewAll': { FR: 'Voir toutes les notifications', ENG: 'View all notifications' },
    'time.justNow': { FR: "À l'instant", ENG: 'Just now' },
    'time.minAgo': { FR: "Il y a {0} min", ENG: '{0} min ago' },
    'time.hourAgo': { FR: "Il y a {0} h", ENG: '{0} h ago' },
    'time.dayAgo': { FR: "Il y a {0} j", ENG: '{0} d ago' },
    'date.unknown': { FR: 'Date inconnue', ENG: 'Unknown date' },
    'date.invalid': { FR: 'Date invalide', ENG: 'Invalid date' },

    // Dashboard Manager
    'dashboard.mapComingSoon': { FR: 'Carte interactive des véhicules (À venir)', ENG: 'Interactive vehicle map (Coming soon)' },

    // Vehicle Detail
    'vehicle.tabs.position': { FR: 'Position du véhicule', ENG: 'Vehicle Position' },
    'vehicle.tabs.details': { FR: 'Détails', ENG: 'Details' },
    'vehicle.tabs.history': { FR: 'Historique des trajets', ENG: 'Trip History' },
    'vehicle.tabs.reports': { FR: 'Bilans', ENG: 'Reports' },
    'vehicle.tabs.assignments': { FR: 'Assignations', ENG: 'Assignments' },

    'vehicle.position.unavailable': { FR: 'Position du véhicule non disponible', ENG: 'Vehicle position unavailable' },
    'vehicle.position.loading': { FR: 'Chargement de la carte...', ENG: 'Loading map...' },

    'vehicle.metrics.title': { FR: 'Métriques en temps réel', ENG: 'Real-time Metrics' },
    'vehicle.metrics.subtitle': { FR: 'Informations actuelles du véhicule {0}', ENG: 'Current information for vehicle {0}' },

    'vehicle.info.registration': { FR: 'Immatriculation', ENG: 'Registration' },
    'vehicle.info.status': { FR: 'Status', ENG: 'Status' },
    'vehicle.info.model': { FR: 'Modèle', ENG: 'Model' },
    'vehicle.info.type': { FR: 'Type', ENG: 'Type' },

    'vehicle.status.active': { FR: 'En service', ENG: 'Active' },
    'vehicle.status.inactive': { FR: 'Hors service', ENG: 'Inactive' },
    'vehicle.status.moving': { FR: 'En mouvement', ENG: 'Moving' },
    'vehicle.status.parked': { FR: 'Garé', ENG: 'Parked' },
    'vehicle.status.maintenance': { FR: 'En maintenance', ENG: 'Maintenance' },
    'vehicle.status.unknown': { FR: 'Inconnu', ENG: 'Unknown' },

    'vehicle.history.title': { FR: 'Historique des trajets', ENG: 'Trip History' },
    'vehicle.history.noTrips': { FR: 'Aucun trajet enregistré pour ce véhicule', ENG: 'No trips recorded for this vehicle' },
    'vehicle.history.tripPrefix': { FR: 'Trajet #', ENG: 'Trip #' },
    'vehicle.history.departure': { FR: 'Départ', ENG: 'Departure' },
    'vehicle.history.arrival': { FR: 'Arrivée', ENG: 'Arrival' },
    'vehicle.history.inProgress': { FR: 'En cours', ENG: 'In progress' },
    'vehicle.history.distance': { FR: 'Distance', ENG: 'Distance' },
    'vehicle.history.deleteConfirm': { FR: 'Êtes-vous sûr de vouloir supprimer ce trajet ?', ENG: 'Are you sure you want to delete this trip?' },
    'vehicle.history.deleteError': { FR: 'Erreur lors de la suppression du trajet', ENG: 'Error deleting trip' },

    // Trip Status
    'trip.status.PLANNED': { FR: 'Planifié', ENG: 'Planned' },
    'trip.status.IN_PROGRESS': { FR: 'En cours', ENG: 'In Progress' },
    'trip.status.COMPLETED': { FR: 'Terminé', ENG: 'Completed' },
    'trip.status.CANCELLED': { FR: 'Annulé', ENG: 'Cancelled' },

    'vehicle.reports.title': { FR: 'Bilans du véhicule', ENG: 'Vehicle Reports' },
    'vehicle.reports.fuel.title': { FR: 'Recharges de carburant', ENG: 'Fuel Recharges' },
    'vehicle.reports.fuel.noData': { FR: 'Aucune recharge enregistrée', ENG: 'No recharges recorded' },
    'vehicle.reports.fuel.rechargePrefix': { FR: 'Recharge #', ENG: 'Recharge #' },
    'vehicle.reports.fuel.quantity': { FR: 'Quantité', ENG: 'Quantity' },
    'vehicle.reports.fuel.price': { FR: 'Prix', ENG: 'Price' },
    'vehicle.reports.fuel.station': { FR: 'Station', ENG: 'Station' },

    'vehicle.reports.maintenance.title': { FR: 'Maintenances', ENG: 'Maintenances' },
    'vehicle.reports.maintenance.noData': { FR: 'Aucune maintenance enregistrée', ENG: 'No maintenance recorded' },
    'vehicle.reports.maintenance.report': { FR: 'Rapport', ENG: 'Report' },
    'vehicle.reports.maintenance.cost': { FR: 'Coût', ENG: 'Cost' },

    'vehicle.assignments.title': { FR: 'Conducteurs Assignés', ENG: 'Assigned Drivers' },
    'vehicle.assignments.add': { FR: 'Assigner un conducteur', ENG: 'Assign Driver' },
    'vehicle.assignments.noData': { FR: 'Aucune assignation enregistrée', ENG: 'No assignments recorded' },
    'vehicle.assignments.status.active': { FR: 'Active', ENG: 'Active' },
    'vehicle.assignments.status.finished': { FR: 'Terminée', ENG: 'Finished' },
    'vehicle.assignments.start': { FR: 'Début', ENG: 'Start' },
    'vehicle.assignments.end': { FR: 'Fin', ENG: 'End' },
    'vehicle.assignments.notes': { FR: 'Notes', ENG: 'Notes' },
    'vehicle.assignments.terminate': { FR: "Terminer l'assignation", ENG: 'Terminate Assignment' },
    'vehicle.assignments.terminateConfirm': { FR: 'Êtes-vous sûr de vouloir terminer cette assignation ?', ENG: 'Are you sure you want to terminate this assignment?' },
    'vehicle.assignments.terminateError': { FR: "Erreur lors de la terminaison de l'assignation", ENG: 'Error terminating assignment' },

    'vehicle.assignModal.title': { FR: 'Assigner un conducteur', ENG: 'Assign a Driver' },
    'vehicle.assignModal.driver': { FR: 'Conducteur', ENG: 'Driver' },
    'vehicle.assignModal.selectDriver': { FR: 'Sélectionner un conducteur', ENG: 'Select a driver' },
    'vehicle.assignModal.notes': { FR: 'Notes (optionnel)', ENG: 'Notes (optional)' },
    'vehicle.assignModal.notesPlaceholder': { FR: "Notes sur l'assignation...", ENG: 'Assignment notes...' },
    'vehicle.assignModal.cancel': { FR: 'Annuler', ENG: 'Cancel' },
    'vehicle.assignModal.submit': { FR: 'Assigner', ENG: 'Assign' },
    'vehicle.error.loading': { FR: 'Impossible de charger les données du véhicule', ENG: 'Unable to load vehicle data' },
    'vehicle.error.notFound': { FR: 'Véhicule non trouvé', ENG: 'Vehicle not found' },
    'vehicle.backToList': { FR: 'Retour à la liste', ENG: 'Back to list' },

    // Fleets
    'fleets.title': { FR: 'Gestion des Flottes', ENG: 'Fleet Management' },
    'fleets.subtitle': { FR: 'Gérez vos flottes et leurs managers', ENG: 'Manage your fleets and their managers' },
    'fleets.new': { FR: 'Nouvelle Flotte', ENG: 'New Fleet' },
    'fleets.searchPlaceholder': { FR: 'Rechercher une flotte...', ENG: 'Search fleet...' },
    'fleets.noFleets': { FR: 'Aucune flotte trouvée', ENG: 'No fleets found' },
    'fleets.createFirst': { FR: 'Créez votre première flotte pour commencer', ENG: 'Create your first fleet to get started' },
    'fleets.noDescription': { FR: 'Aucune description', ENG: 'No description' },
    'fleets.notAssigned': { FR: 'Non assigné', ENG: 'Not assigned' },
    'fleets.vehicles': { FR: 'Véhicules', ENG: 'Vehicles' },
    'fleets.confirmDelete': { FR: 'Êtes-vous sûr de vouloir supprimer cette flotte ?', ENG: 'Are you sure you want to delete this fleet?' },
    'fleets.deleteWarning': { FR: 'Cette action est irréversible.', ENG: 'This action cannot be undone.' },
    'fleets.typeNameToConfirm': { FR: 'Tapez le nom de la flotte pour confirmer', ENG: 'Type the fleet name to confirm' },
    'fleets.nameDoesNotMatch': { FR: 'Le nom ne correspond pas', ENG: 'Name does not match' },
    'fleets.nameMatches': { FR: 'Nom confirmé', ENG: 'Name confirmed' },

    'fleets.btn.new': { FR: 'Nouvelle Flotte', ENG: 'New Fleet' },
    'fleets.table.fleet': { FR: 'Flotte', ENG: 'Fleet' },
    'fleets.table.type': { FR: 'Type', ENG: 'Type' },
    'fleets.table.vehicles': { FR: 'Véhicules', ENG: 'Vehicles' },
    'fleets.table.manager': { FR: 'Gestionnaire', ENG: 'Manager' },
    'fleets.table.actions': { FR: 'Actions', ENG: 'Actions' },
    'fleets.wizard.optionalInfo': { FR: 'Informations optionnelles', ENG: 'Optional Information' },
    'fleets.form.firstName': { FR: 'Prénom', ENG: 'First Name' },
    'fleets.form.lastName': { FR: 'Nom', ENG: 'Last Name' },
    'fleets.form.email': { FR: 'Email', ENG: 'Email' },
    'fleets.form.password': { FR: 'Mot de passe', ENG: 'Password' },
    'fleets.form.phone': { FR: 'Téléphone', ENG: 'Phone' },
    'fleets.form.gender': { FR: 'Genre', ENG: 'Gender' },
    'fleets.form.idCard': { FR: 'CNI', ENG: 'ID Card' },
    'fleets.form.niu': { FR: 'NIU', ENG: 'NIU' },
    'fleets.form.address': { FR: 'Adresse', ENG: 'Address' },
    'fleets.form.city': { FR: 'Ville', ENG: 'City' },
    'fleets.form.postalCode': { FR: 'Code Postal', ENG: 'Postal Code' },
    'fleets.form.country': { FR: 'Pays', ENG: 'Country' },
    'fleets.form.taxNumber': { FR: 'Numéro Fiscal', ENG: 'Tax Number' },
    'fleets.form.language': { FR: 'Langue', ENG: 'Language' },

    // Vehicles List
    'vehicles.title': { FR: 'Véhicules', ENG: 'Vehicles' },
    'vehicles.subtitle': { FR: 'Gérez votre flotte de véhicules', ENG: 'Manage your vehicle fleet' },
    'vehicles.new': { FR: 'Nouveau Véhicule', ENG: 'New Vehicle' },
    'vehicles.searchPlaceholder': { FR: 'Rechercher un véhicule...', ENG: 'Search vehicle...' },
    'vehicles.inService': { FR: 'En service', ENG: 'In Service' },
    'vehicles.parked': { FR: 'Garé', ENG: 'Parked' },
    'vehicles.inAlarm': { FR: 'En alerte', ENG: 'In Alarm' },
    'vehicles.maintenance': { FR: 'En maintenance', ENG: 'Maintenance' },
    'vehicles.outOfService': { FR: 'Hors service', ENG: 'Out of Service' },
    'vehicles.noVehicles': { FR: 'Aucun véhicule', ENG: 'No vehicles' },
    'vehicles.addFirst': { FR: 'Ajoutez votre premier véhicule', ENG: 'Add your first vehicle' },
    'vehicles.confirmDelete': { FR: 'Êtes-vous sûr de vouloir supprimer ce véhicule ?', ENG: 'Are you sure you want to delete this vehicle?' },
    'vehicles.deleteWarning': { FR: 'Cette action est irréversible. Toutes les données associées seront supprimées.', ENG: 'This action cannot be undone. All associated data will be deleted.' },
    'vehicles.typeRegistrationToConfirm': { FR: "Tapez l'immatriculation pour confirmer", ENG: 'Type registration number to confirm' },
    'vehicles.registrationDoesNotMatch': { FR: "L'immatriculation ne correspond pas", ENG: 'Registration number does not match' },
    'vehicles.registrationMatches': { FR: 'Immatriculation confirmée', ENG: 'Registration confirmed' },

    'vehicles.table.registration': { FR: 'Immatriculation', ENG: 'Registration' },
    'vehicles.table.type': { FR: 'Type', ENG: 'Type' },
    'vehicles.table.state': { FR: 'État', ENG: 'State' },
    'vehicles.table.fuel': { FR: 'Carburant', ENG: 'Fuel' },

    'vehicles.form.make': { FR: 'Marque', ENG: 'Make' },
    'vehicles.form.model': { FR: 'Modèle', ENG: 'Model' },
    'vehicles.form.registration': { FR: 'Immatriculation', ENG: 'Registration' },
    'vehicles.form.vin': { FR: 'N° VIN', ENG: 'VIN' },
    'vehicles.form.type': { FR: 'Type', ENG: 'Type' },
    'vehicles.form.state': { FR: 'État', ENG: 'State' },
    'vehicles.form.fuel': { FR: 'Carburant', ENG: 'Fuel' },
    'vehicles.form.photos': { FR: 'Photos du véhicule (optionnel)', ENG: 'Vehicle Photos (optional)' },
    'vehicles.form.clickToAdd': { FR: 'Cliquez pour ajouter des photos', ENG: 'Click to add photos' },
    'vehicles.form.imageFormat': { FR: 'PNG, JPG (max 5MB chacune, max 10 photos)', ENG: 'PNG, JPG (max 5MB each, max 10 photos)' },

    'vehicles.type.car': { FR: 'Voiture', ENG: 'Car' },
    'vehicles.type.truck': { FR: 'Camion', ENG: 'Truck' },
    'vehicles.type.van': { FR: 'Van', ENG: 'Van' },
    'vehicles.type.motorcycle': { FR: 'Moto', ENG: 'Motorcycle' },
    'vehicles.type.bus': { FR: 'Bus', ENG: 'Bus' },
    'vehicles.type.trailer': { FR: 'Remorque', ENG: 'Trailer' },

    'vehicles.fuel.petrol': { FR: 'Essence', ENG: 'Petrol' },
    'vehicles.fuel.diesel': { FR: 'Diesel', ENG: 'Diesel' },
    'vehicles.fuel.electric': { FR: 'Électrique', ENG: 'Electric' },
    'vehicles.fuel.hybrid': { FR: 'Hybride', ENG: 'Hybrid' },

    // Driver Photo
    'drivers.form.photo': { FR: 'Photo', ENG: 'Photo' },
    'drivers.form.uploadVal': { FR: 'Télécharger une photo', ENG: 'Upload a photo' },
    'drivers.form.removePhoto': { FR: 'Supprimer la photo', ENG: 'Remove photo' },
    'drivers.form.photoHint': { FR: 'Format: JPG, PNG. Max: 5MB', ENG: 'Format: JPG, PNG. Max: 5MB' },

    // Vehicle-Geofence Association
    'geofences.manageVehicles': { FR: 'Gérer les véhicules', ENG: 'Manage Vehicles' },
    'geofences.manageVehiclesShort': { FR: 'Véhicules', ENG: 'Vehicles' },
    'geofences.addVehicle': { FR: 'Ajouter un véhicule', ENG: 'Add Vehicle' },
    'geofences.associatedVehicles': { FR: 'Véhicules associés', ENG: 'Associated Vehicles' },
    'geofences.noVehiclesAssociated': { FR: 'Aucun véhicule associé', ENG: 'No vehicles associated' },
    'geofences.vehicleAlreadyAssigned': { FR: 'Ce véhicule est déjà affecté à cette zone', ENG: 'This vehicle is already assigned to this zone' },

    // Common - Additional
    'common.vehicle': { FR: 'Véhicule', ENG: 'Vehicle' },
    'common.select': { FR: 'Sélectionner', ENG: 'Select' },
    'common.notes': { FR: 'Notes', ENG: 'Notes' },
    'common.optional': { FR: 'Optionnel', ENG: 'Optional' },
    'common.add': { FR: 'Ajouter', ENG: 'Add' },
    'common.deactivate': { FR: 'Désactiver', ENG: 'Deactivate' },
    'common.activate': { FR: 'Activer', ENG: 'Activate' },
    'common.confirmDelete': { FR: 'Êtes-vous sûr ?', ENG: 'Are you sure?' },
    'common.deleteSuccess': { FR: 'Supprimé avec succès', ENG: 'Deleted successfully' },
    'common.errorLoad': { FR: 'Erreur de chargement', ENG: 'Loading error' },
    'common.errorCreate': { FR: 'Erreur de création', ENG: 'Creation error' },
    'common.success': { FR: 'Succès', ENG: 'Success' },
    'common.errorUpdate': { FR: 'Erreur de mise à jour', ENG: 'Update error' },
    'common.errorDelete': { FR: 'Erreur de suppression', ENG: 'Deletion error' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string, params?: (string | number)[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(Language.FR);
    const [mounted, setMounted] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('fleetman-language');
        if (savedLang && Object.values(Language).includes(savedLang as Language)) {
            setLanguageState(savedLang as Language);
        }
    }, []);

    // Save language when it changes
    useEffect(() => {
    }, [language, mounted]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const toggleLanguage = () => {
        setLanguageState(prev => prev === Language.FR ? Language.ENG : Language.FR);
    };

    // Translation function
    const t = (key: string, params?: (string | number)[]): string => {
        let translation = key;
        if (translations[key]) {
            translation = translations[key][language as keyof typeof translations[typeof key]];
        } else {
            console.warn(`Translation missing for key: ${key}`);
        }

        if (params && params.length > 0) {
            params.forEach((param, index) => {
                translation = translation.replace(`{${index}}`, String(param));
            });
        }
        return translation;
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
