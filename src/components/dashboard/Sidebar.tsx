"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    LayoutDashboard,
    Truck,
    Car,
    Users,
    UserCog,
    FileText,
    History,
    CreditCard,
    LifeBuoy,
    ChevronRight,
    ChevronLeft,
    MapPin,
    AlertTriangle,
    Menu
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { t } = useLanguage();
    const { theme } = useTheme();

    const menuItems = [
        { name: t('sidebar.fleets'), icon: LayoutDashboard, href: '/dashboard/manager/fleets' },
        { name: t('sidebar.vehicles'), icon: Car, href: '/dashboard/manager/vehicles' },
        { name: t('sidebar.drivers'), icon: Users, href: '/dashboard/manager/drivers' },
        { name: t('sidebar.managers'), icon: UserCog, href: '/dashboard/manager/managers' },
        { name: t('sidebar.incidents'), icon: AlertTriangle, href: '/dashboard/manager/incidents' },
        { name: t('sidebar.geofences'), icon: MapPin, href: '/dashboard/manager/geofences' },
        { name: t('sidebar.reports'), icon: FileText, href: '/dashboard/manager/reports' },
        { name: t('sidebar.history'), icon: History, href: '/dashboard/manager/history' },
        { name: t('sidebar.subscription'), icon: CreditCard, href: '/dashboard/manager/subscription' },
        { name: t('sidebar.support'), icon: LifeBuoy, href: '/dashboard/manager/support' },
    ];

    return (
        <>
            {/* Mobile Toggle Button (Visible only on small screens when closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-surface border border-glass shadow-sm text-text-main"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen z-40 bg-nav border-r border-glass
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
                    flex flex-col shadow-xl
                `}
            >
                {/* Header / Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-glass bg-glass">
                    {isOpen ? (
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="FleetMan Logo" className="w-8 h-8 rounded-full object-cover" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                                FleetMan
                            </h1>
                        </div>
                    ) : (
                        <img src="/logo.png" alt="FleetMan Logo" className="w-8 h-8 rounded-full object-cover mx-auto" />
                    )}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="hidden md:flex p-1 rounded-full hover:bg-glass text-text-sub transition-colors"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center px-3 py-3 rounded-md transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-secondary/10 text-secondary border border-secondary/20'
                                        : 'text-text-sub hover:bg-glass hover:text-text-main hover:border-glass-border border border-transparent'}
                                `}
                            >
                                <item.icon
                                    size={22}
                                    className={`
                                        flex-shrink-0 transition-colors
                                        ${isActive ? 'text-secondary' : 'text-text-muted group-hover:text-text-main'}
                                    `}
                                />

                                <span
                                    className={`
                                        ml-3 font-medium whitespace-nowrap transition-all duration-200
                                        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'}
                                    `}
                                >
                                    {item.name}
                                </span>

                                {/* Tooltip for collapsed mode */}
                                {!isOpen && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-glass rounded shadow-lg text-sm text-text-main opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User Profile Summary (Mini) */}
                <div className="border-t border-glass p-4">
                    <div className={`flex items-center ${!isOpen && 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-text-sub">
                            OM
                        </div>

                        <div className={`ml-3 overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                            <p className="text-sm font-medium text-text-main truncate">{t('sidebar.profile.admin')}</p>
                            <p className="text-xs text-text-muted truncate">{t('sidebar.profile.manager')}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
