import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-primary text-text-main py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto bg-surface shadow rounded-lg p-8 border border-glass backdrop-blur-md animate-fade-in-up">

                <div className="flex justify-between items-center mb-8 border-b border-glass pb-4">
                    <h1 className="text-3xl font-bold text-text-main">Conditions Générales d'Utilisation</h1>
                    <Link href="/register" className="text-secondary hover:text-accent font-medium transition-colors">
                        Retour à l'inscription
                    </Link>
                </div>

                <div className="space-y-6 text-text-sub">
                    <section>
                        <h2 className="text-xl font-semibold text-text-main mb-3">1. Introduction</h2>
                        <p>
                            Bienvenue sur FleetMan. En utilisant notre plateforme, vous acceptez les présentes conditions d'utilisation.
                            Veuillez les lire attentivement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-text-main mb-3">2. Utilisation du Service</h2>
                        <p>
                            FleetMan fournit des services de gestion de flotte et de transport. Vous vous engagez à utiliser ces services
                            dans le respect des lois en vigueur et des droits des tiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-text-main mb-3">3. Comptes et Sécurité</h2>
                        <p>
                            Vous êtes responsable de la confidentialité de votre mot de passe et de votre compte.
                            Vous êtes responsable de toutes les activités qui se produisent sous votre compte.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-text-main mb-3">4. Données Personnelles</h2>
                        <p>
                            Nous collectons et traitons vos données personnelles conformément à notre politique de confidentialité.
                            En utilisant FleetMan, vous consentez à cette collecte et à ce traitement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-text-main mb-3">5. Modification des Conditions</h2>
                        <p>
                            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet
                            dès leur publication sur le site.
                        </p>
                    </section>

                    <div className="pt-6 border-t border-glass mt-8">
                        <p className="text-sm text-text-muted">Dernière mise à jour : 04 Janvier 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
