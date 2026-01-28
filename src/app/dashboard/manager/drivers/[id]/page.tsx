'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiUser, FiPhone, FiMail, FiClock, FiAlertTriangle, FiFileText, FiCalendar, FiShield, FiMoreVertical, FiCheckCircle, FiSlash, FiPauseCircle } from 'react-icons/fi';
import { driverApi, tripApi, incidentApi } from '@/services';
import { Driver, Trip, Incident, DriverState } from '@/types';
import toast from 'react-hot-toast';
import styles from './driverDetail.module.css';

type TabType = 'profile' | 'trips' | 'incidents';

export default function DriverDetailPage() {
    const params = useParams();
    const { t } = useLanguage();
    const driverId = parseInt(params.id as string);

    const [driver, setDriver] = useState<Driver | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDriverData();
    }, [driverId]);

    const fetchDriverData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Récupérer les détails du conducteur
            const driverData = await driverApi.getById(driverId);
            setDriver(driverData);

            // Récupérer l'historique des trajets
            try {
                const driverTrips = await tripApi.getByDriverId(driverId);
                setTrips(driverTrips);
            } catch (err: any) {
                // Trajets non disponibles
            }

            // Récupérer les incidents
            try {
                const driverIncidents = await incidentApi.getByDriverId(driverId);
                setIncidents(driverIncidents);
            } catch (err: any) {
                // Incidents non disponibles
            }

        } catch (err) {
            // Erreur lors du chargement
            setError('Impossible de charger les données du conducteur');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newState: DriverState) => {
        try {
            await driverApi.updateState(driverId, newState);
            setDriver(prev => prev ? { ...prev, driverState: newState } : null);
            toast.success(t('drivers.actions.updateSuccess'));
        } catch (error) {
            // Error updating status
            toast.error(t('drivers.actions.updateError'));
        }
    };

    const getStateLabel = (state?: string) => {
        const labels: { [key: string]: string } = {
            'ACTIVE': t('drivers.active'),
            'INACTIVE': t('drivers.inactive'),
            'ON_LEAVE': t('drivers.onLeave'),
            'SUSPENDED': t('drivers.suspended')
        };
        return labels[state || ''] || state || 'Inconnu';
    };

    const getStateClass = (state?: string) => {
        const classes: { [key: string]: string } = {
            'ACTIVE': styles.statusActive,
            'INACTIVE': styles.statusInactive,
            'ON_LEAVE': styles.statusOnLeave,
            'SUSPENDED': styles.statusSuspended
        };
        return classes[state || ''] || '';
    };

    const formatDate = (dateStr: string | number[]) => {
        if (Array.isArray(dateStr)) {
            const [year, month, day] = dateStr;
            return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string | number[]) => {
        if (Array.isArray(dateStr)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateStr;
            return new Date(year, month - 1, day, hour, minute, second).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'DR';
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Chargement...</span>
                </div>
            </div>
        );
    }

    if (error || !driver) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>{error || 'Conducteur non trouvé'}</p>
                    <Link href="/dashboard/manager/drivers" className={styles.backLink}>
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <p className={styles.breadcrumb}>
                <Link href="/dashboard/manager/drivers" className={styles.breadcrumbLink}>
                    Conducteurs
                </Link>
                {' '}/{' '}
                <span className={styles.breadcrumbCurrent}>
                    {driver.driverFirstName} {driver.driverLastName}
                </span>
            </p>

            {/* Card d'informations du conducteur */}
            <div className={styles.driverCard}>
                <div className={styles.driverAvatar}>
                    {getInitials(driver.driverFirstName, driver.driverLastName)}
                </div>
                <div className={styles.driverInfo}>
                    <h1 className={styles.driverName}>
                        {driver.driverFirstName} {driver.driverLastName}
                    </h1>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Statut :</span>
                        <span className={`${styles.infoValue} ${getStateClass(driver.driverState)}`}>
                            {getStateLabel(driver.driverState)}
                        </span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email :</span>
                        <span className={styles.infoValue}>{driver.driverEmail}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Téléphone :</span>
                        <span className={styles.infoValue}>{driver.driverPhoneNumber || '-'}</span>
                    </div>

                    {/* Status Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {driver.driverState !== DriverState.ACTIVE && (
                            <button
                                onClick={() => handleStatusUpdate(DriverState.ACTIVE)}
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition flex items-center gap-1"
                            >
                                <FiCheckCircle /> {t('drivers.actions.activate')}
                            </button>
                        )}
                        {driver.driverState !== DriverState.ON_LEAVE && (
                            <button
                                onClick={() => handleStatusUpdate(DriverState.ON_LEAVE)}
                                className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition flex items-center gap-1"
                            >
                                <FiClock /> {t('drivers.actions.leave')}
                            </button>
                        )}
                        {driver.driverState !== DriverState.SUSPENDED && (
                            <button
                                onClick={() => handleStatusUpdate(DriverState.SUSPENDED)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center gap-1"
                            >
                                <FiPauseCircle /> {t('drivers.actions.suspend')}
                            </button>
                        )}
                        {driver.driverState !== DriverState.INACTIVE && (
                            <button
                                onClick={() => handleStatusUpdate(DriverState.INACTIVE)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
                            >
                                <FiSlash /> {t('drivers.actions.deactivate')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <FiUser />
                    Profil complet
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'trips' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('trips')}
                >
                    <FiClock />
                    Historique trajets ({trips.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'incidents' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('incidents')}
                >
                    <FiAlertTriangle />
                    Incidents ({incidents.length})
                </button>
            </div>

            {/* Contenu des onglets */}
            <div className={styles.tabContent}>
                {activeTab === 'profile' && (
                    <div className={styles.profileContent}>
                        <div className={styles.profileGrid}>
                            {/* Informations personnelles */}
                            <div className={styles.profileSection}>
                                <h3 className={styles.sectionTitle}>
                                    <FiUser />
                                    Informations personnelles
                                </h3>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Nom complet</span>
                                    <span className={styles.profileValue}>
                                        {driver.driverFirstName} {driver.driverLastName}
                                    </span>
                                </div>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Email</span>
                                    <span className={styles.profileValue}>{driver.driverEmail}</span>
                                </div>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Téléphone</span>
                                    <span className={styles.profileValue}>{driver.driverPhoneNumber || '-'}</span>
                                </div>
                                {driver.driverPersonalInformation && (
                                    <div className={styles.profileItem}>
                                        <span className={styles.profileLabel}>Autres informations</span>
                                        <span className={styles.profileValue}>{driver.driverPersonalInformation}</span>
                                    </div>
                                )}
                            </div>

                            {/* Permis de conduire */}
                            <div className={styles.profileSection}>
                                <h3 className={styles.sectionTitle}>
                                    <FiFileText />
                                    Permis de conduire
                                </h3>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Numéro de permis</span>
                                    <span className={styles.profileValue}>{driver.driverLicenseNumber || '-'}</span>
                                </div>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Date d'expiration</span>
                                    <span className={styles.profileValue}>
                                        {driver.driverLicenseExpiryDate
                                            ? formatDate(driver.driverLicenseExpiryDate)
                                            : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact d'urgence */}
                            <div className={styles.profileSection}>
                                <h3 className={styles.sectionTitle}>
                                    <FiPhone />
                                    Contact d'urgence
                                </h3>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Nom du contact</span>
                                    <span className={styles.profileValue}>
                                        {driver.driverEmergencyContactName || '-'}
                                    </span>
                                </div>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Téléphone d'urgence</span>
                                    <span className={styles.profileValue}>
                                        {driver.driverEmergencyContactPhone || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Dates système */}
                            <div className={styles.profileSection}>
                                <h3 className={styles.sectionTitle}>
                                    <FiCalendar />
                                    Informations système
                                </h3>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Créé le</span>
                                    <span className={styles.profileValue}>
                                        {formatDateTime(driver.createdAt)}
                                    </span>
                                </div>
                                <div className={styles.profileItem}>
                                    <span className={styles.profileLabel}>Dernière mise à jour</span>
                                    <span className={styles.profileValue}>
                                        {formatDateTime(driver.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trips' && (
                    <div className={styles.tripsContent}>
                        <h2 className={styles.detailsTitle}>Historique des trajets</h2>
                        {trips.length === 0 ? (
                            <p className={styles.noData}>Aucun trajet enregistré pour ce conducteur</p>
                        ) : (
                            <div className={styles.tripsList}>
                                {trips.map((trip) => (
                                    <div key={trip.tripId} className={styles.tripCard}>
                                        <div className={styles.tripHeader}>
                                            <h3 className={styles.tripId}>Trajet #{trip.tripId}</h3>
                                            <span className={`${styles.tripStatus} ${styles[`status${trip.tripStatus}`]}`}>
                                                {t(`trip.status.${trip.tripStatus}`)}
                                            </span>
                                        </div>

                                        <div className={styles.tripDetails}>
                                            <div className={styles.tripInfo}>
                                                <span className={styles.tripLabel}>Départ</span>
                                                <span className={styles.tripValue}>
                                                    {formatDateTime(trip.departureDateTime)}
                                                </span>
                                            </div>

                                            <div className={styles.tripArrow}>→</div>

                                            <div className={styles.tripInfo}>
                                                <span className={styles.tripLabel}>Arrivée</span>
                                                <span className={styles.tripValue}>
                                                    {trip.arrivalDateTime ? formatDateTime(trip.arrivalDateTime) : 'En cours'}
                                                </span>
                                            </div>
                                        </div>

                                        {trip.actualDistance > 0 && (
                                            <div className={styles.tripDistance}>
                                                Distance: {trip.actualDistance.toFixed(1)} km
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'incidents' && (
                    <div className={styles.incidentsContent}>
                        <h2 className={styles.detailsTitle}>Incidents signalés</h2>
                        {incidents.length === 0 ? (
                            <p className={styles.noData}>Aucun incident enregistré pour ce conducteur</p>
                        ) : (
                            <div className={styles.incidentsList}>
                                {incidents.map((incident) => (
                                    <div key={incident.incidentId} className={styles.incidentCard}>
                                        <div className={styles.incidentHeader}>
                                            <h3 className={styles.incidentTitle}>{incident.incidentTitle}</h3>
                                            <span className={styles.incidentDate}>
                                                {formatDate(incident.incidentDate)}
                                            </span>
                                        </div>
                                        <div className={styles.incidentBody}>
                                            <div className={styles.incidentBadges}>
                                                <span className={`${styles.incidentBadge} ${styles[`severity${incident.incidentSeverity}`]}`}>
                                                    {t(`incidents.severity.${incident.incidentSeverity}`)}
                                                </span>
                                                <span className={styles.incidentBadge}>
                                                    {t(`incidents.type.${incident.incidentType}`)}
                                                </span>
                                                <span className={styles.incidentBadge}>
                                                    {t(`incidents.status.${incident.incidentStatus}`)}
                                                </span>
                                            </div>
                                            {incident.incidentDescription && (
                                                <p className={styles.incidentDescription}>
                                                    {incident.incidentDescription}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
