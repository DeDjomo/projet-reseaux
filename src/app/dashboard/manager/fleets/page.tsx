"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import fleetApi from '@/services/fleetApi';
import fleetManagerApi from '@/services/fleetManagerApi';
import { organizationApi } from '@/services';
import { Fleet, FleetCreate, FleetType, FleetManagerCreate, Gender, Language } from '@/types';
import { Plus, Truck, Edit, Trash2, Search, X, UserPlus, CheckCircle, AlertCircle, AlertTriangle, Filter } from 'lucide-react';
import { FleetManager } from '@/types';

export default function FleetsPage() {
    const { t } = useLanguage();
    const [fleets, setFleets] = useState<Fleet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateWizard, setShowCreateWizard] = useState(false);
    const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
    const [deletingFleet, setDeletingFleet] = useState<Fleet | null>(null);

    // Filters
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [managerFilter, setManagerFilter] = useState<string>('ALL');
    const [managers, setManagers] = useState<FleetManager[]>([]);

    useEffect(() => {
        fetchFleets();
    }, []);

    const fetchFleets = async () => {
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

            let data: Fleet[] = [];

            if (organizationId) {
                // Use organization-based endpoint
                data = await organizationApi.getFleets(organizationId);

                // Fetch managers for filter
                try {
                    const managersData = await organizationApi.getFleetManagers(organizationId);
                    setManagers(managersData);
                } catch (err) {
                    // Failed to fetch managers for filter
                }
            } else {
                // No organization found, fetching all fleets
                data = await fleetApi.getAll();
            }

            setFleets(data);
        } catch (error) {
            // Failed to fetch fleets
        } finally {
            setLoading(false);
        }
    };

    const filteredFleets = fleets.filter(fleet => {
        const matchesSearch = fleet.fleetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fleet.fleetDescription?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'ALL' || fleet.fleetType === typeFilter;

        // Match manager ID or Name (since we only have name in Fleet object usually, or need to check how backend returns it)
        // Fleet object has fleetManagerName. We filter by name if using the select populated by manager names.
        // But better to check how we want to filter. 
        // Let's assume managerFilter is the manager's Name for now as fleet object has `fleetManagerName`.
        // Or if we can, use ID. But Fleet object typically has ID? Let's check Fleet type definition if needed.
        // The display uses fleetManagerName.
        const matchesManager = managerFilter === 'ALL' || fleet.fleetManagerName === managerFilter;

        return matchesSearch && matchesType && matchesManager;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">
                        {t('fleets.title')}
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        {t('fleets.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateWizard(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>{t('fleets.new')}</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-text-muted" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('fleets.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="relative min-w-[180px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter size={16} className="text-text-muted" />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="block w-full pl-9 pr-8 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary appearance-none"
                        >
                            <option value="ALL">{t('fleets.filter.allTypes')}</option>
                            <option value="PERSONAL">{t('fleetType.personal')}</option>
                            <option value="PASSENGER_TRANSPORT">{t('fleetType.passengerTransport')}</option>
                            <option value="CARGO_TRANSPORT">{t('fleetType.cargoTransport')}</option>
                            <option value="DELIVERY">{t('fleetType.delivery')}</option>
                            <option value="RENTAL">{t('fleetType.rental')}</option>
                            <option value="MIXED">{t('fleetType.mixed')}</option>
                            <option value="OTHER">{t('fleetType.other')}</option>
                        </select>
                    </div>

                    <div className="relative min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter size={16} className="text-text-muted" />
                        </div>
                        <select
                            value={managerFilter}
                            onChange={(e) => setManagerFilter(e.target.value)}
                            className="block w-full pl-9 pr-8 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary appearance-none"
                        >
                            <option value="ALL">{t('fleets.filter.allManagers')}</option>
                            {managers.map(manager => (
                                <option key={manager.managerId} value={`${manager.managerFirstName} ${manager.managerLastName}`}>
                                    {manager.managerFirstName} {manager.managerLastName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Fleets Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                </div>
            ) : filteredFleets.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg border border-glass">
                    <Truck size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-medium text-text-main">{t('fleets.noFleets')}</h3>
                    <p className="text-text-muted mt-1">{t('fleets.createFirst')}</p>
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-glass shadow-sm overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-glass/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        {t('fleets.table.fleet')}
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        {t('fleets.table.type')}
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        {t('fleets.table.vehicles')}
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        {t('fleets.table.manager')}
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        {t('fleets.table.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass">
                                {filteredFleets.map((fleet) => (
                                    <tr key={fleet.fleetId} className="hover:bg-glass/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-secondary/10">
                                                    <Truck size={20} className="text-secondary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-main">
                                                        {fleet.fleetName}
                                                    </p>
                                                    <p className="text-xs text-text-muted line-clamp-1 max-w-[200px]">
                                                        {fleet.fleetDescription || t('fleets.noDescription')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                                {fleet.fleetType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/10 text-secondary font-semibold text-sm">
                                                {fleet.vehiclesCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-text-sub">
                                                {fleet.fleetManagerName || t('fleets.notAssigned')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingFleet(fleet)}
                                                    className="p-2 rounded-lg hover:bg-glass text-text-muted hover:text-accent transition-colors"
                                                    title={t('common.edit')}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingFleet(fleet)}
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
                        {filteredFleets.map((fleet) => (
                            <div key={fleet.fleetId} className="p-4 hover:bg-glass/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-secondary/10">
                                            <Truck size={24} className="text-secondary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-main">
                                                {fleet.fleetName}
                                            </p>
                                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                                {fleet.fleetType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setEditingFleet(fleet)}
                                            className="p-2 rounded-lg hover:bg-glass text-text-muted"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingFleet(fleet)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 ml-12 space-y-1 text-sm">
                                    <p className="text-text-sub line-clamp-2">
                                        {fleet.fleetDescription || t('fleets.noDescription')}
                                    </p>
                                    <div className="flex items-center gap-4 text-text-muted pt-2">
                                        <span>{fleet.vehiclesCount || 0} {t('fleets.vehicles')}</span>
                                        <span>•</span>
                                        <span>{fleet.fleetManagerName || t('fleets.notAssigned')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Fleet Wizard */}
            {showCreateWizard && (
                <CreateFleetWizard
                    onClose={() => setShowCreateWizard(false)}
                    onSuccess={() => {
                        setShowCreateWizard(false);
                        fetchFleets();
                    }}
                />
            )}

            {/* Edit Fleet Modal */}
            {editingFleet && (
                <EditFleetModal
                    fleet={editingFleet}
                    onClose={() => setEditingFleet(null)}
                    onSuccess={() => {
                        setEditingFleet(null);
                        fetchFleets();
                    }}
                />
            )}

            {/* Delete Fleet Modal */}
            {deletingFleet && (
                <DeleteFleetModal
                    fleet={deletingFleet}
                    onClose={() => setDeletingFleet(null)}
                    onSuccess={() => {
                        setDeletingFleet(null);
                        fetchFleets();
                    }}
                />
            )}
        </div>
    );
}

// Edit Fleet Modal
function EditFleetModal({ fleet, onClose, onSuccess }: { fleet: Fleet; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fleetName: fleet.fleetName || '',
        fleetDescription: fleet.fleetDescription || '',
        fleetType: fleet.fleetType || 'DELIVERY'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await fleetApi.update(fleet.fleetId, formData);
            onSuccess();
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-glass">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-text-main flex items-center gap-2">
                            <Edit size={20} />
                            {t('common.edit')} - {fleet.fleetName}
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

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">{t('form.fleetName')} *</label>
                        <input
                            type="text"
                            required
                            value={formData.fleetName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fleetName: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">{t('form.description')}</label>
                        <textarea
                            rows={3}
                            value={formData.fleetDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, fleetDescription: e.target.value }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-1">{t('form.fleetType')}</label>
                        <select
                            value={formData.fleetType}
                            onChange={(e) => setFormData(prev => ({ ...prev, fleetType: e.target.value as any }))}
                            className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                            <option value="PERSONAL">{t('fleetType.personal')}</option>
                            <option value="PASSENGER_TRANSPORT">{t('fleetType.passengerTransport')}</option>
                            <option value="CARGO_TRANSPORT">{t('fleetType.cargoTransport')}</option>
                            <option value="DELIVERY">{t('fleetType.delivery')}</option>
                            <option value="RENTAL">{t('fleetType.rental')}</option>
                            <option value="MIXED">{t('fleetType.mixed')}</option>
                            <option value="OTHER">{t('fleetType.other')}</option>
                        </select>
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

// Delete Fleet Modal
function DeleteFleetModal({ fleet, onClose, onSuccess }: { fleet: Fleet; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationName, setConfirmationName] = useState('');

    const isNameMatching = confirmationName === fleet.fleetName;

    const handleDelete = async () => {
        if (!isNameMatching) return;

        setLoading(true);
        setError('');

        try {
            await fleetApi.delete(fleet.fleetId);
            onSuccess();
        } catch (err) {
            setError(t('common.error'));
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
                            {t('fleets.confirmDelete')}
                        </p>
                        <p className="text-text-sub font-semibold mt-2">
                            "{fleet.fleetName}"
                        </p>
                        <p className="text-sm text-text-muted mt-2">
                            {t('fleets.deleteWarning')}
                        </p>
                    </div>

                    {/* Confirmation input */}
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                        <label className="block text-sm font-medium text-text-main mb-2">
                            {t('fleets.typeNameToConfirm')}
                        </label>
                        <input
                            type="text"
                            value={confirmationName}
                            onChange={(e) => setConfirmationName(e.target.value)}
                            placeholder={fleet.fleetName}
                            className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 ${confirmationName && !isNameMatching
                                ? 'border-red-400 focus:ring-red-500'
                                : isNameMatching
                                    ? 'border-green-400 focus:ring-green-500'
                                    : 'border-glass focus:ring-red-500'
                                }`}
                        />
                        {confirmationName && !isNameMatching && (
                            <p className="text-xs text-red-500 mt-1">{t('fleets.nameDoesNotMatch')}</p>
                        )}
                        {isNameMatching && (
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                <CheckCircle size={12} />
                                {t('fleets.nameMatches')}
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

// Wizard component for creating Fleet + FleetManager
// Order: 1. Fleet Info → 2. Manager Info → 3. Confirm & Create
function CreateFleetWizard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fleet form data (Step 1)
    const [fleetData, setFleetData] = useState<FleetCreate>({
        fleetName: '',
        fleetDescription: '',
        fleetType: 'DELIVERY' as FleetType
    });

    // Fleet Manager form data (Step 2) - All fields from FleetManagerCreateDTO
    const [managerData, setManagerData] = useState<FleetManagerCreate>({
        managerEmail: '',
        managerPassword: '',
        managerLastName: '',
        managerFirstName: '',
        managerPhoneNumber: '',
        gender: 'MALE' as Gender,
        managerIdCardNumber: '',
        personalAddress: '',
        personalCity: '',
        personalPostalCode: '',
        personalCountry: '',
        taxNumber: '',
        niu: '',
        language: 'FR' as Language
    });

    const handleSubmitFleet = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmitManager = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    const handleCreateAll = async () => {
        setLoading(true);
        setError('');

        try {
            // Get admin ID from localStorage
            const userStr = localStorage.getItem('fleetman-user');
            let adminId = 1;
            if (userStr) {
                const user = JSON.parse(userStr);
                adminId = user.adminId || user.userId || 1;
            }

            // Step 1: Create Fleet Manager first (backend requirement)
            const newManager = await fleetManagerApi.create(adminId, managerData as unknown as FleetManagerCreate);

            // Step 2: Create Fleet with the new manager ID
            await fleetApi.create(newManager.managerId, fleetData as unknown as FleetCreate);

            // Success!
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } catch (err) {
            setError(t('wizard.errorFleet'));
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header with steps */}
                <div className="p-6 border-b border-glass sticky top-0 bg-surface z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-text-main">
                            {step === 1 && t('wizard.step1TitleFleet')}
                            {step === 2 && t('wizard.step2TitleManager')}
                            {step === 3 && t('wizard.step3Confirm')}
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-glass rounded-full text-text-muted">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-secondary' : 'bg-glass'}`} />
                        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-secondary' : 'bg-glass'}`} />
                        <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-glass'}`} />
                    </div>
                </div>

                {/* Step 1: Fleet Information */}
                {step === 1 && (
                    <form onSubmit={handleSubmitFleet} className="p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4 text-text-sub">
                            <Truck size={20} />
                            <span>{t('wizard.fleetInfoDesc')}</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">{t('form.fleetName')} *</label>
                            <input
                                type="text"
                                required
                                value={fleetData.fleetName}
                                onChange={(e) => setFleetData(prev => ({ ...prev, fleetName: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                placeholder={t('fleets.form.namePlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">{t('form.description')}</label>
                            <textarea
                                rows={3}
                                value={fleetData.fleetDescription}
                                onChange={(e) => setFleetData(prev => ({ ...prev, fleetDescription: e.target.value }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                                placeholder={t('fleets.form.descPlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-sub mb-1">{t('form.fleetType')}</label>
                            <select
                                value={fleetData.fleetType}
                                onChange={(e) => setFleetData(prev => ({ ...prev, fleetType: e.target.value as any }))}
                                className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value="PERSONAL">{t('fleetType.personal')}</option>
                                <option value="PASSENGER_TRANSPORT">{t('fleetType.passengerTransport')}</option>
                                <option value="CARGO_TRANSPORT">{t('fleetType.cargoTransport')}</option>
                                <option value="DELIVERY">{t('fleetType.delivery')}</option>
                                <option value="RENTAL">{t('fleetType.rental')}</option>
                                <option value="MIXED">{t('fleetType.mixed')}</option>
                                <option value="OTHER">{t('fleetType.other')}</option>
                            </select>
                        </div>

                        <p className="text-xs text-text-muted">{t('form.requiredFields')}</p>

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
                                className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                            >
                                {t('wizard.next')} →
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Fleet Manager Information */}
                {step === 2 && (
                    <form onSubmit={handleSubmitManager} className="p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4 text-text-sub">
                            <UserPlus size={20} />
                            <span>{t('wizard.managerInfoDesc')}</span>
                        </div>

                        {/* Required fields section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-text-main border-b border-glass pb-2">
                                {t('form.requiredFields')}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.firstName')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={managerData.managerFirstName}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, managerFirstName: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.lastName')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={managerData.managerLastName}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, managerLastName: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">{t('form.email')} *</label>
                                <input
                                    type="email"
                                    required
                                    value={managerData.managerEmail}
                                    onChange={(e) => setManagerData(prev => ({ ...prev, managerEmail: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">{t('form.password')} *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={managerData.managerPassword}
                                    onChange={(e) => setManagerData(prev => ({ ...prev, managerPassword: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    placeholder={t('fleets.form.pwdPlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Optional fields section */}
                        <div className="space-y-4 mt-6">
                            <h3 className="text-sm font-semibold text-text-main border-b border-glass pb-2">
                                {t('fleets.wizard.optionalInfo')}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.phone')}</label>
                                    <input
                                        type="tel"
                                        value={managerData.managerPhoneNumber}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, managerPhoneNumber: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.gender')}</label>
                                    <select
                                        value={managerData.gender}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, gender: e.target.value as any }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    >
                                        <option value="MALE">{t('form.gender.male')}</option>
                                        <option value="FEMALE">{t('form.gender.female')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.idCardNumber')}</label>
                                    <input
                                        type="text"
                                        value={managerData.managerIdCardNumber}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, managerIdCardNumber: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.niu')}</label>
                                    <input
                                        type="text"
                                        value={managerData.niu}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, niu: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">{t('form.address')}</label>
                                <input
                                    type="text"
                                    value={managerData.personalAddress}
                                    onChange={(e) => setManagerData(prev => ({ ...prev, personalAddress: e.target.value }))}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.city')}</label>
                                    <input
                                        type="text"
                                        value={managerData.personalCity}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, personalCity: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.postalCode')}</label>
                                    <input
                                        type="text"
                                        value={managerData.personalPostalCode}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, personalPostalCode: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.country')}</label>
                                    <input
                                        type="text"
                                        value={managerData.personalCountry}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, personalCountry: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.taxNumber')}</label>
                                    <input
                                        type="text"
                                        value={managerData.taxNumber}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, taxNumber: e.target.value }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">{t('form.language')}</label>
                                    <select
                                        value={managerData.language}
                                        onChange={(e) => setManagerData(prev => ({ ...prev, language: e.target.value as any }))}
                                        className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                                    >
                                        <option value="FR">Français</option>
                                        <option value="ENG">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors"
                            >
                                ← {t('wizard.back')}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                            >
                                {t('wizard.next')} →
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 mb-4 text-text-sub">
                            <CheckCircle size={20} />
                            <span>{t('wizard.confirmDesc')}</span>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {/* Fleet Summary */}
                        <div className="bg-glass/50 rounded-lg p-4">
                            <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2">
                                <Truck size={18} />
                                {t('wizard.successFleet')}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-text-muted">{t('form.fleetName')}:</span>
                                    <span className="ml-2 text-text-main font-medium">{fleetData.fleetName}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted">{t('form.fleetType')}:</span>
                                    <span className="ml-2 text-text-main font-medium">{fleetData.fleetType}</span>
                                </div>
                                {fleetData.fleetDescription && (
                                    <div className="col-span-2">
                                        <span className="text-text-muted">{t('form.description')}:</span>
                                        <span className="ml-2 text-text-main">{fleetData.fleetDescription}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manager Summary */}
                        <div className="bg-glass/50 rounded-lg p-4">
                            <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2">
                                <UserPlus size={18} />
                                {t('wizard.successManager')}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-text-muted">{t('form.firstName')}:</span>
                                    <span className="ml-2 text-text-main font-medium">{managerData.managerFirstName}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted">{t('form.lastName')}:</span>
                                    <span className="ml-2 text-text-main font-medium">{managerData.managerLastName}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-text-muted">{t('form.email')}:</span>
                                    <span className="ml-2 text-text-main">{managerData.managerEmail}</span>
                                </div>
                                {managerData.managerPhoneNumber && (
                                    <div>
                                        <span className="text-text-muted">{t('form.phone')}:</span>
                                        <span className="ml-2 text-text-main">{managerData.managerPhoneNumber}</span>
                                    </div>
                                )}
                                {managerData.personalCity && (
                                    <div>
                                        <span className="text-text-muted">{t('form.city')}:</span>
                                        <span className="ml-2 text-text-main">{managerData.personalCity}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors disabled:opacity-50"
                            >
                                ← {t('wizard.back')}
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateAll}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? t('wizard.creating') : t('wizard.createAll')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
