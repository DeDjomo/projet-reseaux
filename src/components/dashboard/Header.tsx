"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Globe, Bell, Search, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { notificationApi } from '@/services/notificationApi';
import { Notification } from '@/types';

export default function Header() {
    const { language, toggleLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mock Organization Logo
    const orgLogoUrl = null;
    const orgName = "My Organization";

    // Get adminId from localStorage
    const getAdminId = (): number | null => {
        const userStr = localStorage.getItem('fleetman-user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.userId || null;
        }
        return null;
    };

    // Fetch unread count on mount
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const adminId = getAdminId();
            if (adminId) {
                try {
                    const count = await notificationApi.countUnreadByAdminId(adminId);
                    setUnreadCount(count);
                } catch (error) {
                    console.error('Failed to fetch unread count:', error);
                }
            }
        };
        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch notifications when dropdown opens
    const handleBellClick = async () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setLoading(true);
            const adminId = getAdminId();
            if (adminId) {
                try {
                    const data = await notificationApi.getByAdminId(adminId);
                    setNotifications(data.slice(0, 10)); // Show last 10
                } catch (error) {
                    console.error('Failed to fetch notifications:', error);
                }
            }
            setLoading(false);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        const adminId = getAdminId();
        if (adminId) {
            try {
                await notificationApi.markAllAsReadByAdminId(adminId);
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, state: 'READ' as any })));
            } catch (error) {
                console.error('Failed to mark all as read:', error);
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ALERT': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'WARNING': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins}min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        return `Il y a ${diffDays}j`;
    };

    return (
        <header className="h-16 bg-nav border-b border-glass flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">

            {/* Left: Search Bar */}
            <div className="flex items-center flex-1">
                <div className="relative w-full max-w-md hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-text-muted" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="block w-full pl-10 pr-3 py-2 border border-glass rounded-full leading-5 bg-glass-light text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary sm:text-sm transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-4">

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="p-2 rounded-full hover:bg-glass text-text-sub transition-all flex items-center gap-1"
                    title="Change Language"
                >
                    <Globe size={20} />
                    <span className="text-xs font-bold">{language}</span>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-glass text-text-sub transition-all"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={handleBellClick}
                        className="p-2 rounded-full hover:bg-glass text-text-sub transition-all relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-surface border border-glass rounded-lg shadow-xl overflow-hidden z-50">
                            <div className="p-3 border-b border-glass flex items-center justify-between bg-glass/30">
                                <h3 className="font-semibold text-text-main">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-secondary hover:underline flex items-center gap-1"
                                    >
                                        <Check size={12} />
                                        Tout marquer comme lu
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 text-center text-text-muted">
                                        Chargement...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-6 text-center text-text-muted">
                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>Aucune notification</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.notificationId}
                                            className={`p-3 border-b border-glass last:border-0 hover:bg-glass/30 transition cursor-pointer ${notif.state === 'UNREAD' ? 'bg-secondary/5' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${notif.state === 'UNREAD' ? 'font-medium text-text-main' : 'text-text-sub'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-1">
                                                        {formatTime(notif.createdAt)}
                                                    </p>
                                                </div>
                                                {notif.state === 'UNREAD' && (
                                                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-2 border-t border-glass text-center">
                                    <button className="text-sm text-secondary hover:underline">
                                        Voir toutes les notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Organization Logo / Avatar */}
                <div className="h-8 w-8 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center overflow-hidden">
                    {orgLogoUrl ? (
                        <img src={orgLogoUrl} alt={orgName} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-secondary">Org</span>
                    )}
                </div>
            </div>
        </header>
    );
}

