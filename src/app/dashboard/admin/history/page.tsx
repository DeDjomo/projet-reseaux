"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import tripApi from '@/services/tripApi';
import incidentApi from '@/services/incidentApi';
import { Trip, Incident } from '@/types';
import { History, MapPin, AlertTriangle, Calendar, Clock, ArrowRight } from 'lucide-react';

type HistoryItem = {
    id: number;
    type: 'trip' | 'incident';
    title: string;
    description: string;
    date: string;
    status?: string;
};

export default function HistoryPage() {
    const { t } = useLanguage();
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'trips' | 'incidents'>('all');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [trips, incidents] = await Promise.all([
                    tripApi.getAll(),
                    incidentApi.getAll()
                ]);

                const tripItems: HistoryItem[] = trips.map((trip: Trip) => ({
                    id: trip.tripId,
                    type: 'trip' as const,
                    title: `${t('history.trips')} #${trip.tripId}`,
                    description: `${trip.tripStartLocation || 'Départ'} → ${trip.tripEndLocation || 'Arrivée'}`,
                    date: trip.tripStartTime || trip.createdAt,
                    status: trip.tripStatus
                }));

                const incidentItems: HistoryItem[] = incidents.map((incident: Incident) => ({
                    id: incident.incidentId,
                    type: 'incident' as const,
                    title: incident.incidentType || t('history.incidents'),
                    description: incident.incidentDescription || 'Pas de description',
                    date: incident.incidentDate || incident.createdAt,
                    status: incident.incidentStatus
                }));

                const combined = [...tripItems, ...incidentItems]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setHistoryItems(combined);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [t]);

    const filteredHistory = historyItems.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'trips') return item.type === 'trip';
        if (filter === 'incidents') return item.type === 'incident';
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main">
                    {t('history.title')}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    {t('history.subtitle')}
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-glass pb-2">
                {(['all', 'trips', 'incidents'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${filter === f
                            ? 'bg-secondary text-white'
                            : 'text-text-sub hover:bg-glass'
                            }`}
                    >
                        {f === 'all' ? t('history.all') : f === 'trips' ? t('history.trips') : t('history.incidents')}
                    </button>
                ))}
            </div>

            {/* History List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-glass">
                    <History size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-medium text-text-main">{t('history.noHistory')}</h3>
                    <p className="text-text-muted mt-1">{t('history.eventsAppear')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHistory.map((item) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="bg-surface rounded-lg border border-glass p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
                        >
                            <div className={`p-2 rounded-lg ${item.type === 'trip'
                                ? 'bg-blue-100 dark:bg-blue-900/20'
                                : 'bg-red-100 dark:bg-red-900/20'
                                }`}>
                                {item.type === 'trip'
                                    ? <MapPin size={20} className="text-blue-500" />
                                    : <AlertTriangle size={20} className="text-red-500" />
                                }
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-text-main">{item.title}</h3>
                                    {item.status && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-glass text-text-sub">
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-sub mt-1 truncate">{item.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(item.date).toLocaleDateString('fr-FR')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <button className="p-2 text-text-muted hover:text-text-main transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
