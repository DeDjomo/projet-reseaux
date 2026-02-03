"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, Globe, Sun, Moon, LogOut, Check, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { Notification } from '@/types';
import { notificationApi } from '@/services/notificationApi';
import Link from 'next/link';
import styles from './Header.module.css';

export default function SuperAdminHeader() {
    const { language, toggleLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get adminId from localStorage
    const getAdminId = (): number | null => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('fleetman-user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.userId || user.adminId || null;
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
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        const adminId = getAdminId();
        if (adminId) {
            try {
                const data = await notificationApi.getUnreadByAdminId(adminId);
                setNotifications(data.slice(0, 15));
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        }
        setLoading(false);
    };

    const handleBellClick = async () => {
        const newShow = !showNotifications;
        setShowNotifications(newShow);
        if (newShow) {
            await fetchNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        const adminId = getAdminId();
        if (adminId) {
            try {
                await notificationApi.markAllAsReadByAdminId(adminId);
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, notificationState: 'READ' })));
            } catch (error) {
                console.error('Failed to mark all as read:', error);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 bg-surface border-b border-glass flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
            <div className="flex-1"></div>

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

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-surface border border-glass rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="p-3 border-b border-glass flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                <h3 className="font-semibold text-text-main">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-secondary text-xs hover:underline">
                                        Tout marquer comme lu
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-text-muted">Aucune notification</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.notificationId} className="p-3 border-b border-glass hover:bg-glass transition-colors">
                                            <p className="text-sm font-medium text-text-main">{notif.notificationSubject}</p>
                                            <p className="text-xs text-text-muted mt-1">{new Date(notif.createdAt as any).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Admin Avatar */}
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xs ring-2 ring-purple-200 dark:ring-purple-800">
                    SA
                </div>
            </div>
        </header>
    );
}
