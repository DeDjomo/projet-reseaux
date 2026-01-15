
"use client";

import React, { useEffect, useState, useRef, useId } from 'react';
import { Geofence, GeofenceType } from '@/types';

interface GeofenceMapProps {
    geofences: Geofence[];
    creationMode: 'CIRCLE' | 'POLYGON' | null;
    onMapClick: (lat: number, lng: number) => void;
    tempPoints: { lat: number; lng: number }[];
    tempCenter: { lat: number; lng: number } | null;
    radius: number;
    selectedGeofence?: Geofence | null;
}

export default function GeofenceMap({
    geofences,
    creationMode,
    onMapClick,
    tempPoints,
    tempCenter,
    radius,
    selectedGeofence
}: GeofenceMapProps) {
    const mapRef = useRef<any>(null);
    const leafletRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);
    const onMapClickRef = useRef(onMapClick); // Store callback in ref
    const [isReady, setIsReady] = useState(false);
    const uniqueId = useId();
    const mapContainerId = `map-${uniqueId.replace(/:/g, '')}`;

    const defaultCenter: [number, number] = [4.0511, 9.7679]; // Douala, Cameroon

    // Keep callback ref updated
    useEffect(() => {
        onMapClickRef.current = onMapClick;
    }, [onMapClick]);

    // Initialize map only once
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let isMounted = true;

        const initMap = async () => {
            const L = (await import('leaflet')).default;
            await import('leaflet/dist/leaflet.css');

            if (!isMounted) return;

            leafletRef.current = L;

            // Fix Leaflet default icon issue
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            const container = document.getElementById(mapContainerId);
            if (!container || !isMounted) return;

            // Clear any existing map
            if ((container as any)._leaflet_id) {
                if (mapRef.current) {
                    mapRef.current.remove();
                }
                delete (container as any)._leaflet_id;
            }

            const map = L.map(mapContainerId).setView(defaultCenter, 13);
            mapRef.current = map;

            markersLayerRef.current = L.layerGroup().addTo(map);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Use ref for callback so it doesn't cause re-init
            map.on('click', (e: any) => {
                onMapClickRef.current(e.latlng.lat, e.latlng.lng);
            });

            setIsReady(true);
        };

        initMap();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapContainerId]); // ONLY depend on container ID

    // Update markers when props change
    useEffect(() => {
        if (!isReady || !leafletRef.current || !markersLayerRef.current) {
            return;
        }

        const L = leafletRef.current;
        const markersLayer = markersLayerRef.current;

        // Clear existing markers
        markersLayer.clearLayers();

        // Add circle
        if (creationMode === 'CIRCLE' && tempCenter) {
            L.marker([tempCenter.lat, tempCenter.lng]).addTo(markersLayer);
            L.circle([tempCenter.lat, tempCenter.lng], {
                radius,
                color: 'blue',
                fillOpacity: 0.2
            }).addTo(markersLayer);
        }

        // Add polygon points
        if (creationMode === 'POLYGON' && tempPoints.length > 0) {
            tempPoints.forEach((pt, index) => {
                const marker = L.marker([pt.lat, pt.lng]).addTo(markersLayer);
                marker.bindTooltip(`${index + 1}`, {
                    permanent: true,
                    direction: 'top',
                    className: 'bg-green-500 text-white px-1 rounded text-xs'
                });
            });
            if (tempPoints.length >= 2) {
                L.polygon(
                    tempPoints.map(p => [p.lat, p.lng]),
                    { color: 'green', fillOpacity: 0.2 }
                ).addTo(markersLayer);
            }
        }

        // Draw selected geofence with highlight
        if (selectedGeofence && !creationMode) {
            if (selectedGeofence.geofenceType === GeofenceType.CIRCLE && selectedGeofence.center) {
                const coords = selectedGeofence.center.coordinates; // [lng, lat]
                const center: [number, number] = [coords[1], coords[0]];

                // Add highlighted circle
                L.circle(center, {
                    radius: selectedGeofence.radius || 100,
                    color: '#f97316', // Orange highlight
                    weight: 3,
                    fillOpacity: 0.3,
                    fillColor: '#f97316'
                }).addTo(markersLayer);

                // Add center marker
                L.marker(center).addTo(markersLayer)
                    .bindPopup(selectedGeofence.geofenceName);

                // Zoom to the circle
                mapRef.current?.setView(center, 15);
            } else if (selectedGeofence.geofenceType === GeofenceType.POLYGON && selectedGeofence.vertices) {
                const coords = selectedGeofence.vertices.coordinates; // [[lng, lat], ...]
                const latLngs = coords.map((c: number[]) => [c[1], c[0]] as [number, number]);

                // Add highlighted polygon
                const polygon = L.polygon(latLngs, {
                    color: '#f97316',
                    weight: 3,
                    fillOpacity: 0.3,
                    fillColor: '#f97316'
                }).addTo(markersLayer);

                // Zoom to fit the polygon
                mapRef.current?.fitBounds(polygon.getBounds(), { padding: [50, 50] });
            }
        }
    }, [isReady, creationMode, tempCenter, tempPoints, radius, selectedGeofence]);

    return (
        <div
            id={mapContainerId}
            className="h-full w-full"
            style={{ minHeight: '400px' }}
        >
            {!isReady && (
                <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
                    <span className="text-gray-500">Chargement de la carte...</span>
                </div>
            )}
        </div>
    );
}
