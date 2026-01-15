"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationApi, adminApi } from '@/services';
import { AdminCreate, OrganizationCreate, AdminRole, OrganizationType, SubscriptionPlan, Gender, Language } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { OrganizationTypeLabels, SubscriptionPlanLabels, GenderLabels } from '@/utils/enumTranslations';
import Link from 'next/link';
import { Moon, Sun, Globe, Upload, X } from 'lucide-react';
import Image from 'next/image';

// --- Zod Schemas ---

const adminInfoSchema = z.object({
    adminFirstName: z.string().min(2, "Prénom requis"),
    adminLastName: z.string().min(2, "Nom requis"),
    adminEmail: z.string().email("Email invalide"),
    adminPhoneNumber: z.string().min(8, "Téléphone requis"),
    adminIdCardNumber: z.string().min(5, "Numéro CNI requis"),
    gender: z.nativeEnum(Gender),
    personalAddress: z.string().min(5, "Adresse requise"),
    personalCity: z.string().min(2, "Ville requise"),
    personalPostalCode: z.string().min(2, "Code postal requis"),
    personalCountry: z.string().min(2, "Pays requis"),
    taxNumber: z.string().optional(),
    niu: z.string().min(5, "NIU requis"),
});

const adminAccountSchema = z.object({
    adminPassword: z.string().min(8, "Mot de passe de 8 caractères minimum"),
    confirmPassword: z.string().min(8, "Confirmation requise"),
}).refine((data) => data.adminPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

const organizationSchema = z.object({
    organizationName: z.string().min(2, "Nom de l'organisation requis"),
    organizationDomainName: z.string().optional(),
    organizationPhone: z.string().min(8, "Téléphone requis"),
    organizationAddress: z.string().min(5, "Adresse requise"),
    organizationCity: z.string().min(2, "Ville requise"),
    organizationCountry: z.string().min(2, "Pays requis"),
    organizationType: z.nativeEnum(OrganizationType),
    registrationNumber: z.string().min(2, "RCCM requis"),
    taxId: z.string().optional(),
    organizationUIN: z.string().min(2, "NIU Organisation requis"),
    subscriptionPlan: z.nativeEnum(SubscriptionPlan),
});

// Combined type for the form
type RegistrationFormData = z.infer<typeof adminInfoSchema> & z.infer<typeof adminAccountSchema> & z.infer<typeof organizationSchema>;

// Steps
const getSteps = (t: (k: string) => string) => [
    { id: 1, title: t('register.step1'), description: t('register.step1.desc') },
    { id: 2, title: t('register.step2'), description: t('register.step2.desc') },
    { id: 3, title: t('register.step3'), description: t('register.step3.desc') },
    { id: 4, title: t('register.step4'), description: t('register.step4.desc') },
];

export default function RegisterPage() {
    const router = useRouter();
    const { language, t, toggleLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const steps = getSteps(t);

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Logo trop volumineux (max 2MB)');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Format invalide. Utilisez une image (PNG, JPG, etc.)');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
    };

    // Initialize form
    const {
        register,
        handleSubmit,
        trigger,
        watch,
        getValues,
        formState: { errors, isValid }
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(z.intersection(z.intersection(adminInfoSchema, adminAccountSchema), organizationSchema)),
        mode: "onChange",
        defaultValues: {
            gender: Gender.MALE,
            organizationType: OrganizationType.LLC,
            subscriptionPlan: SubscriptionPlan.BASIC,
        }
    });

    // Watch values for summary
    const formData = watch();

    // Navigation handlers
    const nextStep = async () => {
        let valid = false;
        if (step === 1) valid = await trigger(Object.keys(adminInfoSchema.shape) as any);
        if (step === 2) valid = await trigger(Object.keys(adminAccountSchema.shape) as any);
        if (step === 3) valid = await trigger(Object.keys(organizationSchema.shape) as any);

        if (valid) {
            setStep((s) => s + 1);
            setError(null);
        }
    };

    const prevStep = () => setStep((s) => s - 1);

    const onSubmit: SubmitHandler<RegistrationFormData> = async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Create Admin (Super Admin)
            const adminData: AdminCreate = {
                adminFirstName: data.adminFirstName,
                adminLastName: data.adminLastName,
                adminEmail: data.adminEmail,
                adminPassword: data.adminPassword,
                adminPhoneNumber: data.adminPhoneNumber,
                adminRole: AdminRole.SUPER_ADMIN, // Must be Super Admin to create Org
                adminIdCardNumber: data.adminIdCardNumber,
                personalAddress: data.personalAddress,
                personalCity: data.personalCity,
                personalPostalCode: data.personalPostalCode,
                personalCountry: data.personalCountry,
                taxNumber: data.taxNumber,
                niu: data.niu,
                gender: data.gender,
                language: language,
            };

            console.log("Creating Admin...", adminData);
            // Use createSuperAdmin to create user without Org OrganizationId
            const createdAdmin = await adminApi.createSuperAdmin(adminData);

            if (!createdAdmin || !createdAdmin.adminId) {
                throw new Error("Erreur lors de la création de l'administrateur");
            }

            console.log("Admin created with ID:", createdAdmin.adminId);

            // 2. Create Organization linked to Admin
            const orgData: OrganizationCreate = {
                organizationName: data.organizationName,
                organizationDomainName: data.organizationDomainName,
                organizationPhone: data.organizationPhone,
                organizationAddress: data.organizationAddress,
                organizationCity: data.organizationCity,
                organizationCountry: data.organizationCountry,
                organizationType: data.organizationType,
                registrationNumber: data.registrationNumber,
                taxId: data.taxId,
                organizationUIN: data.organizationUIN,
                subscriptionPlan: data.subscriptionPlan,
                organizationLogo: "", // Optional
                createdByAdminId: createdAdmin.adminId, // Link!
            };

            console.log("Creating Organization...", orgData);
            await organizationApi.create(orgData);

            // 3. Redirect
            router.push('/login?registered=true');

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Une erreur est survenue lors de l'inscription.");
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
                <h2 className="mt-6 text-center text-3xl font-extrabold text-text-main">
                    {t('register.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-text-sub">
                    {t('login.subtitle')}{' '}
                    <Link href="/login" className="font-medium text-secondary hover:text-accent transition-colors">
                        {t('register.hasAccount')}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="bg-surface py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-glass backdrop-blur-md">

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-glass z-0"></div>
                            {steps.map((s) => (
                                <div key={s.id} className={`flex flex-col items-center relative z-10 px-2 ${step >= s.id ? 'text-secondary' : 'text-text-muted'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? 'border-secondary bg-secondary text-white' : 'border-glass bg-surface text-text-muted'}`}>
                                        {s.id}
                                    </div>
                                    <span className="text-xs mt-1 font-medium">{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 bg-error-bg border border-error-border text-error-text px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* STEP 1: Admin Info */}
                        {step === 1 && (
                            <div className="animate-fade-in space-y-4">
                                <h3 className="text-lg font-medium text-text-main border-b border-glass pb-2">{t('register.step1')}</h3>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.firstName')}</label>
                                        <input {...register('adminFirstName')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.adminFirstName && <p className="mt-1 text-sm text-error-text">{errors.adminFirstName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.lastName')}</label>
                                        <input {...register('adminLastName')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.adminLastName && <p className="mt-1 text-sm text-error-text">{errors.adminLastName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.email')}</label>
                                        <input type="email" {...register('adminEmail')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.adminEmail && <p className="mt-1 text-sm text-error-text">{errors.adminEmail.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.phone')}</label>
                                        <input {...register('adminPhoneNumber')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.adminPhoneNumber && <p className="mt-1 text-sm text-error-text">{errors.adminPhoneNumber.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">Genre</label>
                                        <select {...register('gender')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2">
                                            {Object.values(Gender).map((g) => (
                                                <option key={g} value={g}>{GenderLabels[g][language]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">Numéro CNI</label>
                                        <input {...register('adminIdCardNumber')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.adminIdCardNumber && <p className="mt-1 text-sm text-error-text">{errors.adminIdCardNumber.message}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-text-sub">{t('form.address')}</label>
                                        <input {...register('personalAddress')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.personalAddress && <p className="mt-1 text-sm text-error-text">{errors.personalAddress.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.city')}</label>
                                        <input {...register('personalCity')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.personalCity && <p className="mt-1 text-sm text-error-text">{errors.personalCity.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.postalCode')}</label>
                                        <input {...register('personalPostalCode')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.personalPostalCode && <p className="mt-1 text-sm text-error-text">{errors.personalPostalCode.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.country')}</label>
                                        <input {...register('personalCountry')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.personalCountry && <p className="mt-1 text-sm text-error-text">{errors.personalCountry.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">NIU Personnel {errors.niu && <span className="text-error-text text-xs">*</span>}</label>
                                        <input {...register('niu')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        <p className="mt-1 text-xs text-text-muted">Numéro d'Identification Unique</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Account */}
                        {step === 2 && (
                            <div className="animate-fade-in space-y-4">
                                <h3 className="text-lg font-medium text-text-main border-b border-glass pb-2">{t('register.step2')}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.password')}</label>
                                        <input type="password" {...register('adminPassword')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.adminPassword && <p className="mt-1 text-sm text-error-text">{errors.adminPassword.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.confirmPassword')}</label>
                                        <input type="password" {...register('confirmPassword')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.confirmPassword && <p className="mt-1 text-sm text-error-text">{errors.confirmPassword.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Organization */}
                        {step === 3 && (
                            <div className="animate-fade-in space-y-4">
                                <h3 className="text-lg font-medium text-text-main border-b border-glass pb-2">{t('register.step3')}</h3>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-text-sub">Nom de l'organisation</label>
                                        <input {...register('organizationName')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.organizationName && <p className="mt-1 text-sm text-error-text">{errors.organizationName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">Type d'activité</label>
                                        <select {...register('organizationType')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2">
                                            {Object.values(OrganizationType).map((type) => (
                                                <option key={type} value={type}>{OrganizationTypeLabels[type] ? OrganizationTypeLabels[type][language] : type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">Plan d'abonnement</label>
                                        <select {...register('subscriptionPlan')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2">
                                            {Object.values(SubscriptionPlan).filter(plan => plan !== SubscriptionPlan.FREE).map((plan) => (
                                                <option key={plan} value={plan}>{SubscriptionPlanLabels[plan] ? SubscriptionPlanLabels[plan][language] : plan}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">Téléphone Org.</label>
                                        <input {...register('organizationPhone')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.organizationPhone && <p className="mt-1 text-sm text-error-text">{errors.organizationPhone.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">RCCM (Registre Commerce)</label>
                                        <input {...register('registrationNumber')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.registrationNumber && <p className="mt-1 text-sm text-error-text">{errors.registrationNumber.message}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-text-sub">Adresse Siège</label>
                                        <input {...register('organizationAddress')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.organizationAddress && <p className="mt-1 text-sm text-error-text">{errors.organizationAddress.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.city')}</label>
                                        <input {...register('organizationCity')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.organizationCity && <p className="mt-1 text-sm text-error-text">{errors.organizationCity.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">{t('form.country')}</label>
                                        <input {...register('organizationCountry')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.organizationCountry && <p className="mt-1 text-sm text-error-text">{errors.organizationCountry.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub">NIU Organisation</label>
                                        <input {...register('organizationUIN')} className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
                                        {errors.organizationUIN && <p className="mt-1 text-sm text-error-text">{errors.organizationUIN.message}</p>}
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-text-sub mb-2">Logo de l'organisation (optionnel)</label>
                                        {!logoPreview ? (
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Cliquez pour uploader ou glissez-déposez</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG (max 2MB)</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                            </label>
                                        ) : (
                                            <div className="relative w-32 h-32 border border-glass rounded-lg overflow-hidden">
                                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain bg-white" />
                                                <button
                                                    type="button"
                                                    onClick={removeLogo}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Confirmation */}
                        {step === 4 && (
                            <div className="animate-fade-in space-y-6">
                                <h3 className="text-lg font-medium text-text-main border-b border-glass pb-2">Récapitulatif</h3>

                                <div className="bg-glass p-4 rounded-md border border-glass">
                                    <h4 className="font-semibold text-text-main mb-2">Administrateur</h4>
                                    <p className="text-sm text-text-sub">Nom: {formData.adminFirstName} {formData.adminLastName}</p>
                                    <p className="text-sm text-text-sub">Email: {formData.adminEmail}</p>
                                    <p className="text-sm text-text-sub">Tel: {formData.adminPhoneNumber}</p>
                                </div>

                                <div className="bg-glass p-4 rounded-md border border-glass">
                                    <h4 className="font-semibold text-text-main mb-2">Organisation</h4>
                                    <p className="text-sm text-text-sub">Nom: {formData.organizationName}</p>
                                    <p className="text-sm text-text-sub">Type: {formData.organizationType}</p>
                                    <p className="text-sm text-text-sub">Plan: {formData.subscriptionPlan}</p>
                                    <p className="text-sm text-text-sub">Adresse: {formData.organizationAddress}, {formData.organizationCity}</p>
                                </div>

                                <div className="flex items-center">
                                    <input id="terms" type="checkbox" className="h-4 w-4 text-secondary focus:ring-secondary border-glass rounded bg-glass" required />
                                    <label htmlFor="terms" className="ml-2 block text-sm text-text-main">
                                        J'accepte les <Link href="/terms" target="_blank" className="font-medium text-secondary hover:text-accent underline transition-colors">conditions générales d'utilisation</Link>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-between pt-4 border-t border-glass">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="bg-surface py-2 px-4 border border-glass rounded-md shadow-sm text-sm font-medium text-text-sub hover:bg-glass focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
                                >
                                    {t('form.previous')}
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
                                >
                                    {t('form.next')}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? t('form.loading') : t('form.submit')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
