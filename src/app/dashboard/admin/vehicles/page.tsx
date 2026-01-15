"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import vehicleApi from '@/services/vehicleApi';
import fleetApi from '@/services/fleetApi';
import { Vehicle, VehicleState, Fleet, VehicleType, FuelType } from '@/types';
import { Plus, Car, Edit, Trash2, Search, Filter, X, AlertTriangle, AlertCircle, CheckCircle, Upload, ImageIcon } from 'lucide-react';

export default function VehiclesPage() {
    const { t } = useLanguage();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stateFilter, setStateFilter] = useState<VehicleState | 'ALL'>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const userStr = localStorage.getItem('fleetman-user');
            let data: Vehicle[] = [];

            if (userStr) {
                const user = JSON.parse(userStr);
                // Use adminId (user.userId) to fetch vehicles via the new composite method
                // This aligns with "use existing admin filtering"
                if (user.userId) {
                    data = await vehicleApi.getByAdminId(user.userId);
                } else if (user.organizationId) {
                    // Fallback if for some reason user.userId is missing but orgId exists (unlikely for admin)
                    data = await vehicleApi.getByOrganization(user.organizationId);
                } else {
                    data = await vehicleApi.getAll();
                }
            } else {
                data = await vehicleApi.getAll();
            }
            setVehicles(data);
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch =
            vehicle.vehicleRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.vehicleMake?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesState = stateFilter === 'ALL' || vehicle.state === stateFilter;

        return matchesSearch && matchesState;
    });

    const getStateColor = (state: VehicleState) => {
        switch (state) {
            case VehicleState.MOVING: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case VehicleState.PARKED: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case VehicleState.MAINTENANCE: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case VehicleState.OUT_OF_SERVICE: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            case VehicleState.IDLE: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStateLabel = (state: VehicleState) => {
        switch (state) {
            case VehicleState.MOVING: return t('vehicles.moving');
            case VehicleState.PARKED: return t('vehicles.parked');
            case VehicleState.IDLE: return t('vehicles.idle');
            case VehicleState.MAINTENANCE: return t('vehicles.maintenance');
            case VehicleState.OUT_OF_SERVICE: return t('vehicles.outOfService');
            default: return state;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">
                        {t('vehicles.title')}
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        {t('vehicles.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>{t('vehicles.new')}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-text-muted" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('vehicles.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-text-muted" />
                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value as VehicleState | 'ALL')}
                        className="px-3 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="ALL">{t('common.allStates')}</option>
                        <option value={VehicleState.MOVING}>{t('vehicles.moving')}</option>
                        <option value={VehicleState.PARKED}>{t('vehicles.parked')}</option>
                        <option value={VehicleState.IDLE}>{t('vehicles.idle')}</option>
                        <option value={VehicleState.MAINTENANCE}>{t('vehicles.maintenance')}</option>
                        <option value={VehicleState.OUT_OF_SERVICE}>{t('vehicles.outOfService')}</option>
                    </select>
                </div>
            </div>

            {/* Vehicles Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-glass">
                    <Car size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-medium text-text-main">{t('vehicles.noVehicles')}</h3>
                    <p className="text-text-muted mt-1">{t('vehicles.addFirst')}</p>
                </div>
            ) : (
                <div className="bg-surface rounded-lg border border-glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-glass">
                            <thead className="bg-glass/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">{t('vehicles.title')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Immatriculation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">État</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Carburant</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-text-sub uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass">
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.vehicleId} className="hover:bg-glass/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-secondary/10">
                                                    <Car size={20} className="text-secondary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-text-main">{vehicle.vehicleMake} {vehicle.vehicleModel}</div>
                                                    <div className="text-sm text-text-muted">{vehicle.vehicleIdentificationNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-main font-medium">
                                            {vehicle.vehicleRegistrationNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-sub">
                                            {vehicle.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(vehicle.state)}`}>
                                                {getStateLabel(vehicle.state)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-sub">
                                            {vehicle.fuelType} ({vehicle.fuelLevel}%)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingVehicle(vehicle)}
                                                    className="p-1.5 rounded hover:bg-glass text-text-muted hover:text-text-main transition-colors"
                                                    title={t('common.edit')}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingVehicle(vehicle)}
                                                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Vehicle Modal */}
            {showCreateModal && (
                <CreateVehicleModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchVehicles();
                    }}
                />
            )}

            {/* Edit Vehicle Modal */}
            {editingVehicle && (
                <EditVehicleModal
                    vehicle={editingVehicle}
                    onClose={() => setEditingVehicle(null)}
                    onSuccess={() => {
                        setEditingVehicle(null);
                        fetchVehicles();
                    }}
                />
            )}

            {/* Delete Vehicle Modal */}
            {deletingVehicle && (
                <DeleteVehicleModal
                    vehicle={deletingVehicle}
                    onClose={() => setDeletingVehicle(null)}
                    onSuccess={() => {
                        setDeletingVehicle(null);
                        fetchVehicles();
                    }}
                />
            )}
        </div>
    );
}

