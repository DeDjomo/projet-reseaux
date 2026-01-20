'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiTruck, FiMapPin, FiInfo, FiClock, FiBarChart2, FiTrash2, FiUserCheck, FiPlus, FiX } from 'react-icons/fi';
import { vehicleApi, positionApi, tripApi, fuelRechargeApi, maintenanceApi, driverVehicleApi, driverApi } from '@/services';
import { Vehicle, Trip, FuelRecharge, Maintenance, Position, DriverVehicle, Driver } from '@/types';
import SpeedGauge from '@/components/vehicle/SpeedGauge';
import FuelGauge from '@/components/vehicle/FuelGauge';
import PassengerIndicator from '@/components/vehicle/PassengerIndicator';
import styles from './vehicleDetail.module.css';
import 'leaflet/dist/leaflet.css';

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const VehicleMap = dynamic(() => import('@/components/vehicle/VehicleMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading map...</div>
});

type TabType = 'position' | 'details' | 'historique' | 'bilans' | 'assignations';

export default function VehicleDetailPage() {
    const params = useParams();
    const { t } = useLanguage();
    const vehicleId = parseInt(params.id as string);

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [fuelRecharges, setFuelRecharges] = useState<FuelRecharge[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [assignments, setAssignments] = useState<DriverVehicle[]>([]);
    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('position');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
    const [assignNotes, setAssignNotes] = useState('');

    useEffect(() => {
        fetchVehicleData();
    }, [vehicleId]);

    const fetchVehicleData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Récupérer les détails du véhicule
            const vehicleData = await vehicleApi.getById(vehicleId);
            setVehicle(vehicleData);

            // Récupérer la dernière position connue
            try {
                const latestPosition = await positionApi.getLatestByVehicleId(vehicleId);
                console.log('RAW Position data:', JSON.stringify(latestPosition, null, 2));
                setPosition(latestPosition);
            } catch (err: any) {
                console.warn('Position non disponible:', err);
            }

            // Récupérer l'historique des trajets
            try {
                const vehicleTrips = await tripApi.getByVehicleId(vehicleId);
                setTrips(vehicleTrips);
            } catch (err: any) {
                console.warn('Trajets non disponibles');
            }

            // Récupérer les recharges de carburant
            try {
                const vehicleFuelRecharges = await fuelRechargeApi.getByVehicleId(vehicleId);
                setFuelRecharges(Array.isArray(vehicleFuelRecharges) ? vehicleFuelRecharges : []);
            } catch (err: any) {
                console.warn('Recharges non disponibles');
                setFuelRecharges([]);
            }

            // Récupérer les maintenances
            try {
                const vehicleMaintenances = await maintenanceApi.getByVehicleId(vehicleId);
                setMaintenances(vehicleMaintenances);
            } catch (err: any) {
                console.warn('Maintenances non disponibles');
            }

            // Récupérer les assignations conducteur-véhicule
            try {
                const vehicleAssignments = await driverVehicleApi.getByVehicle(vehicleId);
                setAssignments(vehicleAssignments);
            } catch (err: any) {
                console.warn('Assignations non disponibles');
            }

            // Récupérer les conducteurs disponibles (filtrés par organisation)
            try {
                // Essayer d'abord avec l'organizationId stocké
                const storedOrg = localStorage.getItem('fleetman-organization');
                const storedUser = localStorage.getItem('fleetman-user');

                let organizationId: number | null = null;

                if (storedOrg) {
                    const org = JSON.parse(storedOrg);
                    organizationId = org.organizationId;
                } else if (storedUser) {
                    const user = JSON.parse(storedUser);
                    organizationId = user.organizationId;
                }

                console.log('Using organizationId for drivers:', organizationId);

                if (organizationId) {
                    const response = await import('@/lib/axios').then(m => m.default);
                    const driversResponse = await response.get(`/organizations/${organizationId}/drivers`);
                    console.log('Fetched drivers:', driversResponse.data);
                    setAvailableDrivers(driversResponse.data);
                } else {
                    console.warn('No organizationId found, cannot fetch drivers');
                }
            } catch (err: any) {
                console.warn('Conducteurs non disponibles:', err);
            }

        } catch (err) {
            console.error('Erreur lors du chargement:', err);
            setError(t('vehicle.error.loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async () => {
        if (!selectedDriverId) return;

        try {
            const newAssignment = await driverVehicleApi.create({
                driverId: selectedDriverId,
                vehicleId: vehicleId,
                startDate: new Date().toISOString(),
                notes: assignNotes || undefined
            });
            setAssignments(prev => [...prev, newAssignment]);
            setShowAssignModal(false);
            setSelectedDriverId(null);
            setAssignNotes('');
        } catch (err: any) {
            console.error('Erreur création assignation:', err);
            alert(err.response?.data?.message || 'Erreur lors de la création de l\'assignation');
        }
    };

    const handleTerminateAssignment = async (assignmentId: number) => {
        if (!confirm(t('vehicle.assignments.terminateConfirm'))) return;

        try {
            const updated = await driverVehicleApi.terminate(assignmentId);
            setAssignments(prev => prev.map(a => a.assignmentId === assignmentId ? updated : a));
        } catch (err) {
            console.error('Erreur terminaison:', err);
            alert(t('vehicle.assignments.terminateError'));
        }
    };

    const getStatusLabel = (state?: string) => {
        const labels: { [key: string]: string } = {
            'ACTIVE': t('vehicle.status.active'),
            'INACTIVE': t('vehicle.status.inactive'),
            'MOVING': t('vehicle.status.moving'),
            'PARKED': t('vehicle.status.parked'),
            'MAINTENANCE': t('vehicle.status.maintenance')
        };
        return labels[state || ''] || state || t('vehicle.status.unknown');
    };

    const getStatusClass = (state?: string) => {
        const classes: { [key: string]: string } = {
            'ACTIVE': styles.statusActive,
            'MOVING': styles.statusActive,
            'INACTIVE': styles.statusInactive,
            'PARKED': styles.statusParked,
            'MAINTENANCE': styles.statusMaintenance
        };
        return classes[state || ''] || '';
    };

    const formatDate = (dateStr: string | null | undefined | number[]) => {
        if (!dateStr) return 'N/A';

        let date: Date;

        // Handle array format from Java LocalDateTime [year, month, day, hour, minute, second, nano]
        if (Array.isArray(dateStr)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateStr;
            date = new Date(year, month - 1, day, hour, minute, second);
        } else {
            date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) return t('date.invalid');

        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteTrip = async (tripId: number) => {
        if (!confirm(t('vehicle.history.deleteConfirm'))) return;

        try {
            await tripApi.delete(tripId);
            setTrips(prev => prev.filter(t => t.tripId !== tripId));
        } catch (err) {
            console.error('Erreur suppression:', err);
            alert(t('vehicle.history.deleteError'));
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>{t('header.search.loading')}</span>
                </div>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>{error || t('vehicle.error.notFound')}</p>
                    <Link href="/dashboard/manager/vehicles" className={styles.backLink}>
                        {t('vehicle.backToList')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <p className={styles.breadcrumb}>
                <Link href="/dashboard/manager/vehicles" className={styles.breadcrumbLink}>
                    {t('header.search.vehicles')}
                </Link>
                {' '}/{' '}
                <span className={styles.breadcrumbCurrent}>{vehicle.vehicleRegistrationNumber}</span>
            </p>

            {/* Card d'informations du véhicule */}
            <div className={styles.vehicleCard}>
                <div className={styles.vehicleIcon}>
                    <FiTruck />
                </div>
                <div className={styles.vehicleInfo}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('vehicle.info.registration')} :</span>
                        <span className={styles.infoValue}>{vehicle.vehicleRegistrationNumber}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('vehicle.info.status')} :</span>
                        <span className={`${styles.infoValue} ${getStatusClass(vehicle.state)}`}>
                            {getStatusLabel(vehicle.state)}
                        </span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('vehicle.info.model')} :</span>
                        <span className={styles.infoValue}>{vehicle.vehicleMake} {vehicle.vehicleModel}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('vehicle.info.type')} :</span>
                        <span className={styles.infoValue}>{vehicle.type}</span>
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'position' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('position')}
                >
                    <FiMapPin />
                    {t('vehicle.tabs.position')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    <FiInfo />
                    {t('vehicle.tabs.details')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'historique' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('historique')}
                >
                    <FiClock />
                    {t('vehicle.tabs.history')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'bilans' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('bilans')}
                >
                    <FiBarChart2 />
                    {t('vehicle.tabs.reports')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'assignations' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('assignations')}
                >
                    <FiUserCheck />
                    {t('vehicle.tabs.assignments')}
                </button>
            </div>

            {/* Contenu des onglets */}
            <div className={styles.tabContent}>
                {activeTab === 'position' && (
                    <div className={styles.mapContainer}>
                        {position && position.latitude && position.longitude ? (
                            <VehicleMap position={position} vehicle={vehicle} />
                        ) : (
                            <div className={styles.noPosition}>
                                <FiMapPin className={styles.noPositionIcon} />
                                <p>{!position ? t('vehicle.position.unavailable') : t('vehicle.position.loading')}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className={styles.detailsContent}>
                        <div className={styles.detailsHeader}>
                            <h2 className={styles.detailsTitle}>{t('vehicle.metrics.title')}</h2>
                            <p className={styles.detailsSubtitle}>
                                {t('vehicle.metrics.subtitle', [vehicle.vehicleRegistrationNumber || ''])}
                            </p>
                        </div>

                        <div className={styles.metricsGrid}>
                            <SpeedGauge
                                speed={vehicle.speed || 0}
                                maxSpeed={180}
                            />
                            <FuelGauge
                                level={vehicle.fuelLevel || 0}
                            />
                            <PassengerIndicator
                                current={vehicle.numberOfPassengers || 0}
                                capacity={5}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div className={styles.tripsContent}>
                        <h2 className={styles.detailsTitle}>{t('vehicle.history.title')}</h2>
                        {trips.length === 0 ? (
                            <p className={styles.noData}>{t('vehicle.history.noTrips')}</p>
                        ) : (
                            <div className={styles.tripsList}>
                                {trips.map((trip) => (
                                    <div key={trip.tripId} className={styles.tripCard}>
                                        <div className={styles.tripHeader}>
                                            <h3 className={styles.tripId}>{trip.tripReference || `${t('vehicle.history.tripPrefix')}${trip.tripId}`}</h3>
                                            <div className={styles.tripActions}>
                                                <span className={`${styles.tripStatus} ${styles[`status${trip.status}`]}`}>
                                                    {trip.status}
                                                </span>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteTrip(trip.tripId)}
                                                    title="Supprimer le trajet"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>

                                        <div className={styles.tripDetails}>
                                            <div className={styles.tripInfo}>
                                                <span className={styles.tripLabel}>{t('vehicle.history.departure')}</span>
                                                <span className={styles.tripValue}>
                                                    {formatDate(trip.departureDateTime)}
                                                </span>
                                            </div>

                                            <div className={styles.tripArrow}>→</div>

                                            <div className={styles.tripInfo}>
                                                <span className={styles.tripLabel}>{t('vehicle.history.arrival')}</span>
                                                <span className={styles.tripValue}>
                                                    {trip.arrivalDateTime ? formatDate(trip.arrivalDateTime) : t('vehicle.history.inProgress')}
                                                </span>
                                            </div>
                                        </div>

                                        {(trip.actualDistance && trip.actualDistance > 0) && (
                                            <div className={styles.tripDistance}>
                                                {t('vehicle.history.distance')}: {Number(trip.actualDistance).toFixed(1)} km
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bilans' && (
                    <div className={styles.bilansContent}>
                        <h2 className={styles.detailsTitle}>{t('vehicle.reports.title')}</h2>

                        {/* Section Recharges de carburant */}
                        <div className={styles.bilansSection}>
                            <h3 className={styles.bilansSectionTitle}>{t('vehicle.reports.fuel.title')}</h3>
                            {fuelRecharges.length === 0 ? (
                                <p className={styles.noData}>{t('vehicle.reports.fuel.noData')}</p>
                            ) : (
                                <div className={styles.bilansList}>
                                    {fuelRecharges.map((recharge) => (
                                        <div key={recharge.rechargeId} className={styles.bilanCard}>
                                            <div className={styles.bilanCardHeader}>
                                                <span className={styles.bilanCardTitle}>
                                                    {t('vehicle.reports.fuel.rechargePrefix')}{recharge.rechargeId}
                                                </span>
                                                <span className={styles.bilanCardDate}>
                                                    {formatDate(recharge.rechargeDateTime)}
                                                </span>
                                            </div>
                                            <div className={styles.bilanCardBody}>
                                                <div className={styles.bilanInfo}>
                                                    <span className={styles.bilanLabel}>{t('vehicle.reports.fuel.quantity')}</span>
                                                    <span className={styles.bilanValue}>{recharge.rechargeQuantity} L</span>
                                                </div>
                                                <div className={styles.bilanInfo}>
                                                    <span className={styles.bilanLabel}>{t('vehicle.reports.fuel.price')}</span>
                                                    <span className={styles.bilanValue}>{Number(recharge.rechargePrice || 0).toFixed(2)} FCFA</span>
                                                </div>
                                                <div className={styles.bilanInfo}>
                                                    <span className={styles.bilanLabel}>{t('vehicle.reports.fuel.station')}</span>
                                                    <span className={styles.bilanValue}>{recharge.stationName || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section Maintenances */}
                        <div className={styles.bilansSection}>
                            <h3 className={styles.bilansSectionTitle}>{t('vehicle.reports.maintenance.title')}</h3>
                            {maintenances.length === 0 ? (
                                <p className={styles.noData}>{t('vehicle.reports.maintenance.noData')}</p>
                            ) : (
                                <div className={styles.bilansList}>
                                    {maintenances.map((maintenance) => (
                                        <div key={maintenance.maintenanceId} className={styles.bilanCard}>
                                            <div className={styles.bilanCardHeader}>
                                                <span className={styles.bilanCardTitle}>
                                                    {maintenance.maintenanceSubject}
                                                </span>
                                                <span className={styles.bilanCardDate}>
                                                    {formatDate(maintenance.maintenanceDateTime)}
                                                </span>
                                            </div>
                                            <div className={styles.bilanCardBody}>
                                                {maintenance.maintenanceReport && (
                                                    <div className={styles.bilanInfo}>
                                                        <span className={styles.bilanLabel}>{t('vehicle.reports.maintenance.report')}</span>
                                                        <span className={styles.bilanValue}>{maintenance.maintenanceReport}</span>
                                                    </div>
                                                )}
                                                {maintenance.maintenanceCost && (
                                                    <div className={styles.bilanInfo}>
                                                        <span className={styles.bilanLabel}>{t('vehicle.reports.maintenance.cost')}</span>
                                                        <span className={styles.bilanValue}>{maintenance.maintenanceCost.toFixed(2)} FCFA</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Onglet Assignations */}
                {activeTab === 'assignations' && (
                    <div className={styles.bilansContent}>
                        <div className={styles.bilansSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 className={styles.bilansSectionTitle} style={{ margin: 0, borderBottom: 'none' }}>
                                    {t('vehicle.assignments.title')}
                                </h3>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <FiPlus /> {t('vehicle.assignments.add')}
                                </button>
                            </div>

                            {assignments.length === 0 ? (
                                <p className={styles.noData}>{t('vehicle.assignments.noData')}</p>
                            ) : (
                                <div className={styles.bilansList}>
                                    {assignments.map((assignment) => (
                                        <div key={assignment.assignmentId} className={styles.bilanCard}>
                                            <div className={styles.bilanCardHeader}>
                                                <span className={styles.bilanCardTitle}>
                                                    {assignment.driverFullName}
                                                </span>
                                                <span
                                                    className={styles.bilanCardDate}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '6px',
                                                        background: assignment.state === 'ACTIVE'
                                                            ? 'rgba(34, 197, 94, 0.2)'
                                                            : 'rgba(100, 116, 139, 0.2)',
                                                        color: assignment.state === 'ACTIVE' ? '#22c55e' : '#64748b',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {assignment.state === 'ACTIVE' ? t('vehicle.assignments.status.active') : t('vehicle.assignments.status.finished')}
                                                </span>
                                            </div>
                                            <div className={styles.bilanCardBody}>
                                                <div className={styles.bilanInfo}>
                                                    <span className={styles.bilanLabel}>{t('vehicle.assignments.start')}</span>
                                                    <span className={styles.bilanValue}>{formatDate(assignment.startDate)}</span>
                                                </div>
                                                {assignment.endDate && (
                                                    <div className={styles.bilanInfo}>
                                                        <span className={styles.bilanLabel}>{t('vehicle.assignments.end')}</span>
                                                        <span className={styles.bilanValue}>{formatDate(assignment.endDate)}</span>
                                                    </div>
                                                )}
                                                {assignment.notes && (
                                                    <div className={styles.bilanInfo}>
                                                        <span className={styles.bilanLabel}>{t('vehicle.assignments.notes')}</span>
                                                        <span className={styles.bilanValue}>{assignment.notes}</span>
                                                    </div>
                                                )}
                                                {assignment.state === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleTerminateAssignment(assignment.assignmentId)}
                                                        style={{
                                                            marginTop: '0.75rem',
                                                            padding: '0.5rem 1rem',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#ef4444',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {t('vehicle.assignments.terminate')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'assignation */}
            {showAssignModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-surface, #1e293b)',
                        borderRadius: '16px',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '500px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main, #f1f5f9)' }}>{t('vehicle.assignModal.title')}</h3>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontWeight: 500 }}>
                                {t('vehicle.assignModal.driver')}
                            </label>
                            <select
                                value={selectedDriverId || ''}
                                onChange={(e) => setSelectedDriverId(Number(e.target.value) || null)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    color: 'var(--text-main, #f1f5f9)'
                                }}
                            >
                                <option value="">{t('vehicle.assignModal.selectDriver')}</option>
                                {availableDrivers.map(driver => (
                                    <option key={driver.driverId} value={driver.driverId}>
                                        {driver.driverFirstName} {driver.driverLastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontWeight: 500 }}>
                                {t('vehicle.assignModal.notes')}
                            </label>
                            <textarea
                                value={assignNotes}
                                onChange={(e) => setAssignNotes(e.target.value)}
                                placeholder={t('vehicle.assignModal.notesPlaceholder')}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    color: 'var(--text-main, #f1f5f9)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                {t('vehicle.assignModal.cancel')}
                            </button>
                            <button
                                onClick={handleCreateAssignment}
                                disabled={!selectedDriverId}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: selectedDriverId
                                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                        : 'rgba(100, 116, 139, 0.3)',
                                    color: 'white',
                                    cursor: selectedDriverId ? 'pointer' : 'not-allowed',
                                    fontWeight: 600
                                }}
                            >
                                {t('vehicle.assignModal.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
