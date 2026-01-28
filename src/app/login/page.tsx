import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
    title: 'Connexion',
    description: 'Connectez-vous à votre compte FleetMan',
};

export default function LoginPage() {
    return <LoginClient />;
}
