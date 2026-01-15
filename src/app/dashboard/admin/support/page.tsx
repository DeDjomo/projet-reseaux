"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LifeBuoy, MessageSquare, Mail, Phone, FileText, ExternalLink, Send, ChevronDown } from 'lucide-react';

export default function SupportPage() {
    const { t } = useLanguage();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { questionKey: 'faq.q1', answerKey: 'faq.a1' },
        { questionKey: 'faq.q2', answerKey: 'faq.a2' },
        { questionKey: 'faq.q3', answerKey: 'faq.a3' },
        { questionKey: 'faq.q4', answerKey: 'faq.a4' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-main">
                    {t('support.title')}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    {t('support.subtitle')}
                </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface rounded-lg border border-glass p-6 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                        <Mail size={24} className="text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-text-main">{t('support.email')}</h3>
                    <p className="text-sm text-text-muted mt-1">support@fleetman.com</p>
                    <button className="mt-4 w-full py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors text-sm font-medium">
                        {t('support.sendEmail')}
                    </button>
                </div>

                <div className="bg-surface rounded-lg border border-glass p-6 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                        <Phone size={24} className="text-green-500" />
                    </div>
                    <h3 className="font-semibold text-text-main">{t('support.phone')}</h3>
                    <p className="text-sm text-text-muted mt-1">+237 6 99 00 00 00</p>
                    <button className="mt-4 w-full py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors text-sm font-medium">
                        {t('support.call')}
                    </button>
                </div>

                <div className="bg-surface rounded-lg border border-glass p-6 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={24} className="text-purple-500" />
                    </div>
                    <h3 className="font-semibold text-text-main">{t('support.liveChat')}</h3>
                    <p className="text-sm text-text-muted mt-1">{t('support.available')}</p>
                    <button className="mt-4 w-full py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium">
                        {t('support.startChat')}
                    </button>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-surface rounded-lg border border-glass p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">{t('support.usefulResources')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-glass transition-colors">
                        <FileText size={20} className="text-text-muted" />
                        <span className="text-text-main">{t('support.documentation')}</span>
                        <ExternalLink size={14} className="text-text-muted ml-auto" />
                    </a>
                    <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-glass transition-colors">
                        <LifeBuoy size={20} className="text-text-muted" />
                        <span className="text-text-main">{t('support.helpCenter')}</span>
                        <ExternalLink size={14} className="text-text-muted ml-auto" />
                    </a>
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-surface rounded-lg border border-glass p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">{t('support.faq')}</h2>
                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-glass rounded-lg overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-glass/50 transition-colors"
                            >
                                <span className="font-medium text-text-main">{t(faq.questionKey)}</span>
                                <ChevronDown
                                    size={20}
                                    className={`text-text-muted transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {openFaq === idx && (
                                <div className="px-4 py-3 bg-glass/30 border-t border-glass">
                                    <p className="text-sm text-text-sub">{t(faq.answerKey)}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-surface rounded-lg border border-glass p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">{t('support.contactUs')}</h2>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">{t('support.name')}</label>
                            <input
                                type="text"
                                placeholder={t('support.yourName')}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">{t('support.email')}</label>
                            <input
                                type="email"
                                placeholder={t('support.yourEmail')}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">{t('support.subject')}</label>
                        <select className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary">
                            <option>{t('support.technicalQuestion')}</option>
                            <option>{t('support.billing')}</option>
                            <option>{t('support.feature')}</option>
                            <option>{t('support.other')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">{t('support.message')}</label>
                        <textarea
                            rows={4}
                            placeholder={t('support.describeRequest')}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium"
                    >
                        <Send size={18} />
                        {t('support.send')}
                    </button>
                </form>
            </div>
        </div>
    );
}
