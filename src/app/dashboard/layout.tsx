"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Si on est dans /dashboard/superadmin, on laisse le layout enfant gérer tout
    const isSuperAdmin = pathname.startsWith('/dashboard/superadmin');

    if (isSuperAdmin) {
        // Le layout de superadmin gère son propre sidebar et header
        return <>{children}</>;
    }

    // Layout pour Fleet Manager (manager)
    return (
        <div className="h-screen bg-primary flex overflow-hidden transition-colors duration-300">
            {/* Sidebar - Fixed position */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Area - Scrollable */}
            <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0 md:ml-20'}`}>
                {/* Header - Fixed at top of content area */}
                <Header />

                {/* Scrollable Content with improved styling */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-primary via-transparent to-transparent">
                    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
