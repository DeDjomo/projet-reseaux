"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import fleetManagerApi from '@/services/fleetManagerApi';
import { organizationApi } from '@/services';
import { FleetManager, FleetManagerCreate, DriverState, Gender, Language } from '@/types';
import { Plus, UserCog, Edit, Trash2, Search, Filter, Phone, Mail, X, AlertTriangle, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagersPage() {
    const { t } = useLanguage();
    const [managers, setManagers] = useState<FleetManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stateFilter, setStateFilter] = useState<DriverState | 'ALL'>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingManager, setEditingManager] = useState<FleetManager | null>(null);
    const [deletingManager, setDeletingManager] = useState<FleetManager | null>(null);
    const [statusManager, setStatusManager] = useState<FleetManager | null>(null);

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            // Get organization from localStorage
            const orgStr = localStorage.getItem('fleetman-organization');
            const userStr = localStorage.getItem('fleetman-user');

            let organizationId: number | undefined;

            if (orgStr) {
                const org = JSON.parse(orgStr);
                organizationId = org.organizationId;
            } else if (userStr) {
                const user = JSON.parse(userStr);
                organizationId = user.organizationId;
            }

            let data: FleetManager[] = [];

            if (organizationId) {
                // Use organization-based endpoint
                data = await organizationApi.getFleetManagers(organizationId);
            } else {
                console.warn('No organization found, fetching all managers');
                data = await fleetManagerApi.getAll();
            }

            setManagers(data);
        } catch (error) {
            console.error("Failed to fetch managers", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredManagers = managers.filter(manager => {
        const fullName = `${manager.managerFirstName} ${manager.managerLastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            manager.managerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.managerPhoneNumber?.includes(searchTerm);

        const matchesState = stateFilter === 'ALL' || manager.managerState === stateFilter;

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
            case DriverState.ACTIVE: return t('managers.active');
            case DriverState.INACTIVE: return t('managers.inactive');
            case DriverState.ON_LEAVE: return t('managers.onLeave');
            case DriverState.SUSPENDED: return t('managers.suspended');
            default: return state;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">
                        {t('managers.title')}
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        {t('managers.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>{t('managers.new')}</span>
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
                        placeholder={t('managers.searchPlaceholder')}
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
                        <option value={DriverState.ACTIVE}>{t('managers.active')}</option>
                        <option value={DriverState.INACTIVE}>{t('managers.inactive')}</option>
                        <option value={DriverState.ON_LEAVE}>{t('managers.onLeave')}</option>
                        <option value={DriverState.SUSPENDED}>{t('managers.suspended')}</option>
                    </select>
                </div>
            </div>

            {/* Managers Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                </div>
            ) : filteredManagers.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-glass">
                    <UserCog size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-medium text-text-main">{t('managers.noManagers')}</h3>
                    <p className="text-text-muted mt-1">{t('managers.addFirst')}</p>
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-glass shadow-sm overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-glass/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Gestionnaire
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Coordonnées
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Flottes
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass">
                                {filteredManagers.map((manager) => (
                                    <tr key={manager.managerId} className="hover:bg-glass/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {manager.managerFirstName?.[0]}{manager.managerLastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-main">
                                                        {manager.managerFirstName} {manager.managerLastName}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        ID: {manager.managerId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-text-main">
                                                    <Mail size={14} className="text-text-muted flex-shrink-0" />
                                                    <span className="truncate max-w-[200px]">{manager.managerEmail}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-text-sub">
                                                    <Phone size={14} className="text-text-muted flex-shrink-0" />
                                                    <span>{manager.managerPhoneNumber || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStateColor(manager.managerState)}`}>
                                                {getStateLabel(manager.managerState)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent font-semibold text-sm">
                                                {manager.fleetsCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setStatusManager(manager)}
                                                    className="p-2 rounded-lg hover:bg-glass text-text-muted hover:text-blue-500 transition-colors"
                                                    title="Changer le statut"
                                                >
                                                    <UserCog size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingManager(manager)}
                                                    className="p-2 rounded-lg hover:bg-glass text-text-muted hover:text-accent transition-colors"
                                                    title={t('common.edit')}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingManager(manager)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden divide-y divide-glass">
                        {filteredManagers.map((manager) => (
                            <div key={manager.managerId} className="p-4 hover:bg-glass/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                            {manager.managerFirstName?.[0]}{manager.managerLastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-main">
                                                {manager.managerFirstName} {manager.managerLastName}
                                            </p>
                                            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStateColor(manager.managerState)}`}>
                                                {getStateLabel(manager.managerState)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setStatusManager(manager)}
                                            className="p-2 rounded-lg hover:bg-glass text-text-muted text-blue-500"
                                        >
                                            <UserCog size={18} />
                                        </button>
                                        <button
                                            onClick={() => setEditingManager(manager)}
                                            className="p-2 rounded-lg hover:bg-glass text-text-muted"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingManager(manager)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 ml-15 space-y-1 text-sm">
                                    <div className="flex items-center gap-2 text-text-sub">
                                        <Mail size={14} className="text-text-muted" />
                                        <span className="truncate">{manager.managerEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-sub">
                                        <Phone size={14} className="text-text-muted" />
                                        <span>{manager.managerPhoneNumber || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-sub">
                                        <Building2 size={14} className="text-text-muted" />
                                        <span>{manager.fleetsCount || 0} {t('managers.fleetsManaged')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Manager Modal */}
            {showCreateModal && (
                <CreateManagerModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchManagers();
                    }}
                />
            )}

            {/* Edit Manager Modal */}
            {editingManager && (
                <EditManagerModal
                    manager={editingManager}
                    onClose={() => setEditingManager(null)}
                    onSuccess={() => {
                        setEditingManager(null);
                        fetchManagers();
                    }}
                />
            )}

            {/* Status Manager Modal */}
            {statusManager && (
                <ChangeStatusModal
                    manager={statusManager}
                    onClose={() => setStatusManager(null)}
                    onSuccess={() => {
                        setStatusManager(null);
                        fetchManagers();
                    }}
                />
            )}

            {/* Delete Manager Modal */}
            {deletingManager && (
                <DeleteManagerModal
                    manager={deletingManager}
                    onClose={() => setDeletingManager(null)}
                    onSuccess={() => {
                        setDeletingManager(null);
                        fetchManagers();
                    }}
                />
            )}
        </div>
    );
}

// Edit Manager Modal
function EditManagerModal({ manager, onClose, onSuccess }: { manager: FleetManager; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        managerFirstName: manager.managerFirstName || '',
        managerLastName: manager.managerLastName || '',
        managerPhoneNumber: manager.managerPhoneNumber || '',
        managerIdCardNumber: manager.managerIdCardNumber || '',
        personalAddress: manager.personalAddress || '',
        personalCity: manager.personalCity || '',
        gender: manager.gender || Gender.MALE
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await fleetManagerApi.update(manager.managerId, formData);
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
                            {t('common.edit')} - {manager.managerFirstName} {manager.managerLastName}
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
                                value={formData.managerFirstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, managerFirstName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Nom</label>
                            <input
                                type="text"
                                value={formData.managerLastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, managerLastName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.managerPhoneNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, managerPhoneNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Genre</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={Gender.MALE}>Homme</option>
                                <option value={Gender.FEMALE}>Femme</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">N° Carte d'identité</label>
                        <input
                            type="text"
                            value={formData.managerIdCardNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, managerIdCardNumber: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Adresse</label>
                            <input
                                type="text"
                                value={formData.personalAddress}
                                onChange={(e) => setFormData(prev => ({ ...prev, personalAddress: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Ville</label>
                            <input
                                type="text"
                                value={formData.personalCity}
                                onChange={(e) => setFormData(prev => ({ ...prev, personalCity: e.target.value }))}
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

// Delete Manager Modal with name confirmation
function DeleteManagerModal({ manager, onClose, onSuccess }: { manager: FleetManager; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationName, setConfirmationName] = useState('');

    const managerFullName = `${manager.managerFirstName} ${manager.managerLastName}`;
    const isNameMatching = confirmationName === managerFullName;

    const handleDelete = async () => {
        if (!isNameMatching) return;

        setLoading(true);
        setError('');

        try {
            await fleetManagerApi.delete(manager.managerId);
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
                            {t('managers.confirmDelete')}
                        </p>
                        <p className="text-text-sub font-semibold mt-2">
                            "{managerFullName}"
                        </p>
                        <p className="text-sm text-text-muted mt-2">
                            {t('managers.deleteWarning')}
                        </p>
                    </div>

                    {/* Confirmation input */}
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                        <label className="block text-sm font-medium text-text-main mb-2">
                            {t('managers.typeNameToConfirm')}
                        </label>
                        <input
                            type="text"
                            value={confirmationName}
                            onChange={(e) => setConfirmationName(e.target.value)}
                            placeholder={managerFullName}
                            className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 ${confirmationName && !isNameMatching
                                ? 'border-red-400 focus:ring-red-500'
                                : isNameMatching
                                    ? 'border-green-400 focus:ring-green-500'
                                    : 'border-glass focus:ring-red-500'
                                }`}
                        />
                        {confirmationName && !isNameMatching && (
                            <p className="text-xs text-red-500 mt-1">{t('managers.nameDoesNotMatch')}</p>
                        )}
                        {isNameMatching && (
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                <CheckCircle size={12} />
                                {t('managers.nameMatches')}
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

// Create Manager Modal
function CreateManagerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState<FleetManagerCreate>({
        managerEmail: '',
        managerPassword: '',
        managerFirstName: '',
        managerLastName: '',
        managerPhoneNumber: '',
        gender: Gender.MALE,
        managerIdCardNumber: '',
        personalAddress: '',
        personalCity: '',
        language: language
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
                setError(t('managers.noAdminId'));
                return;
            }
            await fleetManagerApi.create(adminId, formData);
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
                    <h2 className="text-xl font-semibold text-text-main">{t('managers.new')}</h2>
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
                                value={formData.managerFirstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, managerFirstName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Nom *</label>
                            <input
                                type="text"
                                required
                                value={formData.managerLastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, managerLastName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.managerEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, managerEmail: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">Mot de passe * (min. 8 caractères)</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={formData.managerPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, managerPassword: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.managerPhoneNumber || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, managerPhoneNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Genre</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value={Gender.MALE}>Homme</option>
                                <option value={Gender.FEMALE}>Femme</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Adresse</label>
                            <input
                                type="text"
                                value={formData.personalAddress || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, personalAddress: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">Ville</label>
                            <input
                                type="text"
                                value={formData.personalCity || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, personalCity: e.target.value }))}
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
// Status Change Modal
function ChangeStatusModal({ manager, onClose, onSuccess }: { manager: FleetManager; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Status handling
    const handleStatusChange = async (newState: DriverState) => {
        setLoading(true);
        try {
            await fleetManagerApi.updateState(manager.managerId, newState);
            toast.success(t('common.success'));
            onSuccess();
        } catch (error) {
            console.error('Error updating status', error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-sm">
                <div className="p-4 border-b border-glass flex justify-between items-center">
                    <h3 className="font-semibold text-text-main">Changer le statut</h3>
                    <button onClick={onClose}><X size={20} className="text-text-muted" /></button>
                </div>
                <div className="p-4 flex flex-col gap-2">
                    <p className="text-sm text-text-muted mb-2">Sélectionnez le nouveau statut pour {manager.managerFirstName} :</p>

                    {[DriverState.ACTIVE, DriverState.ON_LEAVE, DriverState.SUSPENDED, DriverState.INACTIVE].map(state => (
                        <button
                            key={state}
                            disabled={loading || manager.managerState === state}
                            onClick={() => handleStatusChange(state)}
                            className={`p-3 rounded-lg text-left text-sm font-medium transition flex items-center justify-between
                                ${manager.managerState === state
                                    ? 'bg-secondary/10 text-secondary border border-secondary/20 cursor-default'
                                    : 'bg-glass hover:bg-glass/80 text-text-main border border-glass hover:border-text-muted/20'
                                }`}
                        >
                            <span>
                                {state === DriverState.ACTIVE && t('managers.active')}
                                {state === DriverState.INACTIVE && t('managers.inactive')}
                                {state === DriverState.ON_LEAVE && t('managers.onLeave')}
                                {state === DriverState.SUSPENDED && t('managers.suspended')}
                            </span>
                            {manager.managerState === state && <CheckCircle size={16} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
