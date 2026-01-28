
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Geofence, Vehicle, VehicleGeofence, VehicleGeofenceCreate } from '@/types';
import { vehicleGeofenceApi, vehicleApi, organizationApi } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Plus, Trash, AlertCircle, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface VehicleGeofenceModalProps {
    geofence: Geofence;
    onClose: () => void;
}

export default function VehicleGeofenceModal({ geofence, onClose }: VehicleGeofenceModalProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [associations, setAssociations] = useState<VehicleGeofence[]>([]);
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [geofence.geofenceId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch existing associations
            const assocs = await vehicleGeofenceApi.getByGeofence(geofence.geofenceId);
            setAssociations(assocs);

            // Fetch vehicles using logic consistent with VehiclesClient (My Vehicles page)
            const userStr = localStorage.getItem('fleetman-user');
            let vehicles: Vehicle[] = [];

            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.userId) {
                    // Filter by Admin/Manager ID (shows vehicles in managed fleets)
                    vehicles = await vehicleApi.getByAdminId(user.userId);
                } else if (user.organizationId) {
                    // Fallback to Org ID
                    vehicles = await vehicleApi.getByOrganization(user.organizationId);
                } else {
                    // Fallback to all (dev/superadmin)
                    vehicles = await vehicleApi.getAll();
                }
            } else {
                vehicles = await vehicleApi.getAll();
            }


            // Filter out vehicles already associated with THIS geofence
            const associatedVehicleIds = new Set(assocs.map(a => a.vehicleId));

            const available = vehicles.filter(v => !associatedVehicleIds.has(v.vehicleId));

            setAvailableVehicles(available);

        } catch (error) {
            // Error fetching vehicle geofence data
            toast.error(t('common.errorLoad'));
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!selectedVehicleId) return;
        setProcessing(true);
        try {
            const data: VehicleGeofenceCreate = {
                vehicleId: Number(selectedVehicleId),
                geofenceId: geofence.geofenceId,
                notes: notes
            };
            await vehicleGeofenceApi.create(data);
            toast.success(t('common.success'));
            setSelectedVehicleId('');
            setNotes('');
            fetchData(); // Refresh list
        } catch (error: any) {
            // Backend returns 409 if already assigned to THIS geofence
            if (error.response?.status === 409) {
                toast.error(t('geofences.vehicleAlreadyAssigned'));
                // Force refresh list as it seems out of sync
                fetchData();
            } else {
                const msg = error.response?.data?.message || t('common.errorCreate');
                toast.error(msg);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm(t('common.confirmDelete'))) return;
        // Or strictly we should use a proper UI confirmation, but standard confirm is ok for inside a modal for now or implement better UX if asked. 
        // User asked for "ergonomic IHM". Let's do a quick inline confirm or just delete since it's an association?
        // Let's just delete, user can re-add easily.

        try {
            await vehicleGeofenceApi.delete(id);
            toast.success(t('common.deleteSuccess'));
            fetchData();
        } catch (error) {
            toast.error(t('common.errorDelete'));
        }
    };

    const handleToggleActive = async (assoc: VehicleGeofence) => {
        try {
            if (assoc.assignmentState === 'ACTIVE') {
                await vehicleGeofenceApi.deactivate(assoc.vehicleGeofenceId);
            } else {
                await vehicleGeofenceApi.activate(assoc.vehicleGeofenceId);
            }
            fetchData(); // Refresh to show new state
        } catch (error) {
            // Error updating geofence assignment status
            toast.error(t('common.errorUpdate'));
        }
    }


    // Helper to format date safely (handles ISO string or [y, m, d, h, m, s, ns] array)
    const formatDate = (dateInput: string | number[] | undefined) => {
        if (!dateInput) return '-';
        try {
            if (Array.isArray(dateInput)) {
                // [2024, 1, 28, 10, 30, 0] -> Month is 1-based in Java array usually? check standard serialization
                // Or just construct simplified string
                if (dateInput.length >= 3) {
                    const date = new Date(
                        dateInput[0],
                        dateInput[1] - 1, // JS Month is 0-11
                        dateInput[2],
                        dateInput[3] || 0,
                        dateInput[4] || 0,
                        dateInput[5] || 0
                    );
                    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            }
            return new Date(dateInput as string).toLocaleDateString() + ' ' + new Date(dateInput as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            // Date parse error
            return 'Invalid Date';
        }
    };

    if (loading && associations.length === 0) {
        return createPortal(
            <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                <div className="bg-surface rounded-lg p-6">
                    <Loader2 className="animate-spin text-secondary" size={32} />
                </div>
            </div>,
            document.body
        )
    }

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-glass flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-text-main">
                            {t('geofences.manageVehicles')}
                        </h2>
                        <p className="text-sm text-text-muted">
                            {geofence.geofenceName}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-glass rounded-full text-text-muted">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Add New Association */}
                    <div className="bg-surface-card p-4 rounded-lg border border-glass space-y-4">
                        <h3 className="font-medium text-text-main flex items-center gap-2">
                            <Plus size={18} className="text-secondary" />
                            {t('geofences.addVehicle')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-sub mb-1">{t('common.vehicle')}</label>
                                <select
                                    className="w-full p-2 rounded bg-glass border border-glass text-text-main text-black dark:text-white"
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                                >
                                    <option value="">{t('common.select')}</option>
                                    {availableVehicles.map(v => (
                                        <option key={v.vehicleId} value={v.vehicleId}>
                                            {v.vehicleRegistrationNumber} - {v.vehicleMake} {v.vehicleModel}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-text-sub mb-1">{t('common.notes')}</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded bg-glass border border-glass text-text-main"
                                    placeholder={t('common.optional')}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="text-right">
                            <button
                                onClick={handleAdd}
                                disabled={!selectedVehicleId || processing}
                                className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 disabled:opacity-50 transition"
                            >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : t('common.add')}
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div>
                        <h3 className="font-medium text-text-main mb-3">
                            {t('geofences.associatedVehicles')} ({associations.length})
                        </h3>

                        {associations.length === 0 ? (
                            <p className="text-text-muted text-center py-8 bg-glass/20 rounded">
                                {t('geofences.noVehiclesAssociated')}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {associations.map(assoc => (
                                    <div key={assoc.vehicleGeofenceId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-glass rounded bg-surface-card gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-text-main">
                                                    {assoc.vehicleRegistration || assoc.vehicleName || `Vehicle #${assoc.vehicleId}`}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${assoc.assignmentState === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {assoc.assignmentState === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                            {assoc.notes && (
                                                <p className="text-sm text-text-muted mt-1 italic">
                                                    "{assoc.notes}"
                                                </p>
                                            )}
                                            <p className="text-xs text-text-sub mt-1">
                                                Assigned: {formatDate(assoc.assignedAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(assoc)}
                                                className={`text-xs px-3 py-1.5 rounded transition border ${assoc.assignmentState === 'ACTIVE' ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                            >
                                                {assoc.assignmentState === 'ACTIVE' ? t('common.deactivate') : t('common.activate')}
                                            </button>
                                            <button
                                                onClick={() => handleRemove(assoc.vehicleGeofenceId)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition"
                                                title={t('common.delete')}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-4 border-t border-glass flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 border border-glass rounded text-text-main hover:bg-glass">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );

}
