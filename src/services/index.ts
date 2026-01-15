// API Services - Re-export all API services for centralized import

// Authentication
export { default as authApi } from './authApi';

// Core entities
export { default as vehicleApi } from './vehicleApi';
export { default as driverApi } from './driverApi';
export { default as fleetApi } from './fleetApi';
export { default as organizationApi } from './organizationApi';

// User management
export { default as adminApi } from './adminApi';
export { default as fleetManagerApi } from './fleetManagerApi';

// Tracking & Trips
export { default as tripApi } from './tripApi';
export { default as positionApi } from './positionApi';

// Incidents & Maintenance
export { default as incidentApi } from './incidentApi';
export { default as maintenanceApi } from './maintenanceApi';

// Fuel
export { default as fuelRechargeApi } from './fuelRechargeApi';

// Geofencing
export { default as geofenceApi, vehicleGeofenceApi } from './geofenceApi';

// Notifications
export { default as notificationApi } from './notificationApi';

// Statistics
export { default as driverStatisticsApi } from './driverStatisticsApi';

// Images
export { default as vehicleImageApi } from './vehicleImageApi';

// Aggregated API object for convenience
export const api = {
    auth: () => import('./authApi').then(m => m.default),
    vehicle: () => import('./vehicleApi').then(m => m.default),
    driver: () => import('./driverApi').then(m => m.default),
    fleet: () => import('./fleetApi').then(m => m.default),
    organization: () => import('./organizationApi').then(m => m.default),
    admin: () => import('./adminApi').then(m => m.default),
    fleetManager: () => import('./fleetManagerApi').then(m => m.default),
    trip: () => import('./tripApi').then(m => m.default),
    position: () => import('./positionApi').then(m => m.default),
    incident: () => import('./incidentApi').then(m => m.default),
    maintenance: () => import('./maintenanceApi').then(m => m.default),
    fuelRecharge: () => import('./fuelRechargeApi').then(m => m.default),
    geofence: () => import('./geofenceApi').then(m => m.default),
    notification: () => import('./notificationApi').then(m => m.default),
    driverStatistics: () => import('./driverStatisticsApi').then(m => m.default),
    vehicleImage: () => import('./vehicleImageApi').then(m => m.default),
};

export default api;
