'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FiTruck, FiMapPin, FiInfo, FiClock, FiBarChart2, FiTrash2 } from 'react-icons/fi';
import { vehicleApi, positionApi, tripApi, fuelRechargeApi, maintenanceApi } from '@/services';
import { Vehicle, Trip, FuelRecharge, Maintenance, Position } from '@/types';
import SpeedGauge from '@/components/vehicle/SpeedGauge';
import FuelGauge from '@/components/vehicle/FuelGauge';
import PassengerIndicator from '@/components/vehicle/PassengerIndicator';
import styles from './vehicleDetail.module.css';
import 'leaflet/dist/leaflet.css';

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

type TabType = 'position' | 'details' | 'historique' | 'bilans';

export default function VehicleDetailPage() {
    const params = useParams();
    const vehicleId = parseInt(params.id as string);

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [fuelRecharges, setFuelRecharges] = useState<FuelRecharge[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('position');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leafletIcon, setLeafletIcon] = useState<any>(null);

    // Charger l'icône Leaflet côté client
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((L) => {
                const icon = new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                setLeafletIcon(icon);
            });
        }
    }, []);

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
                setPosition(latestPosition);
            } catch (err: any) {
                console.warn('Position non disponible');
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

        } catch (err) {
            console.error('Erreur lors du chargement:', err);
            setError('Impossible de charger les données du véhicule');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (state?: string) => {
        const labels: { [key: string]: string } = {
            'ACTIVE': 'En service',
            'INACTIVE': 'Hors service',
            'MOVING': 'En mouvement',
            'PARKED': 'Garé',
            'MAINTENANCE': 'En maintenance'
        };
        return labels[state || ''] || state || 'Inconnu';
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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteTrip = async (tripId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) return;

        try {
            await tripApi.delete(tripId);
            setTrips(prev => prev.filter(t => t.tripId !== tripId));
        } catch (err) {
            console.error('Erreur suppression:', err);
            alert('Erreur lors de la suppression du trajet');
        }
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

    if (error || !vehicle) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>{error || 'Véhicule non trouvé'}</p>
                    <Link href="/dashboard/manager/vehicles" className={styles.backLink}>
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <p className={styles.breadcrumb}>
                <Link href="/dashboard/manager/vehicles" className={styles.breadcrumbLink}>
                    Véhicules
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
                        <span className={styles.infoLabel}>Immatriculation :</span>
                        <span className={styles.infoValue}>{vehicle.vehicleRegistrationNumber}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Status :</span>
                        <span className={`${styles.infoValue} ${getStatusClass(vehicle.state)}`}>
                            {getStatusLabel(vehicle.state)}
                        </span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Modèle :</span>
                        <span className={styles.infoValue}>{vehicle.vehicleMake} {vehicle.vehicleModel}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Type :</span>
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
                    Position du véhicule
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    <FiInfo />
                    Détails
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'historique' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('historique')}
                >
                    <FiClock />
                    Historique des trajets
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'bilans' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('bilans')}
                >
                    <FiBarChart2 />
                    Bilans
                </button>
            </div>

            {/* Contenu des onglets */}
            <div className={styles.tabContent}>
                {activeTab === 'position' && (
                    <div className={styles.mapContainer}>
                        {position && leafletIcon ? (
                            <MapContainer
                                center={[position.latitude, position.longitude]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[position.latitude, position.longitude]}
                                    icon={leafletIcon}
                                >
                                    <Popup>
                                        <strong>{vehicle.vehicleRegistrationNumber}</strong>
                                        <br />
                                        {vehicle.vehicleMake} {vehicle.vehicleModel}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <div className={styles.noPosition}>
                                <FiMapPin className={styles.noPositionIcon} />
                                <p>{!position ? 'Position du véhicule non disponible' : 'Chargement de la carte...'}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className={styles.detailsContent}>
                        <div className={styles.detailsHeader}>
                            <h2 className={styles.detailsTitle}>Métriques en temps réel</h2>
                            <p className={styles.detailsSubtitle}>
                                Informations actuelles du véhicule {vehicle.vehicleRegistrationNumber}
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
                        <h2 className={styles.detailsTitle}>Historique des trajets</h2>
                        {trips.length === 0 ? (
                            <p className={styles.noData}>Aucun trajet enregistré pour ce véhicule</p>
                        ) : (
                            <div className={styles.tripsList}>
                                {trips.map((trip) => (
                                    <div key={trip.tripId} className={styles.tripCard}>
                                        <div className={styles.tripHeader}>
                                            <h3 className={styles.tripId}>Trajet #{trip.tripId}</h3>
                                            <div className={styles.tripActions}>
                                                <span className={`${styles.tripStatus} ${styles[`status${trip.tripStatus}`]}`}>
                                                    {trip.tripStatus}
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
                                                <span className={styles.tripLabel}>Départ</span>
                                                <span className={styles.tripValue}>
                                                    {formatDate(trip.tripStartTime)}
                                                </span>
                                                <span className={styles.tripLocation}>{trip.tripStartLocation}</span>
                                            </div>

                                            <div className={styles.tripArrow}>→</div>

                                            <div className={styles.tripInfo}>
                                                <span className={styles.tripLabel}>Arrivée</span>
                                                <span className={styles.tripValue}>
                                                    {trip.tripEndTime ? formatDate(trip.tripEndTime) : 'En cours'}
                                                </span>
                                                {trip.tripEndLocation && (
                                                    <span className={styles.tripLocation}>{trip.tripEndLocation}</span>
                                                )}
                                            </div>
                                        </div>

                                        {trip.tripDistance > 0 && (
                                            <div className={styles.tripDistance}>
                                                Distance: {trip.tripDistance.toFixed(1)} km
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
                        <h2 className={styles.detailsTitle}>Bilans du véhicule</h2>

                        {/* Section Recharges de carburant */}
                        <div className={styles.bilansSection}>
                            <h3 className={styles.bilansSectionTitle}>Recharges de carburant</h3>
                            {fuelRecharges.length === 0 ? (
                                <p className={styles.noData}>Aucune recharge enregistrée</p>
                            ) : (
                                <div className={styles.bilansList}>
                                    {fuelRecharges.map((recharge) => (
                                        <div key={recharge.fuelRechargeId} className={styles.bilanCard}>
                                            <div className={styles.bilanCardHeader}>
                                                <span className={styles.bilanCardTitle}>
                                                    Recharge #{recharge.fuelRechargeId}
                                                </span>
                                                <span className={styles.bilanCardDate}>
                                                    {formatDate(recharge.rechargeDate)}
                                                </span>
                                            </div>
                                            <div className={styles.bilanCardBody}>
                                                <div className={styles.bilanInfo}>
                                                    <span className={styles.bilanLabel}>Quantité</span>
                                                    <span className={styles.bilanValue}>{recharge.fuelAmount} L</span>
                                                </div>
                                                <div className={styles.bilanInfo}>
                                                    <span className={styles.bilanLabel}>Prix</span>
                                                    <span className={styles.bilanValue}>{recharge.fuelCost.toFixed(2)} FCFA</span>
                                                </div>
                                                <div className={styles.bilanInfo}>
                                                    <span className={styles.bilanLabel}>Station</span>
                                                    <span className={styles.bilanValue}>{recharge.fuelStation}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section Maintenances */}
                        <div className={styles.bilansSection}>
                            <h3 className={styles.bilansSectionTitle}>Maintenances</h3>
                            {maintenances.length === 0 ? (
                                <p className={styles.noData}>Aucune maintenance enregistrée</p>
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
                                                        <span className={styles.bilanLabel}>Rapport</span>
                                                        <span className={styles.bilanValue}>{maintenance.maintenanceReport}</span>
                                                    </div>
                                                )}
                                                {maintenance.maintenanceCost && (
                                                    <div className={styles.bilanInfo}>
                                                        <span className={styles.bilanLabel}>Coût</span>
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
            </div>
        </div>
    );
}
