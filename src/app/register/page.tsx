import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
    title: 'Inscription',
    description: 'Créez votre compte FleetMan',
};

export default function RegisterPage() {
    return <RegisterClient />;
}
