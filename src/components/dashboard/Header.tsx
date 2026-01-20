"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Globe, Sun, Moon, LogOut, Settings, User, Check, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { Notification, Vehicle, Driver } from '@/types';
import { notificationApi } from '@/services/notificationApi';
import { vehicleApi } from '@/services/vehicleApi';
import { driverApi } from '@/services/driverApi';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    const { language, toggleLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState(false);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ vehicles: Vehicle[], drivers: Driver[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

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
    const fetchNotifications = async (fetchAll: boolean = false) => {
        setLoading(true);
        const adminId = getAdminId();
        if (adminId) {
            try {
                const data = fetchAll
                    ? await notificationApi.getByAdminId(adminId)
                    : await notificationApi.getUnreadByAdminId(adminId);
                setNotifications(data.slice(0, 15)); // Show last 15
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
            await fetchNotifications(showAllNotifications);
        }
    };

    const handleToggleShowAll = async () => {
        const newShowAll = !showAllNotifications;
        setShowAllNotifications(newShowAll);
        await fetchNotifications(newShowAll);
    };

    // Mark all as read
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

    // Handle notification click - mark as read
    const handleNotificationClick = async (notif: Notification) => {
        if (notif.notificationState === 'UNREAD' || notif.notificationState === 'PENDING') {
            try {
                await notificationApi.markAsRead(notif.notificationId);
                // Update local state
                setNotifications(prev => prev.map(n =>
                    n.notificationId === notif.notificationId
                        ? { ...n, notificationState: 'READ' }
                        : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        // TODO: Navigate to related entity (vehicle, driver, etc.) based on notification type
    };
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search Logic
    useEffect(() => {
        const handleClickOutsideSearch = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideSearch);
        return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults(null);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);

        const adminId = getAdminId();
        if (adminId) {
            try {
                // Fetch basic data - optimize this later if needed
                const [vehicles, drivers] = await Promise.all([
                    vehicleApi.getByAdminId(adminId),
                    driverApi.getByAdminId(adminId)
                ]);

                const filteredVehicles = vehicles.filter(v =>
                    v.vehicleRegistrationNumber?.toLowerCase().includes(query.toLowerCase()) ||
                    v.vehicleMake?.toLowerCase().includes(query.toLowerCase()) ||
                    v.vehicleModel?.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);

                const filteredDrivers = drivers.filter(d =>
                    d.driverFirstName?.toLowerCase().includes(query.toLowerCase()) ||
                    d.driverLastName?.toLowerCase().includes(query.toLowerCase()) ||
                    d.driverLicenseNumber?.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);

                setSearchResults({ vehicles: filteredVehicles, drivers: filteredDrivers });
            } catch (error) {
                console.error("Search failed", error);
            }
        }
        setIsSearching(false);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ALERT': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'WARNING': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const formatTime = (dateVal: string | number[] | undefined) => {
        if (!dateVal) return t('date.unknown');

        let date: Date;

        // Handle array format from Java LocalDateTime [year, month, day, hour, minute, second, nano]
        if (Array.isArray(dateVal)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
            date = new Date(year, month - 1, day, hour, minute, second);
        } else {
            date = new Date(dateVal);
        }

        if (isNaN(date.getTime())) return t('date.invalid');

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('time.justNow');
        if (diffMins < 60) return t('time.minAgo', [diffMins]);
        if (diffHours < 24) return t('time.hourAgo', [diffHours]);
        return t('time.dayAgo', [diffDays]);
    };

    return (
        <header className="h-16 bg-nav border-b border-glass flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">

            {/* Left: Search Bar */}
            <div className="flex items-center flex-1">
                <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-text-muted" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('header.search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => { if (searchQuery.length >= 2) setShowSearchResults(true); }}
                        className="block w-full pl-10 pr-3 py-2 border border-glass rounded-full leading-5 bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary sm:text-sm transition-all"
                    />

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults && (
                        <div className="absolute top-full mt-2 w-full bg-surface-card border border-glass rounded-lg shadow-lg overflow-hidden z-50 text-text-main">
                            {isSearching ? (
                                <div className="p-4 text-center text-text-muted">{t('header.search.loading')}</div>
                            ) : (
                                <>
                                    {searchResults.vehicles.length === 0 && searchResults.drivers.length === 0 ? (
                                        <div className="p-4 text-center text-text-muted">{t('header.search.noResults')}</div>
                                    ) : (
                                        <>
                                            {searchResults.vehicles.length > 0 && (
                                                <div className="border-b border-glass last:border-0">
                                                    <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase bg-surface-glass">{t('header.search.vehicles')}</div>
                                                    {searchResults.vehicles.map(vehicle => (
                                                        <div
                                                            key={vehicle.vehicleId}
                                                            onClick={() => {
                                                                router.push(`/dashboard/manager/vehicles/${vehicle.vehicleId}`);
                                                                setShowSearchResults(false);
                                                            }}
                                                            className="px-4 py-2 hover:bg-surface-glass-hover cursor-pointer flex justify-between items-center"
                                                        >
                                                            <span className="font-medium text-text-main">{vehicle.vehicleRegistrationNumber}</span>
                                                            <span className="text-xs text-text-muted">{vehicle.vehicleMake} {vehicle.vehicleModel}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {searchResults.drivers.length > 0 && (
                                                <div className="border-b border-glass last:border-0">
                                                    <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase bg-surface-glass">{t('header.search.drivers')}</div>
                                                    {searchResults.drivers.map(driver => (
                                                        <div
                                                            key={driver.driverId}
                                                            onClick={() => {
                                                                router.push(`/dashboard/manager/drivers/${driver.driverId}`);
                                                                setShowSearchResults(false);
                                                            }}
                                                            className="px-4 py-2 hover:bg-surface-glass-hover cursor-pointer flex justify-between items-center"
                                                        >
                                                            <span className="font-medium text-text-main">{driver.driverFirstName} {driver.driverLastName}</span>
                                                            <span className="text-xs text-text-muted">{driver.driverLicenseNumber}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
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
                        <div className={styles.notificationDropdown}>
                            <div className={styles.notificationHeader}>
                                <h3 className={styles.notificationTitle}>
                                    {showAllNotifications ? t('header.notifications.title.all') : t('header.notifications.title.unread')}
                                    {!showAllNotifications && unreadCount > 0 && ` (${unreadCount})`}
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div className={styles.filterTabs}>
                                        <button
                                            onClick={() => { if (showAllNotifications) handleToggleShowAll(); }}
                                            className={`${styles.filterTab} ${!showAllNotifications ? styles.active : ''}`}
                                        >
                                            {t('header.notifications.filter.unread')}
                                        </button>
                                        <button
                                            onClick={() => { if (!showAllNotifications) handleToggleShowAll(); }}
                                            className={`${styles.filterTab} ${showAllNotifications ? styles.active : ''}`}
                                        >
                                            {t('header.notifications.filter.all')}
                                        </button>
                                    </div>

                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className={styles.markAllButton}
                                            title={t('header.notifications.markAll')}
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className={styles.notificationList}>
                                {loading ? (
                                    <div className={styles.loadingText}>
                                        {t('header.search.loading')}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className={styles.emptyText}>
                                        <Bell size={32} className={styles.emptyIcon} />
                                        <p>{t('header.notifications.empty')}</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.notificationId}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`${styles.notificationItem} ${(notif.notificationState === 'UNREAD' || notif.notificationState === 'PENDING') ? styles.unread : ''}`}
                                        >
                                            <div className={styles.notificationContent}>
                                                <div className={styles.notificationIcon}>
                                                    {getNotificationIcon(notif.notificationType)}
                                                </div>
                                                <div className={styles.notificationBody}>
                                                    <p className={styles.notificationSubject}>
                                                        {notif.notificationSubject}
                                                    </p>
                                                    <p className={styles.notificationTime}>
                                                        {formatTime(notif.createdAt)}
                                                    </p>
                                                </div>
                                                {(notif.notificationState === 'UNREAD' || notif.notificationState === 'PENDING') && (
                                                    <div className={styles.unreadDot}></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className={styles.notificationFooter}>
                                    <button className={styles.viewAllButton}>
                                        {t('header.notifications.viewAll')}
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

