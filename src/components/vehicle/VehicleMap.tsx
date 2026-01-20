'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Position, Vehicle } from '@/types';

// Fix for default marker icon in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface VehicleMapProps {
    position: Position;
    vehicle: Vehicle;
}

const VehicleMap: React.FC<VehicleMapProps> = ({ position, vehicle }) => {
    // Custom icon for the vehicle
    const vehicleIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Car icon
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });

    return (
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
                icon={vehicleIcon}
            >
                <Popup>
                    <strong>{vehicle.vehicleRegistrationNumber}</strong>
                    <br />
                    {vehicle.vehicleMake} {vehicle.vehicleModel}
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default VehicleMap;
