"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import organizationApi from '@/services/organizationApi';
import { Organization, SubscriptionPlan } from '@/types';
import { CreditCard, Check, Star, Zap, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
    const { t } = useLanguage();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const userStr = localStorage.getItem('fleetman-user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.organizationId) {
                        const org = await organizationApi.getById(user.organizationId);
                        setOrganization(org);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch organization", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, []);

    const handlePlanSelect = async (plan: SubscriptionPlan) => {
        if (!organization) return;

        // If trying to select Enterprise, just show a message or redirect to contact
        if (plan === SubscriptionPlan.ENTERPRISE) {
            toast.success(t('subscription.enterprise.contact'));
            return;
        }

        try {
            setLoading(true);
            const updatedOrg = await organizationApi.updateSubscriptionPlan(organization.organizationId, plan);
            setOrganization(updatedOrg);
            toast.success(t('subscription.updateSuccess'));
        } catch (error) {
            console.error("Failed to update plan", error);
            toast.error(t('subscription.updateError'));
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            id: SubscriptionPlan.BASIC,
            name: 'Basic',
            price: '29€',
            periodKey: 'subscription.perMonth',
            featureKeys: ['subscription.basic.f1', 'subscription.basic.f2', 'subscription.basic.f3', 'subscription.basic.f4', 'subscription.basic.f5'],
            icon: Zap,
            popular: false
        },
        {
            id: SubscriptionPlan.PROFESSIONAL,
            name: 'Professional',
            price: '79€',
            periodKey: 'subscription.perMonth',
            featureKeys: ['subscription.professional.f1', 'subscription.professional.f2', 'subscription.professional.f3', 'subscription.professional.f4', 'subscription.professional.f5', 'subscription.professional.f6'],
            icon: Shield,
            popular: true
        },
        {
            id: SubscriptionPlan.ENTERPRISE,
            name: 'Enterprise',
            priceKey: 'subscription.onQuote',
            periodKey: '',
            featureKeys: ['subscription.enterprise.f1', 'subscription.enterprise.f2', 'subscription.enterprise.f3', 'subscription.enterprise.f4', 'subscription.enterprise.f5'],
            icon: CreditCard,
            popular: false
        },
    ];

    const currentPlan = organization?.subscriptionPlan || SubscriptionPlan.BASIC;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main">
                    {t('subscription.title')}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    {t('subscription.subtitle')}
                </p>
            </div>

            {/* Current Plan */}
            {!loading && organization && (
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard size={24} />
                        <span className="text-sm font-medium opacity-90">{t('subscription.currentPlan')}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{currentPlan}</h2>
                    <p className="mt-2 text-sm opacity-80">
                        {t('subscription.organization')}: {organization.organizationName}
                    </p>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`relative bg-surface rounded-lg border ${plan.popular ? 'border-secondary shadow-lg' : 'border-glass'} p-6 flex flex-col`}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-white text-xs font-medium rounded-full">
                                {t('subscription.popular')}
                            </div>
                        )}

                        <div className={`p-3 rounded-lg ${currentPlan === plan.id ? 'bg-secondary/10' : 'bg-glass'} w-fit mb-4`}>
                            <plan.icon size={24} className={currentPlan === plan.id ? 'text-secondary' : 'text-text-muted'} />
                        </div>

                        <h3 className="font-semibold text-text-main text-lg">{plan.name}</h3>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-text-main">
                                {plan.priceKey ? t(plan.priceKey) : plan.price}
                            </span>
                            {plan.periodKey && <span className="text-text-muted">{t(plan.periodKey)}</span>}
                        </div>

                        <ul className="mt-4 space-y-2 flex-1">
                            {plan.featureKeys.map((featureKey, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-text-sub">
                                    <Check size={16} className="text-green-500 flex-shrink-0" />
                                    <span>{t(featureKey)}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`mt-6 w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${currentPlan === plan.id
                                ? 'bg-secondary/10 text-secondary cursor-default'
                                : 'bg-secondary text-white hover:bg-secondary/90'
                                }`}
                            disabled={currentPlan === plan.id || loading}
                            onClick={() => handlePlanSelect(plan.id)}
                        >
                            {currentPlan === plan.id ? (
                                <>
                                    <Check size={16} />
                                    {t('subscription.currentPlan')}
                                </>
                            ) : (
                                <>
                                    {t('subscription.choose')}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
