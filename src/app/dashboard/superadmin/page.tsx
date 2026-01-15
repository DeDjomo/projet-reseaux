"use client";

import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, Shield, CreditCard, AlertCircle } from 'lucide-react';
import { organizationApi, adminApi } from '@/services';
import { Organization } from '@/types';

interface DashboardStats {
    totalOrganizations: number;
    totalAdmins: number;
    recentOrganizations: Organization[];
    subscriptionBreakdown: { plan: string; count: number }[];
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrganizations: 0,
        totalAdmins: 0,
        recentOrganizations: [],
        subscriptionBreakdown: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch organizations and admins
                const [organizations, admins] = await Promise.all([
                    organizationApi.getAll(),
                    adminApi.getAll()
                ]);

                // Calculate subscription breakdown
                const planCounts: Record<string, number> = {};
                organizations.forEach(org => {
                    const plan = org.subscriptionPlan || 'BASIC';
                    planCounts[plan] = (planCounts[plan] || 0) + 1;
                });

                const subscriptionBreakdown = Object.entries(planCounts).map(([plan, count]) => ({
                    plan,
                    count
                }));

                // Sort by creation date and get recent 5
                const recentOrganizations = [...organizations]
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    .slice(0, 5);

                setStats({
                    totalOrganizations: organizations.length,
                    totalAdmins: admins.length,
                    recentOrganizations,
                    subscriptionBreakdown
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'BASIC': return 'bg-blue-500';
            case 'PROFESSIONAL': return 'bg-purple-500';
            case 'ENTERPRISE': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const getPlanLabel = (plan: string) => {
        switch (plan) {
            case 'BASIC': return 'Basic';
            case 'PROFESSIONAL': return 'Professional';
            case 'ENTERPRISE': return 'Enterprise';
            default: return plan;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                    <Shield className="text-purple-500" />
                    Tableau de bord SuperAdmin
                </h1>
                <p className="text-text-muted mt-1">
                    Vue d'ensemble de la plateforme FleetMan
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface border border-glass rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/20">
                            <Building2 className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Organisations</p>
                            <p className="text-2xl font-bold text-text-main">{stats.totalOrganizations}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-glass rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/20">
                            <Users className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Administrateurs</p>
                            <p className="text-2xl font-bold text-text-main">{stats.totalAdmins}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-glass rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/20">
                            <TrendingUp className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Plans Pro</p>
                            <p className="text-2xl font-bold text-text-main">
                                {stats.subscriptionBreakdown.find(s => s.plan === 'PROFESSIONAL')?.count || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-glass rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-orange-500/20">
                            <CreditCard className="text-orange-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Enterprise</p>
                            <p className="text-2xl font-bold text-text-main">
                                {stats.subscriptionBreakdown.find(s => s.plan === 'ENTERPRISE')?.count || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Organizations */}
                <div className="bg-surface border border-glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        <Building2 size={20} />
                        Organisations récentes
                    </h2>
                    {stats.recentOrganizations.length === 0 ? (
                        <p className="text-text-muted text-center py-4">Aucune organisation</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentOrganizations.map(org => (
                                <div key={org.organizationId} className="flex items-center justify-between p-3 bg-glass/30 rounded-lg">
                                    <div>
                                        <p className="font-medium text-text-main">{org.organizationName}</p>
                                        <p className="text-sm text-text-muted">{org.organizationCity}, {org.organizationCountry}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPlanColor(org.subscriptionPlan || 'BASIC')}`}>
                                        {getPlanLabel(org.subscriptionPlan || 'BASIC')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subscription Breakdown */}
                <div className="bg-surface border border-glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        <CreditCard size={20} />
                        Répartition des abonnements
                    </h2>
                    {stats.subscriptionBreakdown.length === 0 ? (
                        <p className="text-text-muted text-center py-4">Aucune donnée</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.subscriptionBreakdown.map(item => (
                                <div key={item.plan}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-text-main">{getPlanLabel(item.plan)}</span>
                                        <span className="text-sm text-text-muted">{item.count} orgs</span>
                                    </div>
                                    <div className="w-full bg-glass rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${getPlanColor(item.plan)}`}
                                            style={{ width: `${(item.count / stats.totalOrganizations) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
