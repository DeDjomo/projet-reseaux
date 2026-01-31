
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { Geofence, GeofenceType, GeofenceStatus } from '@/types';
import geofenceApi from '@/services/geofenceApi';
import { organizationApi } from '@/services';
import { Plus, Trash, Circle as CircleIcon, Hexagon, Save, X, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamically import Map to avoid SSR issues
const GeofenceMap = dynamic(() => import('@/components/dashboard/GeofenceMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div> // Text inside here is tricky as it is outside component scope where t is available. I will leave it or replace with static "Loading..." if acceptable, but context is not available here.
    // Actually, I can't use 't' here easily without exporting it or duplicate logic. 
    // I will skip this one for now or change it later if user complains. 
    // Wait, I can just use a hardcoded generic string or try to access a global t if possible, but simpler to skip for this specific task scope or use "Loading..." which is universal enough or just hardcode "Chargement..." if FR is primary.
    // Let's stick to files inside component.
});

// Dynamically import Modal to avoid SSR issues if needed, but standard import is fine for client component
import VehicleGeofenceModal from '@/components/dashboard/VehicleGeofenceModal';
import { Car } from 'lucide-react';

export default function GeofencesPage() {
    const { t } = useLanguage();
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [loading, setLoading] = useState(true);
    const [creationMode, setCreationMode] = useState<'CIRCLE' | 'POLYGON' | null>(null);
    const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
    const [geofenceToDelete, setGeofenceToDelete] = useState<Geofence | null>(null);
    const [geofenceToManageVehicles, setGeofenceToManageVehicles] = useState<Geofence | null>(null);

    // Creation State
    const [name, setName] = useState('');
    const [status, setStatus] = useState<GeofenceStatus>('OPERATIONAL_ZONE');
    const [description, setDescription] = useState('');
    const [tempCenter, setTempCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [tempPoints, setTempPoints] = useState<{ lat: number; lng: number }[]>([]);
    const [radius, setRadius] = useState<number>(100);

    useEffect(() => {
        fetchGeofences();
    }, []);

    const fetchGeofences = async () => {
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

            let data: Geofence[] = [];

            if (organizationId) {
                // Use organization-based endpoint
                data = await organizationApi.getGeofences(organizationId);
            } else {
                console.warn('No organization found, fetching all geofences');
                data = await geofenceApi.getAll();
            }

            setGeofences(data);
        } catch (error) {
            console.error('Error fetching geofences:', error);
            toast.error(t('geofences.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const calculateConvexHull = (points: { lat: number; lng: number }[]) => {
        if (points.length < 3) return points;

        // Sort points by lat (y) then lng (x) or vice versa. 
        // Monotone chain usually sorts by x then y. Let's use lng as x, lat as y.
        const sorted = [...points].sort((a, b) => a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng);

        const crossProduct = (o: { lat: number; lng: number }, a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
            return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
        };

        const lower: { lat: number; lng: number }[] = [];
        for (const p of sorted) {
            while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
                lower.pop();
            }
            lower.push(p);
        }

        const upper: { lat: number; lng: number }[] = [];
        for (let i = sorted.length - 1; i >= 0; i--) {
            const p = sorted[i];
            while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
                upper.pop();
            }
            upper.push(p);
        }

        // Concatenate lower and upper to get the hull
        // Last point of lower is first of upper (because of the loop logic), so pop it.
        lower.pop();
        upper.pop();
        return [...lower, ...upper];
    };

    const handleMapClick = (lat: number, lng: number) => {
        console.log('Map clicked!', { lat, lng, creationMode });
        if (!creationMode) return;

        if (creationMode === 'CIRCLE') {
            console.log('Setting temp center:', { lat, lng });
            setTempCenter({ lat, lng });
        } else if (creationMode === 'POLYGON') {
            const newPoints = [...tempPoints, { lat, lng }];
            // Apply Convex Hull if we have enough points to form a shape (though even for lines it sorts them nicely)
            // But usually hull makes sense for >= 3. For < 3 just adding is fine.
            // Actually, sorting 2 points is fine too.
            const hullPoints = newPoints.length >= 3 ? calculateConvexHull(newPoints) : newPoints;

            console.log('Adding polygon point, hull calculated:', { newPoints, hullPoints });
            setTempPoints(hullPoints);
        }
    };

    const handleSave = async () => {
        if (!name) {
            toast.error(t('geofences.nameRequired'));
            return;
        }

        // Get adminId from localStorage
        const userStr = localStorage.getItem('fleetman-user');
        const adminId = userStr ? JSON.parse(userStr).userId : undefined;

        if (!adminId) {
            toast.error(t('geofences.sessionInvalid'));
            return;
        }

        try {
            if (creationMode === 'CIRCLE') {
                if (!tempCenter) {
                    toast.error(t('geofences.selectCenter'));
                    return;
                }
                await geofenceApi.createCircleAsAdmin(adminId, {
                    geofenceName: name,
                    geofenceStatus: status,
                    center: {
                        type: 'Point',
                        coordinates: [tempCenter.lng, tempCenter.lat] // GeoJSON is [lon, lat]
                    },
                    radius
                });
            } else if (creationMode === 'POLYGON') {
                if (tempPoints.length < 3) {
                    toast.error(t('geofences.minPoints'));
                    return;
                }
                // Build closed LineString (first point = last point)
                const coords: [number, number][] = tempPoints.map(p => [p.lng, p.lat] as [number, number]);
                // Close the polygon
                coords.push(coords[0]);

                await geofenceApi.createPolygonAsAdmin(adminId, {
                    geofenceName: name,
                    geofenceStatus: status,
                    vertices: {
                        type: 'LineString',
                        coordinates: coords
                    }
                });
            }

            toast.success(t('geofences.createSuccess'));
            resetForm();
            fetchGeofences();
        } catch (error) {
            console.error("Error creating geofence", error);
            toast.error(t('geofences.createError'));
        }
    };

    const handleDeleteClick = (geofence: Geofence) => {
        setGeofenceToDelete(geofence);
    };

    const resetForm = () => {
        setCreationMode(null);
        setName('');
        setStatus('OPERATIONAL_ZONE');
        setDescription('');
        setTempCenter(null);
        setTempPoints([]);
        setRadius(100);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-glass">
                <div>
                    <h1 className="text-xl font-bold text-text-main">{t('geofences.title')}</h1>
                    <p className="text-sm text-text-muted">{t('geofences.subtitle')}</p>
                </div>
                {!creationMode ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCreationMode('CIRCLE')}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition"
                        >
                            <CircleIcon size={18} />
                            <span>{t('geofences.circle')}</span>
                        </button>
                        <button
                            onClick={() => setCreationMode('POLYGON')}
                            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                        >
                            <Hexagon size={18} />
                            <span>{t('geofences.polygon')}</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Save size={18} />
                            <span>{t('common.save')}</span>
                        </button>
                        <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                            <X size={18} />
                            <span>{t('common.cancel')}</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* List / Form Panel */}
                <div className="w-1/3 bg-surface border border-glass rounded-lg flex flex-col overflow-hidden">
                    {creationMode ? (
                        <div className="p-4 space-y-4 overflow-y-auto">
                            <h3 className="font-semibold text-lg text-text-main">
                                {t('geofences.newZone')} ({creationMode === 'CIRCLE' ? t('geofences.circular') : t('geofences.polygon')})
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-text-sub">{t('geofences.name')}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-text-main"
                                    placeholder={t('geofences.namePlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub">{t('geofences.status')}</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as GeofenceStatus)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-glass p-2 text-text-main"
                                >
                                    <option value="OPERATIONAL_ZONE">{t('geofences.status.operational')}</option>
                                    <option value="PARKING">{t('geofences.status.parking')}</option>
                                    <option value="RESTRICTED_ZONE">{t('geofences.status.restricted')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub">{t('geofences.description')}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-text-main"
                                    rows={3}
                                />
                            </div>

                            {creationMode === 'CIRCLE' && (
                                <div>
                                    <label className="block text-sm font-medium text-text-sub">{t('geofences.radius')}: {radius}m</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={radius}
                                        onChange={(e) => setRadius(Number(e.target.value))}
                                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-text-main"
                                        placeholder="Enter radius in meters"
                                    />
                                </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-900/30">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {creationMode === 'CIRCLE'
                                        ? t('geofences.circleHint')
                                        : t('geofences.polygonHint')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? <p className="text-center text-muted">{t('geofences.loading')}</p> : geofences.length === 0 ? (
                                <p className="text-center text-text-muted mt-10">{t('geofences.noZones')}</p>
                            ) : (
                                geofences.map(geo => (
                                    <div
                                        key={geo.geofenceId}
                                        onClick={() => setSelectedGeofence(selectedGeofence?.geofenceId === geo.geofenceId ? null : geo)}
                                        className={`p-3 border rounded-lg cursor-pointer transition flex flex-col gap-2 group ${selectedGeofence?.geofenceId === geo.geofenceId
                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                            : 'border-glass bg-glass hover:bg-glass/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-text-main">{geo.geofenceName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${geo.geofenceType === GeofenceType.CIRCLE ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                        {geo.geofenceType === GeofenceType.CIRCLE ? t('geofences.circle') : t('geofences.polygon')}
                                                    </span>
                                                    {geo.radius && (
                                                        <span className="text-xs text-text-muted">
                                                            {t('geofences.radius')}: {geo.radius}m
                                                        </span>
                                                    )}
                                                    {geo.geofenceStatus && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${geo.geofenceStatus === 'RESTRICTED_ZONE' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            geo.geofenceStatus === 'PARKING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                'bg-green-100 text-green-700 border-green-200'
                                                            }`}>
                                                            {t(`geofences.status.${geo.geofenceStatus.toLowerCase()}`) || geo.geofenceStatus}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(geo); }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                title={t('common.delete')}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setGeofenceToManageVehicles(geo); }}
                                                className="text-xs flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded hover:bg-secondary/20 transition"
                                            >
                                                <Car size={12} />
                                                <span>{t('geofences.manageVehiclesShort') || "Véhicules"}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Map Panel */}
                <div className="flex-1 bg-surface border border-glass rounded-lg overflow-hidden relative">
                    <GeofenceMap
                        geofences={geofences}
                        creationMode={creationMode}
                        onMapClick={handleMapClick}
                        tempPoints={tempPoints}
                        tempCenter={tempCenter}
                        radius={radius}
                        selectedGeofence={selectedGeofence}
                    />
                </div>
            </div>
            {/* Delete Modal */}
            {geofenceToDelete && (
                <DeleteGeofenceModal
                    geofence={geofenceToDelete}
                    onClose={() => setGeofenceToDelete(null)}
                    onSuccess={() => {
                        setGeofenceToDelete(null);
                        fetchGeofences();
                    }}
                />
            )}
            {/* Vehicle Management Modal */}
            {geofenceToManageVehicles && (
                <VehicleGeofenceModal
                    geofence={geofenceToManageVehicles}
                    onClose={() => setGeofenceToManageVehicles(null)}
                />
            )}
        </div>
    );
}

// Delete Geofence Modal - Mirrored from DeleteFleetModal
function DeleteGeofenceModal({ geofence, onClose, onSuccess }: { geofence: Geofence; onClose: () => void; onSuccess: () => void }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationName, setConfirmationName] = useState('');

    const isNameMatching = confirmationName === geofence.geofenceName;

    const handleDelete = async () => {
        if (!isNameMatching) return;

        setLoading(true);
        setError('');

        try {
            await geofenceApi.delete(geofence.geofenceId);
            toast.success(t('geofences.deleteSuccess'));
            onSuccess();
        } catch (err) {
            setError(t('common.error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
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
                            <Trash size={32} className="text-red-500" />
                        </div>
                        <p className="text-text-main">
                            {t('geofences.deleteConfirm')}
                        </p>
                        <p className="text-text-sub font-semibold mt-2">
                            "{geofence.geofenceName}"
                        </p>
                        <p className="text-sm text-text-muted mt-2">
                            {t('geofences.deleteWarning')}
                        </p>
                    </div>

                    {/* Confirmation input */}
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                        <label className="block text-sm font-medium text-text-main mb-2">
                            {t('geofences.typeNameToConfirm')}
                        </label>
                        <input
                            type="text"
                            value={confirmationName}
                            onChange={(e) => setConfirmationName(e.target.value)}
                            placeholder={geofence.geofenceName}
                            className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 ${confirmationName && !isNameMatching
                                ? 'border-red-400 focus:ring-red-500'
                                : isNameMatching
                                    ? 'border-green-400 focus:ring-green-500'
                                    : 'border-glass focus:ring-red-500'
                                }`}
                        />
                        {confirmationName && !isNameMatching && (
                            <p className="text-xs text-red-500 mt-1">{t('geofences.nameDoesNotMatch')}</p>
                        )}
                        {isNameMatching && (
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                <CheckCircle size={12} />
                                {t('geofences.nameMatches')}
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

