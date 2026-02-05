"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardChartsProps {
    stats: {
        activeOrgs: number;
        suspendedOrgs: number;
        deletedOrgs?: number;
        incidents: number;
    };
    planStats?: {
        FREE: number;
        BASIC: number;
        PROFESSIONAL: number;
        ENTERPRISE: number;
    };
}

export default function DashboardCharts({ stats, planStats }: DashboardChartsProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Data for Organizations Pie Chart
    const orgData = [
        { name: 'Actives', value: stats.activeOrgs },
        { name: 'Suspendues', value: stats.suspendedOrgs },
        { name: 'Supprimées', value: stats.deletedOrgs || 0 },
    ];

    const ORG_COLORS = ['#3b82f6', '#f97316', '#ef4444']; // Blue, Orange, Red

    // Data for Plans Bar Chart
    const planData = [
        { name: 'Basique', value: planStats?.BASIC || 0, color: '#3b82f6' }, // Blue
        { name: 'Pro', value: planStats?.PROFESSIONAL || 0, color: '#0ea5e9' }, // Cyan
        { name: 'Entreprise', value: planStats?.ENTERPRISE || 0, color: '#f59e0b' }, // Amber
    ];

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface border border-glass p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-text-main">{label ? label : payload[0].name}</p>
                    <p className="text-sm text-text-sub">
                        {payload[0].value} Organisations
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Organizations Chart */}
            <div className="bg-surface rounded-xl border border-glass p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text-main mb-4 uppercase tracking-wider text-xs">Statut des Organisations</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={orgData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {orgData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ORG_COLORS[index % ORG_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => <span className="text-text-sub font-medium ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Plans Chart */}
            <div className="bg-surface rounded-xl border border-glass p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text-main mb-4 uppercase tracking-wider text-xs">Organisations par Forfait</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={planData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={isDark ? '#a1a1aa' : '#64748b'}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke={isDark ? '#a1a1aa' : '#64748b'}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                {planData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
