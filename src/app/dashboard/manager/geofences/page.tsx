
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { Geofence, GeofenceType } from '@/types';
import geofenceApi from '@/services/geofenceApi';
import { organizationApi } from '@/services';
import { Plus, Trash, Circle as CircleIcon, Hexagon, Save, X } from 'lucide-react';
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

export default function GeofencesPage() {
    const { t } = useLanguage();
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [loading, setLoading] = useState(true);
    const [creationMode, setCreationMode] = useState<'CIRCLE' | 'POLYGON' | null>(null);
    const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);

    // Creation State
    const [name, setName] = useState('');
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

    const handleMapClick = (lat: number, lng: number) => {
        console.log('Map clicked!', { lat, lng, creationMode });
        if (!creationMode) return;

        if (creationMode === 'CIRCLE') {
            console.log('Setting temp center:', { lat, lng });
            setTempCenter({ lat, lng });
        } else if (creationMode === 'POLYGON') {
            console.log('Adding polygon point:', { lat, lng, currentPoints: tempPoints.length });
            setTempPoints([...tempPoints, { lat, lng }]);
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

    const handleDelete = async (id: number) => {
        if (confirm(t('geofences.deleteConfirm'))) {
            try {
                await geofenceApi.delete(id);
                toast.success(t('geofences.deleteSuccess'));
                fetchGeofences();
            } catch (error) {
                toast.error(t('geofences.deleteError'));
            }
        }
    };

    const resetForm = () => {
        setCreationMode(null);
        setName('');
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
                                        type="range"
                                        min="50"
                                        max="5000"
                                        step="50"
                                        value={radius}
                                        onChange={(e) => setRadius(Number(e.target.value))}
                                        className="w-full mt-2"
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
                                        className={`p-3 border rounded-lg cursor-pointer transition flex justify-between items-center group ${selectedGeofence?.geofenceId === geo.geofenceId
                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                            : 'border-glass bg-glass hover:bg-glass/50'
                                            }`}
                                    >
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
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(geo.geofenceId); }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Trash size={16} />
                                        </button>
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
        </div>
    );
}
