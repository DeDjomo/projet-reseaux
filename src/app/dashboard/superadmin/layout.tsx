"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    Shield,
    Moon,
    Sun,
    AlertTriangle,
    Bell,
    Menu,
    X
} from 'lucide-react';
import SuperAdminHeader from '@/components/dashboard/SuperAdminHeader';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Super Admin = Propriétaire de la plateforme
    const navItems: NavItem[] = [
        { href: '/dashboard/superadmin', icon: <LayoutDashboard size={20} />, label: 'Vue d\'ensemble' },
        { href: '/dashboard/superadmin/organizations', icon: <Building2 size={20} />, label: 'Organisations' },

        { href: '/dashboard/superadmin/incidents', icon: <AlertTriangle size={20} />, label: 'Incidents' },
        { href: '/dashboard/superadmin/notifications', icon: <Bell size={20} />, label: 'Notifications' },
        { href: '/dashboard/superadmin/settings', icon: <Settings size={20} />, label: 'Paramètres' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard/superadmin') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        localStorage.removeItem('fleetman-user');
        localStorage.removeItem('fleetman-token');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-primary">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-glass shadow-lg text-text-main"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-screen w-64 bg-nav border-r border-glass flex flex-col z-50
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {/* Logo / Brand */}
                <div className="h-16 flex items-center justify-between border-b border-glass px-4">
                    <Link href="/dashboard/superadmin" className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                            <Shield size={24} className="text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-text-main">FleetMan</span>
                            <span className="block text-xs text-cyan-400 font-medium">SuperAdmin</span>
                        </div>
                    </Link>

                    {/* Close button mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-1 rounded-lg hover:bg-glass text-text-sub"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(item.href)
                                ? 'bg-secondary/10 text-secondary border border-secondary/20'
                                : 'text-text-sub hover:bg-glass hover:text-text-main'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-glass space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-sub hover:bg-glass hover:text-text-main transition-all"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium">{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>


            {/* Main Content */}
            <main className="md:ml-64 min-h-screen flex flex-col">
                <SuperAdminHeader />
                <div className="p-4 md:p-8 pt-4 md:pt-8 max-w-[1400px] mx-auto flex-1 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
