"use client";

import React from 'react';
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
    Sun
} from 'lucide-react';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export default function SuperAdminSidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const navItems: NavItem[] = [
        { href: '/dashboard/superadmin', icon: <LayoutDashboard size={20} />, label: 'Vue d\'ensemble' },
        { href: '/dashboard/superadmin/organizations', icon: <Building2 size={20} />, label: 'Organisations' },
        { href: '/dashboard/superadmin/admins', icon: <Users size={20} />, label: 'Administrateurs' },
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
        <aside className="w-64 h-screen bg-nav border-r border-glass flex flex-col fixed left-0 top-0 z-40 transition-colors duration-300">
            {/* Logo / Brand */}
            <div className="h-16 flex items-center justify-center border-b border-glass px-4">
                <Link href="/dashboard/superadmin" className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-text-main">FleetMan</span>
                        <span className="block text-xs text-purple-400 font-medium">SuperAdmin</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(item.href)
                                ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 border-l-4 border-purple-500'
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
    );
}
