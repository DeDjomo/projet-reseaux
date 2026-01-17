"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Download, Calendar, BarChart2, PieChart, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
    const { t } = useLanguage();

    const reportTypes = [
        {
            id: 'fleet-performance',
            nameKey: 'reports.fleetPerformance',
            descKey: 'reports.fleetPerformanceDesc',
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/20'
        },
        {
            id: 'fuel-consumption',
            nameKey: 'reports.fuelConsumption',
            descKey: 'reports.fuelConsumptionDesc',
            icon: BarChart2,
            color: 'text-green-500',
            bg: 'bg-green-100 dark:bg-green-900/20'
        },
        {
            id: 'maintenance-costs',
            nameKey: 'reports.maintenanceCosts',
            descKey: 'reports.maintenanceCostsDesc',
            icon: PieChart,
            color: 'text-orange-500',
            bg: 'bg-orange-100 dark:bg-orange-900/20'
        },
        {
            id: 'driver-activity',
            nameKey: 'reports.driverActivity',
            descKey: 'reports.driverActivityDesc',
            icon: FileText,
            color: 'text-purple-500',
            bg: 'bg-purple-100 dark:bg-purple-900/20'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main">
                    {t('reports.title')}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    {t('reports.subtitle')}
                </p>
            </div>

            {/* Date Range Selector */}
            <div className="bg-surface rounded-lg border border-glass p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-text-muted" />
                    <span className="text-text-sub">{t('reports.period')}:</span>
                </div>
                <select className="px-3 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary">
                    <option>{t('reports.last7days')}</option>
                    <option>{t('reports.last30days')}</option>
                    <option>{t('reports.last90days')}</option>
                    <option>{t('reports.thisYear')}</option>
                    <option>{t('reports.custom')}</option>
                </select>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        className="bg-surface rounded-lg border border-glass shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${report.bg}`}>
                                <report.icon size={24} className={report.color} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-text-main">{t(report.nameKey)}</h3>
                                <p className="text-sm text-text-muted mt-1">{t(report.descKey)}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-glass flex gap-3">
                            <button className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium">
                                {t('reports.generate')}
                            </button>
                            <button className="px-4 py-2 border border-glass text-text-main rounded-lg hover:bg-glass transition-colors text-sm font-medium flex items-center gap-2">
                                <Download size={16} />
                                PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for Report Preview */}
            <div className="bg-surface rounded-lg border border-glass p-8 text-center">
                <FileText size={48} className="mx-auto text-text-muted mb-4" />
                <h3 className="text-lg font-medium text-text-main">{t('reports.preview')}</h3>
                <p className="text-text-muted mt-1">{t('reports.selectReport')}</p>
            </div>
        </div>
    );
}
