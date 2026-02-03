"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Send, Search, Filter, CheckCircle, Clock, AlertTriangle, Info, Building2, Users } from 'lucide-react';

interface Organization {
    organizationId: number;
    organizationName: string;
}

interface Notification {
    notificationId: number;
    title: string;
    message: string;
    priority: string;
    state: string;
    createdAt: string;
    fleetManagerId: number;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
    LOW: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Info, label: 'Information' },
    NORMAL: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle, label: 'Normal' },
    HIGH: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: AlertTriangle, label: 'Important' },
    CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertTriangle, label: 'Critique' },
};

export default function NotificationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [selectedOrg, setSelectedOrg] = useState<string>('all');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('NORMAL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [orgsRes, notifsRes] = await Promise.all([
                fetch('/api/organizations'),
                fetch('/api/notifications')
            ]);

            if (orgsRes.ok) {
                const orgsData = await orgsRes.json();
                setOrganizations(Array.isArray(orgsData) ? orgsData : []);
            }

            if (notifsRes.ok) {
                const notifsData = await notifsRes.json();
                setNotifications(Array.isArray(notifsData) ? notifsData : []);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            // For now, we create a notification (the real implementation would broadcast)
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    message,
                    priority,
                    fleetManagerId: 1, // Would need to get actual fleet manager IDs for the org
                }),
            });

            if (response.ok) {
                setSuccess(`Notification envoyée avec succès !`);
                setTitle('');
                setMessage('');
                setPriority('NORMAL');
                setSelectedOrg('all');
                fetchData();
            } else {
                setError("Échec de l'envoi de la notification");
            }
        } catch (err) {
            setError("Erreur lors de l'envoi");
        } finally {
            setSending(false);
        }
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
    const totalSent = notifications.length;
    const readNotifications = notifications.filter(n => n.state === 'READ').length;
    const criticalNotifications = notifications.filter(n => n.priority === 'CRITICAL' || n.priority === 'HIGH').length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Bell className="h-7 w-7 text-purple-500" />
                        Notifications
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Centre de notifications (Lecture seule)
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Send className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-sub">Reçues</p>
                            <p className="text-2xl font-bold text-text-main">{notifications.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-sub">Lues</p>
                            <p className="text-2xl font-bold text-green-500">{readNotifications}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface rounded-lg border border-glass p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-text-sub">Critiques</p>
                            <p className="text-2xl font-bold text-orange-500">{criticalNotifications}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications List - Full Width since form is gone */}
            <div className="bg-surface rounded-lg border border-glass overflow-hidden">
                <div className="px-4 py-3 border-b border-glass bg-background/50">
                    <h2 className="text-lg font-semibold text-text-main flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        Historique des notifications
                    </h2>
                </div>
                <div className="divide-y divide-glass">
                    {loading ? (
                        <div className="p-8 text-center text-text-muted">
                            Chargement...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-text-muted">
                            Aucune notification
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const priorityStyle = PRIORITY_STYLES[notif.priority] || PRIORITY_STYLES.NORMAL;
                            const PriorityIcon = priorityStyle.icon;

                            return (
                                <div key={notif.notificationId} className="p-4 hover:bg-glass/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${priorityStyle.bg}`}>
                                            <PriorityIcon size={16} className={priorityStyle.text} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-medium text-text-main truncate">
                                                    {notif.title}
                                                </h3>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${notif.state === 'READ'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {notif.state === 'READ' ? 'Lu' : 'Non lu'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-sub line-clamp-2 mt-1">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-text-muted mt-2">
                                                {formatDate(notif.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