// Edit Vehicle Modal
function EditVehicleModal({ vehicle, onClose, onSuccess }: { vehicle: Vehicle; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        vehicleRegistrationNumber: vehicle.vehicleRegistrationNumber || '',
        vehicleIdentificationNumber: vehicle.vehicleIdentificationNumber || '',
        vehicleMake: vehicle.vehicleMake || '',
        vehicleModel: vehicle.vehicleModel || '',
        type: vehicle.type || VehicleType.CAR,
        state: vehicle.state || VehicleState.PARKED,
        fuelType: vehicle.fuelType || FuelType.PETROL,
        fuelLevel: vehicle.fuelLevel || 100,
        numberOfPassengers: vehicle.numberOfPassengers || 5
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await vehicleApi.update(vehicle.vehicleId, formData);
            onSuccess();
        } catch (err) {
            setError(t('common.error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-glass">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-text-main flex items-center gap-2">
                            <Edit size={20} />
                            {t('common.edit')} - {vehicle.vehicleMake} {vehicle.vehicleModel}
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-glass rounded-full text-text-muted">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Marque</label>
                            <input
                                type="text"
                                value={formData.vehicleMake}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleMake: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Modèle</label>
                            <input
                                type="text"
                                value={formData.vehicleModel}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Immatriculation</label>
                            <input
                                type="text"
                                value={formData.vehicleRegistrationNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleRegistrationNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">N° VIN</label>
                            <input
                                type="text"
                                value={formData.vehicleIdentificationNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleIdentificationNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as VehicleType }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={VehicleType.CAR}>Voiture</option>
                                <option value={VehicleType.TRUCK}>Camion</option>
                                <option value={VehicleType.VAN}>Van</option>
                                <option value={VehicleType.MOTORCYCLE}>Moto</option>
                                <option value={VehicleType.BUS}>Bus</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">État</label>
                            <select
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value as VehicleState }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={VehicleState.PARKED}>Garé</option>
                                <option value={VehicleState.MOVING}>En mouvement</option>
                                <option value={VehicleState.IDLE}>Au repos</option>
                                <option value={VehicleState.MAINTENANCE}>En maintenance</option>
                                <option value={VehicleState.OUT_OF_SERVICE}>Hors service</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Carburant</label>
                            <select
                                value={formData.fuelType}
                                onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value as FuelType }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={FuelType.PETROL}>Essence</option>
                                <option value={FuelType.DIESEL}>Diesel</option>
                                <option value={FuelType.ELECTRIC}>Électrique</option>
                                <option value={FuelType.HYBRID}>Hybride</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Niveau carburant (%)</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={formData.fuelLevel}
                                onChange={(e) => setFormData(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Delete Vehicle Modal with registration number confirmation
function DeleteVehicleModal({ vehicle, onClose, onSuccess }: { vehicle: Vehicle; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationText, setConfirmationText] = useState('');

    const vehicleLabel = vehicle.vehicleRegistrationNumber;
    const isConfirmationMatching = confirmationText === vehicleLabel;

    const handleDelete = async () => {
        if (!isConfirmationMatching) return;

        setLoading(true);
        setError('');

        try {
            await vehicleApi.delete(vehicle.vehicleId);
            onSuccess();
        } catch (err) {
            setError(t('common.error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-glass">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                            <AlertTriangle size={20} />
                            {t('common.delete')}
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-glass rounded-full text-text-muted">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} className="text-red-500" />
                        </div>
                        <p className="text-text-main">
                            {t('vehicles.confirmDelete')}
                        </p>
                        <p className="text-text-sub font-semibold mt-2">
                            "{vehicle.vehicleMake} {vehicle.vehicleModel}" - {vehicleLabel}
                        </p>
                        <p className="text-sm text-text-muted mt-2">
                            {t('vehicles.deleteWarning')}
                        </p>
                    </div>

                    {/* Confirmation input */}
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                        <label className="block text-sm font-medium text-text-main mb-2">
                            {t('vehicles.typeRegistrationToConfirm')}
                        </label>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder={vehicleLabel}
                            className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 ${confirmationText && !isConfirmationMatching
                                ? 'border-red-400 focus:ring-red-500'
                                : isConfirmationMatching
                                    ? 'border-green-400 focus:ring-green-500'
                                    : 'border-glass focus:ring-red-500'
                                }`}
                        />
                        {confirmationText && !isConfirmationMatching && (
                            <p className="text-xs text-red-500 mt-1">{t('vehicles.registrationDoesNotMatch')}</p>
                        )}
                        {isConfirmationMatching && (
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                <CheckCircle size={12} />
                                {t('vehicles.registrationMatches')}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading || !isConfirmationMatching}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('common.loading') : t('common.delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Create Vehicle Modal Component
function CreateVehicleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [fleets, setFleets] = useState<Fleet[]>([]);
    const [formData, setFormData] = useState({
        fleetId: '',
        vehicleRegistrationNumber: '',
        vehicleIdentificationNumber: '',
        vehicleMake: '',
        vehicleModel: '',
        type: VehicleType.CAR,
        state: VehicleState.PARKED,
        fuelType: FuelType.PETROL,
        fuelLevel: 100,
        numberOfPassengers: 5
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [vehicleImages, setVehicleImages] = useState<{ file: File; preview: string }[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validImages: { file: File; preview: string }[] = [];

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Une image dépasse 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Format invalide. Images uniquement.');
                return;
            }
            validImages.push({ file, preview: URL.createObjectURL(file) });
        });

        setVehicleImages(prev => [...prev, ...validImages].slice(0, 10)); // Max 10 images
        setError('');
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(vehicleImages[index].preview);
        setVehicleImages(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const loadFleets = async () => {
            try {
                const userStr = localStorage.getItem('fleetman-user');
                let data: Fleet[] = [];

                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.organizationId) {
                        data = await fleetApi.getByOrganization(user.organizationId);
                    } else {
                        data = await fleetApi.getAll();
                    }
                } else {
                    data = await fleetApi.getAll();
                }

                setFleets(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, fleetId: String(data[0].fleetId) }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadFleets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await vehicleApi.create({
                vehicleRegistrationNumber: formData.vehicleRegistrationNumber,
                vehicleIdentificationNumber: formData.vehicleIdentificationNumber,
                vehicleMake: formData.vehicleMake,
                vehicleModel: formData.vehicleModel,
                type: formData.type,
                state: formData.state,
                fuelType: formData.fuelType,
                fuelLevel: formData.fuelLevel,
                numberOfPassengers: formData.numberOfPassengers,
                fleetId: parseInt(formData.fleetId)
            });
            onSuccess();
        } catch (err) {
            setError(t('common.error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-glass flex items-center justify-between sticky top-0 bg-surface">
                    <h2 className="text-xl font-semibold text-text-main">{t('vehicles.new')}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-glass rounded-full text-text-muted">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">Flotte *</label>
                        <select
                            required
                            value={formData.fleetId}
                            onChange={(e) => setFormData(prev => ({ ...prev, fleetId: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                            {fleets.map(fleet => (
                                <option key={fleet.fleetId} value={fleet.fleetId}>{fleet.fleetName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Marque *</label>
                            <input
                                type="text"
                                required
                                value={formData.vehicleMake}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleMake: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Ex: Toyota"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Modèle *</label>
                            <input
                                type="text"
                                required
                                value={formData.vehicleModel}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Ex: Corolla"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Immatriculation *</label>
                            <input
                                type="text"
                                required
                                value={formData.vehicleRegistrationNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleRegistrationNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="Ex: AB-123-CD"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">VIN *</label>
                            <input
                                type="text"
                                required
                                value={formData.vehicleIdentificationNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleIdentificationNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder="N° de châssis"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as VehicleType }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={VehicleType.CAR}>Voiture</option>
                                <option value={VehicleType.TRUCK}>Camion</option>
                                <option value={VehicleType.VAN}>Van</option>
                                <option value={VehicleType.MOTORCYCLE}>Moto</option>
                                <option value={VehicleType.BUS}>Bus</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Carburant</label>
                            <select
                                value={formData.fuelType}
                                onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value as FuelType }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={FuelType.PETROL}>Essence</option>
                                <option value={FuelType.DIESEL}>Diesel</option>
                                <option value={FuelType.ELECTRIC}>Électrique</option>
                                <option value={FuelType.HYBRID}>Hybride</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Passagers</label>
                            <input
                                type="number"
                                min={1}
                                value={formData.numberOfPassengers}
                                onChange={(e) => setFormData(prev => ({ ...prev, numberOfPassengers: parseInt(e.target.value) }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Niveau carburant (%)</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={formData.fuelLevel}
                                onChange={(e) => setFormData(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    {/* Vehicle Images Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-2">Photos du véhicule (optionnel)</label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <div className="flex flex-col items-center justify-center py-2">
                                <Upload className="w-6 h-6 mb-1 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Cliquez pour ajouter des photos</p>
                                <p className="text-xs text-gray-400">PNG, JPG (max 5MB chacune, max 10 photos)</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                        </label>

                        {vehicleImages.length > 0 && (
                            <div className="mt-3 grid grid-cols-5 gap-2">
                                {vehicleImages.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-glass group">
                                        <img src={img.preview} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.fleetId}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
