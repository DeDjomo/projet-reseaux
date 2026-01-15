
"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import incidentApi from '@/services/incidentApi';
import { Incident } from '@/types';
import { AlertTriangle, CheckCircle, Clock, Filter, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IncidentsPage() {
    const { t } = useLanguage();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('fleetman-user');
            let data: Incident[] = [];

            if (userStr) {
                const user = JSON.parse(userStr);
                // Use adminId (user.userId) to fetch incidents via the new composite method
                if (user.userId) {
                    data = await incidentApi.getByAdminId(user.userId);
                } else if (user.organizationId) {
                    data = await incidentApi.getByOrganization(user.organizationId);
                } else {
                    data = await incidentApi.getAll();
                }
            } else {
                data = await incidentApi.getAll();
            }
            setIncidents(data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast.error("Erreur lors du chargement des incidents");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: number) => {
        try {
            await incidentApi.resolve(id);
            toast.success("Incident résolu");
            fetchIncidents();
        } catch (error) {
            toast.error("Erreur lors de la résolution");
        }
    };

    const filteredIncidents = incidents.filter(inc => {
        if (statusFilter === 'ALL') return true;
        return inc.incidentStatus === statusFilter;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            case 'MAJOR': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
            case 'MINOR': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            case 'IN_PROGRESS': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
            case 'RESOLVED': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'CLOSED': return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-glass">
                <div>
                    <h1 className="text-xl font-bold text-text-main">{t('sidebar.incidents')}</h1>
                    <p className="text-sm text-text-muted">Suivi des incidents et alertes</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-glass border border-glass rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="OPEN">Ouverts</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="RESOLVED">Résolus</option>
                        <option value="CLOSED">Fermés</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredIncidents.length === 0 ? (
                        <div className="text-center py-12 bg-surface rounded-lg border border-glass">
                            <AlertTriangle size={48} className="mx-auto text-text-muted mb-4" />
                            <h3 className="text-lg font-medium text-text-main">Aucun incident trouvé</h3>
                        </div>
                    ) : (
                        filteredIncidents.map((incident) => (
                            <div key={incident.incidentId} className="bg-surface border border-glass rounded-lg p-4 hover:shadow-md transition duration-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${getSeverityColor(incident.incidentSeverity)}`}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-text-main">{incident.incidentType}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(incident.incidentStatus)}`}>
                                                    {incident.incidentStatus}
                                                </span>
                                            </div>
                                            <p className="text-text-sub mt-1">{incident.incidentDescription}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(incident.createdAt).toLocaleDateString()} {new Date(incident.createdAt).toLocaleTimeString()}
                                                </span>
                                                {/* Add Vehicle/Driver info if available in DTO */}
                                                {(incident as any).vehicleId && <span>Véhicule ID: {(incident as any).vehicleId}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {incident.incidentStatus !== 'RESOLVED' && incident.incidentStatus !== 'CLOSED' && (
                                        <button
                                            onClick={() => handleResolve(incident.incidentId)}
                                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg hover:bg-green-200 transition flex items-center gap-1"
                                        >
                                            <CheckCircle size={14} />
                                            Résoudre
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
