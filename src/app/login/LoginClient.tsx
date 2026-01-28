"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/services';
import { LoginRequest } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { Moon, Sun, Globe } from 'lucide-react';

// Login Schema
const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language, t, toggleLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Check for registration success
    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage("Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.");
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Try Admin Login first (as per registration flow)
            // Note: In a real app we might need to know the user type or try endpoints sequentially
            // For now, let's assume Admin/Org Manager login
            const response = await authApi.loginAdmin(data);

            if (response && response.success) {
                // Store user data
                localStorage.setItem('fleetman-user', JSON.stringify(response));

                // Fetch organization for the admin
                try {
                    const { adminApi } = await import('@/services');
                    const organization = await adminApi.getOrganization(response.userId);
                    // Store organization data
                    localStorage.setItem('fleetman-organization', JSON.stringify(organization));
                    // Update user data with organizationId if not already present
                    if (!response.organizationId && organization.organizationId) {
                        const updatedUser = { ...response, organizationId: organization.organizationId };
                        localStorage.setItem('fleetman-user', JSON.stringify(updatedUser));
                    }
                } catch (orgError) {
                    console.warn('Could not fetch organization:', orgError);
                }

                // Redirect based on role
                const role = response.role?.toUpperCase();
                console.log('Login successful, role:', role);

                if (role === 'SUPER_ADMIN') {
                    router.push('/dashboard/superadmin');
                } else if (role === 'ORGANIZATION_MANAGER' || role === 'ORG_MANAGER') {
                    router.push('/dashboard/manager');
                } else {
                    // Default fallback for any admin role
                    router.push('/dashboard/manager');
                }
            } else {
                throw new Error(response?.message || "Échec de la connexion");
            }
        } catch (err: any) {
            // Fallback: Try FleetManager login? 
            // Or just show error. User just registered as Admin so Admin login should work.
            console.error(err);
            setError("Échec de la connexion. Vérifiez vos identifiants.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary text-text-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">

            {/* Header Toggles */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={toggleTheme} className="p-2 rounded-full bg-surface border border-glass hover:bg-glass text-text-main transition-all">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={toggleLanguage} className="p-2 rounded-full bg-surface border border-glass hover:bg-glass text-text-main transition-all flex items-center gap-1 font-bold">
                    <Globe size={20} />
                    <span className="text-xs">{language}</span>
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="FleetMan Logo" className="w-16 h-16 rounded-full object-cover" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-text-main">
                    {t('login.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-text-sub">
                    {t('login.subtitle')}{' '}
                    <Link href="/register" className="font-medium text-secondary hover:text-accent transition-colors">
                        {t('login.createAccount')}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-glass backdrop-blur-md">

                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-sub">
                                {t('form.email')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    {...register('email')}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                />
                                {errors.email && <p className="mt-1 text-sm text-error-text">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-sub">
                                {t('form.password')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    {...register('password')}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                />
                                {errors.password && <p className="mt-1 text-sm text-error-text">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-secondary focus:ring-secondary border-glass rounded bg-glass"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-sub">
                                    {t('login.rememberMe')}
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-secondary hover:text-accent transition-colors">
                                    {t('login.forgotPassword')}
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? t('form.loading') : t('form.login')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
