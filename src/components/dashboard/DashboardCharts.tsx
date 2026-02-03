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
        incidents: number;
    };
    incidentStats?: {
        critical: number;
        major: number;
        minor: number;
        info: number;
    };
}

export default function DashboardCharts({ stats, incidentStats }: DashboardChartsProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Data for Organizations Pie Chart
    const orgData = [
        { name: 'Actives', value: stats.activeOrgs },
        { name: 'Suspendues', value: stats.suspendedOrgs },
    ];

    const ORG_COLORS = ['#22c55e', '#f97316']; // Green, Orange

    // Data for Incidents Bar Chart (using stats or defaults)
    // If we don't have detailed stats yet, we simulate or use what we have
    const incidentData = [
        { name: 'Critique', value: incidentStats?.critical || 0, color: '#ef4444' },
        { name: 'Majeur', value: incidentStats?.major || 0, color: '#f97316' },
        { name: 'Mineur', value: incidentStats?.minor || 0, color: '#eab308' },
        { name: 'Info', value: incidentStats?.info || 0, color: '#3b82f6' },
    ];

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface border border-border-glass p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-text-main">{label ? label : payload[0].name}</p>
                    <p className="text-sm text-text-sub">
                        {payload[0].value} {payload[0].name === 'Actives' || payload[0].name === 'Suspendues' ? 'Organisations' : 'Incidents'}
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
                <h3 className="text-lg font-bold text-text-main mb-4">Répartition des Organisations</h3>
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

            {/* Incidents Chart */}
            <div className="bg-surface rounded-xl border border-glass p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text-main mb-4">Incidents par Sévérité</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={incidentData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={isDark ? '#a1a1aa' : '#64748b'}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke={isDark ? '#a1a1aa' : '#64748b'}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {incidentData.map((entry, index) => (
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
