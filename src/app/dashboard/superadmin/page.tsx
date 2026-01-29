"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Building2,
    Users,
    Truck,
    Car,
    UserCog,
    MapPin,
    AlertTriangle,
    Plus,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { superAdminApi } from '@/services/superAdminApi';
import organizationApi from '@/services/organizationApi';
import { adminApi } from '@/services/userApi';
import { Organization, Admin } from '@/types';

interface DashboardStats {
    organizations: number;
    admins: number;
    fleets: number;
    vehicles: number;
    fleetManagers: number;
    geofences: number;
    incidents: number;
}

export default function SuperAdminDashboardPage() {
    const { t } = useLanguage();
    const [stats, setStats] = useState<DashboardStats>({
        organizations: 0,
        admins: 0,
        fleets: 0,
        vehicles: 0,
        fleetManagers: 0,
        geofences: 0,
        incidents: 0
    });
    const [recentOrgs, setRecentOrgs] = useState<Organization[]>([]);
    const [recentAdmins, setRecentAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardStats, orgsData, adminsData] = await Promise.all([
                    superAdminApi.getDashboardStats(),
                    organizationApi.getAll(),
                    adminApi.getAll()
                ]);

                setStats(dashboardStats);
                setRecentOrgs(Array.isArray(orgsData) ? orgsData.slice(0, 5) : []);
                setRecentAdmins(Array.isArray(adminsData) ? adminsData.slice(0, 5) : []);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Main stats configuration
    const mainStats = [
        { name: 'Organisations', value: stats.organizations, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20', href: '/dashboard/superadmin/organizations' },
        { name: 'Administrateurs', value: stats.admins, icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20', href: '/dashboard/superadmin/admins' },
        { name: 'Flottes', value: stats.fleets, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', href: '/dashboard/superadmin/fleets' },
        { name: 'Véhicules', value: stats.vehicles, icon: Car, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20', href: '/dashboard/superadmin/vehicles' },
    ];

    // Secondary stats
    const secondaryStats = [
        { name: 'Fleet Managers', value: stats.fleetManagers, icon: UserCog, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/20', href: '/dashboard/superadmin/fleet-managers' },
        { name: 'Geofences', value: stats.geofences, icon: MapPin, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/20', href: '#' },
        { name: 'Incidents', value: stats.incidents, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20', href: '#' },
    ];

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">
                        Tableau de bord Super Admin
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Vue d'ensemble de la plateforme FleetMan
                    </p>
                </div>
                <Link
                    href="/dashboard/superadmin/organizations"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    Nouvelle Organisation
                </Link>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {mainStats.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="bg-surface overflow-hidden rounded-lg shadow border border-glass hover:shadow-md hover:border-purple-500/30 transition-all"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`p-3 rounded-md ${item.bg}`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-text-sub truncate">
                                            {item.name}
                                        </dt>
                                        <dd>
                                            <div className="text-2xl font-bold text-text-main">
                                                {loading ? '...' : item.value.toLocaleString()}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {secondaryStats.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="bg-surface overflow-hidden rounded-lg shadow border border-glass p-4 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${item.bg}`}>
                                <item.icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-sm text-text-sub">{item.name}</p>
                                <p className="text-xl font-semibold text-text-main">
                                    {loading ? '...' : item.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Organizations */}
                <div className="bg-surface shadow rounded-lg border border-glass overflow-hidden">
                    <div className="px-6 py-4 border-b border-glass flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-text-main">Dernières Organisations</h3>
                        <Link href="/dashboard/superadmin/organizations" className="text-purple-500 hover:text-purple-400 text-sm flex items-center gap-1">
                            Voir tout <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background/50 text-text-sub font-medium">
                                <tr>
                                    <th className="px-6 py-3">Nom</th>
                                    <th className="px-6 py-3">Plan</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass text-text-main">
                                {loading ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-text-muted">Chargement...</td></tr>
                                ) : recentOrgs.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-text-muted">Aucune organisation</td></tr>
                                ) : (
                                    recentOrgs.map((org) => (
                                        <tr key={org.organizationId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-6 py-3 font-medium">{org.organizationName}</td>
                                            <td className="px-6 py-3">
                                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                    {org.subscriptionPlan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-text-sub">{formatDate(org.createdAt)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Admins */}
                <div className="bg-surface shadow rounded-lg border border-glass overflow-hidden">
                    <div className="px-6 py-4 border-b border-glass flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-text-main">Derniers Administrateurs</h3>
                        <Link href="/dashboard/superadmin/admins" className="text-purple-500 hover:text-purple-400 text-sm flex items-center gap-1">
                            Voir tout <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background/50 text-text-sub font-medium">
                                <tr>
                                    <th className="px-6 py-3">Nom</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Rôle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass text-text-main">
                                {loading ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-text-muted">Chargement...</td></tr>
                                ) : recentAdmins.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-text-muted">Aucun administrateur</td></tr>
                                ) : (
                                    recentAdmins.map((admin) => (
                                        <tr key={admin.adminId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-6 py-3 font-medium">{admin.adminFirstName} {admin.adminLastName}</td>
                                            <td className="px-6 py-3 text-text-sub">{admin.adminEmail}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${admin.adminRole === 'SUPER_ADMIN'
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {admin.adminRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Org Manager'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
