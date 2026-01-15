"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminSidebar from '@/components/dashboard/SuperAdminSidebar';
import Header from '@/components/dashboard/Header';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = () => {
            const userStr = localStorage.getItem('fleetman-user');
            if (!userStr) {
                router.push('/login');
                return;
            }

            const user = JSON.parse(userStr);
            // Only SUPER_ADMIN can access this section
            // Note: For now, we allow access if logged in - proper role check should be implemented
            if (user.userId) {
                setIsAuthorized(true);
            } else {
                router.push('/login');
            }
            setLoading(false);
        };

        checkAccess();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-primary">
            <SuperAdminSidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
