"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Search, Filter, Eye, CheckCircle, Clock, AlertCircle, XCircle, Car, User, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

// Types
interface Incident {
    incidentId: number;
    incidentType: string;
    incidentDescription: string;
    incidentSeverity: string;
    incidentStatus: string;
    incidentReport: string;
    incidentDateTime: string;
    driverId: number;
    driverName: string;
    vehicleId: number;
    vehicleRegistration: string;
    organizationName?: string;
    fleetName?: string;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    LOW: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Mineur' },
    MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Modéré' },
    HIGH: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Majeur' },
    CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Critique' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
    RESOLVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle, label: 'Résolu' },
    CLOSED: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', icon: XCircle, label: 'Fermé' },
};

const INCIDENT_TYPES: Record<string, string> = {
    ACCIDENT: 'Accident',
    BREAKDOWN: 'Panne',
    THEFT: 'Vol',
    VANDALISM: 'Vandalisme',
    OTHER: 'Autre',
};

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchIncidents();
    }, []);

    useEffect(() => {
        filterIncidents();
    }, [searchQuery, severityFilter, statusFilter, typeFilter, incidents]);

    const fetchIncidents = async () => {
        try {
            const response = await fetch('/api/incidents');
            if (response.ok) {
                const data = await response.json();
                const safeData = Array.isArray(data) ? data.filter((i: any) => i.incidentStatus !== 'UNDER_INVESTIGATION' && i.incidentStatus !== 'REPORTED') : [];
                setIncidents(safeData);
            }
        } catch (error) {
            console.error("Failed to fetch incidents", error);
        } finally {
            setLoading(false);
        }
    };

    const filterIncidents = () => {
        let result = [...incidents];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(inc =>
                inc.incidentDescription?.toLowerCase().includes(query) ||
                inc.driverName?.toLowerCase().includes(query) ||
                inc.vehicleRegistration?.toLowerCase().includes(query) ||
                inc.organizationName?.toLowerCase().includes(query) ||
                inc.fleetName?.toLowerCase().includes(query)
            );
        }

        if (severityFilter !== 'ALL') {
            result = result.filter(inc => inc.incidentSeverity === severityFilter);
        }

        if (statusFilter !== 'ALL') {
            result = result.filter(inc => inc.incidentStatus === statusFilter);
        }

        if (typeFilter !== 'ALL') {
            result = result.filter(inc => inc.incidentType === typeFilter);
        }

        setFilteredIncidents(result);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Stats
    const totalIncidents = incidents.length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <AlertTriangle className="h-7 w-7 text-red-500" />
                        Incidents & Accidents
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Suivi global des incidents sur toutes les organisations
                    </p>
                </div>
            </div>

            {/* Premium Stats Card */}
            <div className="flex justify-center">
                <div className="bg-surface rounded-2xl border border-glass p-6 shadow-sm transition-all hover:shadow-md w-full max-w-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg text-white">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-sub uppercase tracking-wider">Total Incidents</p>
                            <p className="text-3xl font-black text-text-main">{totalIncidents}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface rounded-lg border border-glass p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par description, conducteur, véhicule, organisation ou flotte..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-cyan-500/20 outline-none"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-cyan-500/20 outline-none"
                    >
                        <option value="ALL">Tous types</option>
                        {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-cyan-500/20 outline-none"
                    >
                        <option value="ALL">Toutes sévérités</option>
                        {Object.entries(SEVERITY_COLORS)
                            .filter(([key]) => key !== 'CRITICAL')
                            .map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                        <option value="ALL">Tous statuts</option>
                        {Object.entries(STATUS_COLORS).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface shadow rounded-lg border border-glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-text-main font-semibold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Organisation & Flotte</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Sévérité</th>
                                <th className="px-4 py-3">Statut</th>
                                <th className="px-4 py-3">Conducteur</th>
                                <th className="px-4 py-3">Véhicule</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass text-text-main">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-text-main">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-text-main">
                                        Aucun incident trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredIncidents.map((incident) => {
                                    const severity = SEVERITY_COLORS[incident.incidentSeverity] || SEVERITY_COLORS.LOW;
                                    const status = STATUS_COLORS[incident.incidentStatus] || STATUS_COLORS.REPORTED;
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr key={incident.incidentId} className="hover:bg-glass/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-text-main">
                                                    {INCIDENT_TYPES[incident.incidentType] || incident.incidentType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                                                        {incident.organizationName || 'Sans Org.'}
                                                    </span>
                                                    <span className="text-sm font-medium text-text-sub">
                                                        {incident.fleetName || 'Sans Flotte'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 max-w-[200px] truncate">
                                                {incident.incidentDescription || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${severity.bg} ${severity.text}`}>
                                                    {severity.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-text-sub">
                                                <div className="flex items-center gap-1">
                                                    <User size={14} className="text-text-sub" />
                                                    <span className="font-medium">{incident.driverName || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-text-sub">
                                                <div className="flex items-center gap-1">
                                                    <Car size={14} className="text-blue-500" />
                                                    <span className="font-mono text-xs font-bold">{incident.vehicleRegistration || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-text-sub text-xs font-medium">
                                                {formatDate(incident.incidentDateTime)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-glass text-sm text-text-sub font-medium">
                    {filteredIncidents.length} incident(s) affiché(s)
                </div>
            </div>
        </div>
    );
}
