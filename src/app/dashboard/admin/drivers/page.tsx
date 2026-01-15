"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import driverApi from '@/services/driverApi';
import { Driver, DriverState } from '@/types';
import { Plus, Users, Edit, Trash2, Search, Filter, Phone, Mail, X, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export default function DriversPage() {
    const { t } = useLanguage();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stateFilter, setStateFilter] = useState<DriverState | 'ALL'>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const userStr = localStorage.getItem('fleetman-user');
            let data: Driver[] = [];

            console.log('fetchDrivers - userStr:', userStr);

            if (userStr) {
                const user = JSON.parse(userStr);
                console.log('fetchDrivers - user:', user);

                // Use adminId (user.userId) to fetch drivers via the new composite method
                if (user.userId) {
                    console.log('Fetching drivers by adminId:', user.userId);
                    data = await driverApi.getByAdminId(user.userId);
                    console.log('Drivers fetched:', data);
                } else if (user.organizationId) {
                    console.log('Fetching drivers by organizationId:', user.organizationId);
                    data = await driverApi.getByOrganization(user.organizationId);
                } else {
                    console.log('No userId or organizationId, fetching all');
                    data = await driverApi.getAll();
                }
            } else {
                console.log('No user in localStorage, fetching all');
                data = await driverApi.getAll();
            }
            console.log('Setting drivers:', data);
            setDrivers(data);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(driver => {
        const fullName = `${driver.driverFirstName} ${driver.driverLastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            driver.driverEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.driverPhoneNumber?.includes(searchTerm);

        const matchesState = stateFilter === 'ALL' || driver.driverState === stateFilter;

        return matchesSearch && matchesState;
    });

    const getStateColor = (state: DriverState) => {
        switch (state) {
            case DriverState.ACTIVE: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case DriverState.INACTIVE: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            case DriverState.ON_LEAVE: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case DriverState.SUSPENDED: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStateLabel = (state: DriverState) => {
        switch (state) {
            case DriverState.ACTIVE: return t('drivers.active');
            case DriverState.INACTIVE: return t('drivers.inactive');
            case DriverState.ON_LEAVE: return t('drivers.onLeave');
            case DriverState.SUSPENDED: return t('drivers.suspended');
            default: return state;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">
                        {t('drivers.title')}
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        {t('drivers.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>{t('drivers.new')}</span>
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
                        placeholder={t('drivers.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-text-muted" />
                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value as DriverState | 'ALL')}
                        className="px-3 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="ALL">{t('common.allStates')}</option>
                        <option value={DriverState.ACTIVE}>{t('drivers.active')}</option>
                        <option value={DriverState.INACTIVE}>{t('drivers.inactive')}</option>
                        <option value={DriverState.ON_LEAVE}>{t('drivers.onLeave')}</option>
                        <option value={DriverState.SUSPENDED}>{t('drivers.suspended')}</option>
                    </select>
                </div>
            </div>

            {/* Drivers Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                </div>
            ) : filteredDrivers.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-glass">
                    <Users size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-medium text-text-main">{t('drivers.noDrivers')}</h3>
                    <p className="text-text-muted mt-1">{t('drivers.addFirst')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDrivers.map((driver) => (
                        <div
                            key={driver.driverId}
                            className="bg-surface rounded-lg border border-glass shadow-sm hover:shadow-md transition-shadow p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                        {driver.driverFirstName?.[0]}{driver.driverLastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-main">
                                            {driver.driverFirstName} {driver.driverLastName}
                                        </h3>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStateColor(driver.driverState)}`}>
                                            {getStateLabel(driver.driverState)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setEditingDriver(driver)}
                                        className="p-1.5 rounded hover:bg-glass text-text-muted hover:text-text-main transition-colors"
                                        title={t('common.edit')}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeletingDriver(driver)}
                                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-text-sub">
                                    <Mail size={14} className="text-text-muted" />
                                    <span className="truncate">{driver.driverEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-sub">
                                    <Phone size={14} className="text-text-muted" />
                                    <span>{driver.driverPhoneNumber || t('drivers.notProvided')}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-glass text-sm text-text-muted">
                                {t('drivers.license')}: {driver.driverLicenseNumber || t('drivers.notProvided')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Driver Modal */}
            {showCreateModal && (
                <CreateDriverModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchDrivers();
                    }}
                />
            )}

            {/* Edit Driver Modal */}
            {editingDriver && (
                <EditDriverModal
                    driver={editingDriver}
                    onClose={() => setEditingDriver(null)}
                    onSuccess={() => {
                        setEditingDriver(null);
                        fetchDrivers();
                    }}
                />
            )}

            {/* Delete Driver Modal */}
            {deletingDriver && (
                <DeleteDriverModal
                    driver={deletingDriver}
                    onClose={() => setDeletingDriver(null)}
                    onSuccess={() => {
                        setDeletingDriver(null);
                        fetchDrivers();
                    }}
                />
            )}
        </div>
    );
}

