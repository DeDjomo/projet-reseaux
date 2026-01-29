import type { Metadata } from 'next';
import DashboardManagerClient from './DashboardManagerClient';

export const metadata: Metadata = {
    title: 'Tableau de bord',
    description: 'Vue d\'ensemble de votre flotte',
};

export default function DashboardManagerPage() {
    return <DashboardManagerClient />;
}
