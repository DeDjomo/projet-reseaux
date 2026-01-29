import type { Metadata } from 'next';
import VehiclesClient from './VehiclesClient';

export const metadata: Metadata = {
    title: 'Véhicules',
    description: 'Gestion des véhicules',
};

export default function VehiclesPage() {
    return <VehiclesClient />;
}