// Edit Driver Modal
function EditDriverModal({ driver, onClose, onSuccess }: { driver: Driver; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        driverFirstName: driver.driverFirstName || '',
        driverLastName: driver.driverLastName || '',
        driverEmail: driver.driverEmail || '',
        driverPhoneNumber: driver.driverPhoneNumber || '',
        driverLicenseNumber: driver.driverLicenseNumber || '',
        driverLicenseExpiryDate: driver.driverLicenseExpiryDate || '',
        driverEmergencyContactName: driver.driverEmergencyContactName || '',
        driverEmergencyContactPhone: driver.driverEmergencyContactPhone || '',
        driverState: driver.driverState || DriverState.ACTIVE
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await driverApi.update(driver.driverId, formData);
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
                            {t('common.edit')} - {driver.driverFirstName} {driver.driverLastName}
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
                            <label className="block text-sm font-medium text-text-sub mb-1">Prénom</label>
                            <input
                                type="text"
                                value={formData.driverFirstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverFirstName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Nom</label>
                            <input
                                type="text"
                                value={formData.driverLastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverLastName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.driverEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, driverEmail: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.driverPhoneNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverPhoneNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">État</label>
                            <select
                                value={formData.driverState}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverState: e.target.value as DriverState }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={DriverState.ACTIVE}>Actif</option>
                                <option value={DriverState.INACTIVE}>Inactif</option>
                                <option value={DriverState.ON_LEAVE}>En congé</option>
                                <option value={DriverState.SUSPENDED}>Suspendu</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">N° Permis</label>
                            <input
                                type="text"
                                value={formData.driverLicenseNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverLicenseNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Expiration permis</label>
                            <input
                                type="date"
                                value={formData.driverLicenseExpiryDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverLicenseExpiryDate: e.target.value }))}
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

// Delete Driver Modal with name confirmation
function DeleteDriverModal({ driver, onClose, onSuccess }: { driver: Driver; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationName, setConfirmationName] = useState('');

    const driverFullName = `${driver.driverFirstName} ${driver.driverLastName}`;
    const isNameMatching = confirmationName === driverFullName;

    const handleDelete = async () => {
        if (!isNameMatching) return;

        setLoading(true);
        setError('');

        try {
            await driverApi.delete(driver.driverId);
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
                            {t('drivers.confirmDelete')}
                        </p>
                        <p className="text-text-sub font-semibold mt-2">
                            "{driverFullName}"
                        </p>
                        <p className="text-sm text-text-muted mt-2">
                            {t('drivers.deleteWarning')}
                        </p>
                    </div>

                    {/* Confirmation input */}
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                        <label className="block text-sm font-medium text-text-main mb-2">
                            {t('drivers.typeNameToConfirm')}
                        </label>
                        <input
                            type="text"
                            value={confirmationName}
                            onChange={(e) => setConfirmationName(e.target.value)}
                            placeholder={driverFullName}
                            className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 ${confirmationName && !isNameMatching
                                ? 'border-red-400 focus:ring-red-500'
                                : isNameMatching
                                    ? 'border-green-400 focus:ring-green-500'
                                    : 'border-glass focus:ring-red-500'
                                }`}
                        />
                        {confirmationName && !isNameMatching && (
                            <p className="text-xs text-red-500 mt-1">{t('drivers.nameDoesNotMatch')}</p>
                        )}
                        {isNameMatching && (
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                <CheckCircle size={12} />
                                {t('drivers.nameMatches')}
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
                            disabled={loading || !isNameMatching}
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

// Create Driver Modal Component
function CreateDriverModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        driverFirstName: '',
        driverLastName: '',
        driverEmail: '',
        driverPassword: '',
        driverPhoneNumber: '',
        driverLicenseNumber: '',
        driverLicenseExpiryDate: '',
        driverEmergencyContactName: '',
        driverEmergencyContactPhone: '',
        driverPersonalInformation: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userStr = localStorage.getItem('fleetman-user');
            const adminId = userStr ? JSON.parse(userStr).userId : null;

            if (!adminId) {
                setError('Admin ID non trouvé. Veuillez vous reconnecter.');
                return;
            }

            await driverApi.createAsAdmin(adminId, formData);
            onSuccess();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                setError('Un conducteur avec cet email existe déjà. Veuillez utiliser une autre adresse email.');
            } else if (err?.response?.status === 400) {
                setError('Données invalides. Vérifiez les champs obligatoires.');
            } else {
                setError(t('common.error'));
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-glass flex items-center justify-between sticky top-0 bg-surface">
                    <h2 className="text-xl font-semibold text-text-main">{t('drivers.new')}</h2>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Prénom *</label>
                            <input
                                type="text"
                                required
                                value={formData.driverFirstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverFirstName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Nom *</label>
                            <input
                                type="text"
                                required
                                value={formData.driverLastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverLastName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.driverEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, driverEmail: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">Mot de passe * (min. 8 caractères)</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={formData.driverPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, driverPassword: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Téléphone *</label>
                            <input
                                type="tel"
                                required
                                value={formData.driverPhoneNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverPhoneNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">N° Permis</label>
                            <input
                                type="text"
                                value={formData.driverLicenseNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, driverLicenseNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">Date d'expiration du permis</label>
                        <input
                            type="date"
                            value={formData.driverLicenseExpiryDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, driverLicenseExpiryDate: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div className="border-t border-glass pt-4 mt-4">
                        <h3 className="text-sm font-semibold text-text-main mb-3">Contact d'urgence</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Nom</label>
                                <input
                                    type="text"
                                    value={formData.driverEmergencyContactName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, driverEmergencyContactName: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={formData.driverEmergencyContactPhone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, driverEmergencyContactPhone: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                />
                            </div>
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
