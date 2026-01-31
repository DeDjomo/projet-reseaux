'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Position, Vehicle } from '@/types';
import { Truck, Car, Bus } from 'lucide-react';

// Fix leafleat icons
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

interface FleetMapProps {
    vehicles: Vehicle[];
    positions: Record<number, Position>; // vehicleId -> Position
}

// Component to fit map bounds to markers
function MapBounds({ positions }: { positions: Position[] }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions.map(p => [p.latitude, p.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [positions, map]);

    return null;
}

const FleetMap: React.FC<FleetMapProps> = ({ vehicles, positions }) => {
    // Filter vehicles that have a position
    const activeVehicles = vehicles.filter(v => positions[v.vehicleId]);
    const activePositions = activeVehicles.map(v => positions[v.vehicleId]);

    // Default center (e.g., Paris or user's org location)
    const defaultCenter: [number, number] = [48.7112, 2.2137]; // Polytechnique coordinates

    return (
        <MapContainer
            center={activePositions.length > 0 ? [activePositions[0].latitude, activePositions[0].longitude] : defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />

            {activeVehicles.map(vehicle => {
                const pos = positions[vehicle.vehicleId];
                return (
                    <Marker
                        key={vehicle.vehicleId}
                        position={[pos.latitude, pos.longitude]}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-sm mb-1">{vehicle.vehicleRegistrationNumber}</h3>
                                <p className="text-xs text-gray-600 mb-1">{vehicle.vehicleMake} {vehicle.vehicleModel}</p>
                                {new Date(pos.positionDateTime).toLocaleString()}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            <MapBounds positions={activePositions} />
        </MapContainer>
    );
};

export default FleetMap;
