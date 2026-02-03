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
    incidentCost: number;
    incidentStatus: string;
    incidentReport: string;
    witnessName: string;
    witnessContact: string;
    incidentDateTime: string;
    driverId: number;
    driverName: string;
    vehicleId: number;
    vehicleRegistration: string;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    LOW: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Mineur' },
    MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Modéré' },
    HIGH: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Majeur' },
    CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Critique' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
    REPORTED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: AlertCircle, label: 'Signalé' },
    // UNDER_INVESTIGATION removed as per request
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
                // Filter out 'UNDER_INVESTIGATION' from backend data if present?
                // Or just don't show it as an option. User said "retirer le en cours".
                // Let'filter it out from display if present, or just leave it but not selectable.
                // Safest is to filter out if we want it "removed".
                const safeData = Array.isArray(data) ? data.filter((i: any) => i.incidentStatus !== 'UNDER_INVESTIGATION') : [];
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
                inc.vehicleRegistration?.toLowerCase().includes(query)
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

    const formatCost = (cost: number) => {
        if (!cost) return '-';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cost);
    };

    // Stats
    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter(i => i.incidentStatus === 'REPORTED').length; // Removed UNDER_INVESTIGATION
    const criticalIncidents = incidents.filter(i => i.incidentSeverity === 'CRITICAL' || i.incidentSeverity === 'HIGH').length;
    const totalCost = incidents.reduce((sum, i) => sum + (i.incidentCost || 0), 0);

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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <AlertTriangle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-sub">Total Incidents</p>
                            <p className="text-2xl font-bold text-text-main">{totalIncidents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-sub">Signalés</p>
                            <p className="text-2xl font-bold text-yellow-500">{openIncidents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-sub">Critiques</p>
                            <p className="text-2xl font-bold text-red-500">{criticalIncidents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Car className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-sub">Coût Total</p>
                            <p className="text-xl font-bold text-purple-500">{formatCost(totalCost)}</p>
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
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                        <option value="ALL">Tous types</option>
                        {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-glass focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                        <option value="ALL">Toutes sévérités</option>
                        {Object.entries(SEVERITY_COLORS).map(([key, { label }]) => (
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
                        <thead className="bg-background/50 text-text-sub font-medium">
                            <tr>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Sévérité</th>
                                <th className="px-4 py-3">Statut</th>
                                <th className="px-4 py-3">Conducteur</th>
                                <th className="px-4 py-3">Véhicule</th>
                                <th className="px-4 py-3">Coût</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass text-text-main">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-text-muted">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-text-muted">
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
                                                <span className="font-medium">
                                                    {INCIDENT_TYPES[incident.incidentType] || incident.incidentType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-[200px] truncate">
                                                {incident.incidentDescription || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${severity.bg} ${severity.text}`}>
                                                    {severity.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-text-sub">
                                                <div className="flex items-center gap-1">
                                                    <User size={14} />
                                                    {incident.driverName || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-text-sub">
                                                <div className="flex items-center gap-1">
                                                    <Car size={14} />
                                                    {incident.vehicleRegistration || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {formatCost(incident.incidentCost)}
                                            </td>
                                            <td className="px-4 py-3 text-text-sub text-xs">
                                                {formatDate(incident.incidentDateTime)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="p-2 hover:bg-glass rounded-full transition-colors text-text-sub hover:text-text-main">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-glass text-sm text-text-sub">
                    {filteredIncidents.length} incident(s) affiché(s)
                </div>
            </div>
        </div>
    );
}
