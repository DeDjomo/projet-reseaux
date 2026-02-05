"use client";

import React, { useEffect, useState } from 'react';
import {
    Building2,
    AlertTriangle,
    Plus,
    ArrowRight,
    Activity,
    TrendingUp,
    Bell,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import organizationApi from '@/services/organizationApi';
import { Organization } from '@/types';

import DashboardCharts from '@/components/dashboard/DashboardCharts';

interface DashboardStats {
    organizations: number;
    admins: number;
    activeOrgs: number;
    suspendedOrgs: number;
    deletedOrgs: number;
    incidents: number;
    // Detailed incident stats
    incidentBreakdown: {
        critical: number;
        major: number;
        minor: number;
        info: number;
    }
}

export default function SuperAdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats & { planStats: any }>({
        organizations: 0,
        admins: 0,
        activeOrgs: 0,
        suspendedOrgs: 0,
        deletedOrgs: 0,
        incidents: 0,
        incidentBreakdown: { critical: 0, major: 0, minor: 0, info: 0 },
        planStats: { FREE: 0, BASIC: 0, PROFESSIONAL: 0, ENTERPRISE: 0 }
    });
    const [recentOrgs, setRecentOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orgsData, deletedCount, incidentsRes] = await Promise.all([
                    organizationApi.getAll(),
                    organizationApi.countDeleted(),
                    fetch('/api/incidents').then(r => r.ok ? r.json() : [])
                ]);

                const orgs = Array.isArray(orgsData) ? orgsData : [];
                const incidents = Array.isArray(incidentsRes) ? incidentsRes : [];

                // Calculate plan stats
                const plans = {
                    FREE: orgs.filter((o: Organization) => o.subscriptionPlan === 'FREE').length,
                    BASIC: orgs.filter((o: Organization) => o.subscriptionPlan === 'BASIC').length,
                    PROFESSIONAL: orgs.filter((o: Organization) => o.subscriptionPlan === 'PROFESSIONAL').length,
                    ENTERPRISE: orgs.filter((o: Organization) => o.subscriptionPlan === 'ENTERPRISE').length,
                };

                // Calculate incident stats
                const breakdown = {
                    critical: incidents.filter((i: any) => i.severity === 'CRITICAL').length,
                    major: incidents.filter((i: any) => i.severity === 'MAJOR').length,
                    minor: incidents.filter((i: any) => i.severity === 'MINOR').length,
                    info: incidents.filter((i: any) => i.severity === 'INFO').length
                };

                setStats({
                    organizations: orgs.length,
                    admins: 0,
                    activeOrgs: orgs.filter((o: Organization) => o.isActive).length,
                    suspendedOrgs: orgs.filter((o: Organization) => !o.isActive).length,
                    deletedOrgs: deletedCount,
                    incidents: incidents.length,
                    incidentBreakdown: breakdown,
                    planStats: plans
                });

                setRecentOrgs(orgs.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Stats pour le Super Admin (propriétaire de la plateforme)
    const mainStats = [
        {
            name: 'Organisations',
            value: stats.organizations,
            icon: Building2,
            iconClass: 'text-white',
            bgClass: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            href: '/dashboard/superadmin/organizations'
        },
        {
            name: 'Incidents',
            value: stats.incidents,
            icon: AlertTriangle,
            iconClass: 'text-white',
            bgClass: 'bg-gradient-to-br from-orange-500 to-red-500',
            href: '/dashboard/superadmin/incidents'
        },
    ];

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getSubscriptionBadge = (plan: string) => {
        const styles: Record<string, string> = {
            FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
            BASIC: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
            PROFESSIONAL: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
            ENTERPRISE: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
        };
        return styles[plan] || styles.FREE;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-text-main">
                        Tableau de bord
                    </h1>
                    <p className="mt-1 text-sm text-text-muted flex items-center gap-2">
                        <Activity size={16} className="text-cyan-500" />
                        Vue d'overview de la plateforme FleetMan
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {mainStats.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group bg-surface overflow-hidden rounded-xl p-5 shadow-sm border border-glass transition-all duration-300 hover:shadow-lg hover:border-cyan-500/30"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-3 rounded-xl ${item.bgClass} shadow-lg`}>
                                <item.icon className={`h-5 w-5 ${item.iconClass}`} />
                            </div>
                            {item.name === 'Organisations' && (
                                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                                    <TrendingUp size={12} className="mr-1" />
                                    Actif
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-text-sub uppercase tracking-wider">
                            {item.name}
                        </p>
                        <p className="text-2xl lg:text-3xl font-bold text-text-main">
                            {loading ? (
                                <span className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-12 rounded block" />
                            ) : (
                                item.value.toLocaleString()
                            )}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Charts Section - NEW */}
            <DashboardCharts
                stats={stats}
                planStats={stats.planStats}
            />

            {/* Tables */}
            <div className="grid grid-cols-1 gap-6">
                {/* Recent Organizations */}
                <div className="bg-surface rounded-xl border border-glass shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-glass flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="text-cyan-500" size={18} />
                            <h3 className="font-semibold text-text-main">Dernières Organisations</h3>
                        </div>
                        <Link href="/dashboard/superadmin/organizations" className="text-sm text-cyan-500 hover:text-cyan-600 flex items-center gap-1 font-medium">
                            Voir tout <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-glass">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="p-4">
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                                </div>
                            ))
                        ) : recentOrgs.length === 0 ? (
                            <div className="p-8 text-center text-text-muted">Aucune organisation</div>
                        ) : (
                            recentOrgs.map((org) => (
                                <div key={org.organizationId} className="p-4 flex items-center justify-between hover:bg-glass/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${org.isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                            <Building2 size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-main text-sm">{org.organizationName}</p>
                                            <p className="text-xs text-text-muted font-medium mt-0.5">{formatDate(org.createdAt)}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getSubscriptionBadge(org.subscriptionPlan)}`}>
                                        {org.subscriptionPlan}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
