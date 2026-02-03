
/**
 * Script de population de données pour FleetMan
 */

const API_URL = process.env.API_URL || 'http://localhost:9080/api';

// Configuration
const CONFIG = {
    adminEmail: 'superadmin@gmail.com',
    adminPassword: 'superadmin123',
    orgCount: 5,
    fleetsPerOrg: 1,
    vehiclesPerFleet: 4,
    incidentsPerVehicle: 2
};

const COLORS = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Grey'];
const MAKES = ['Toyota', 'Ford', 'Mercedes', 'Renault', 'Peugeot', 'BMW'];
const TYPES = ['CAR', 'TRUCK', 'VAN', 'MOTORCYCLE'];
const SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'];
const INCIDENT_TYPES = ['ACCIDENT', 'BREAKDOWN', 'THEFT', 'OTHER'];
const STATUSES = ['REPORTED', 'RESOLVED', 'CLOSED']; // Removed UNDER_INVESTIGATION as per request

// Helper pour fetch
async function request(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            const txt = await response.text();
            // Silent ignore 409
            if (response.status === 409) return null;
            throw new Error(`API Error ${response.status}: ${txt}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Request failed: ${method} ${endpoint}`, error.message);
        return null;
    }
}

async function main() {
    console.log(`🌱 Démarrage du seeding sur ${API_URL}...`);

    // 1. Login
    console.log('🔑 Authentification Super Admin...');
    let token = '';

    try {
        const loginRes = await request('/auth/admin/login', 'POST', {
            email: CONFIG.adminEmail,
            password: CONFIG.adminPassword
        });

        if (loginRes && loginRes.success) {
            token = loginRes.accessToken || 'no-token-needed';
            console.log('✅ Authentifié avec succès');
        } else {
            console.error('Réponse login:', loginRes);
            throw new Error("Login failed (success=false)");
        }
    } catch (e) {
        console.error("❌ Echec de connexion. Avez-vous relancé le backend pour appliquer la migration Liquibase ?");
        process.exit(1);
    }

    // 2. Création Organisations
    for (let i = 1; i <= CONFIG.orgCount; i++) {
        const suffix = Math.floor(Math.random() * 1000);
        const orgName = `Organisaton ${i} ${suffix}`;
        console.log(`\n🏢 Création: ${orgName}`);

        const org = await request('/organizations', 'POST', {
            organizationName: orgName,
            organizationAddress: `${i * 10} Rue de la Paix, Douala`,
            organizationCity: 'Douala',
            organizationCountry: 'Cameroun',
            organizationUIN: `UIN-ORG-${i}-${suffix}`,
            organizationType: 'SA',
            subscriptionPlan: i % 2 === 0 ? 'PROFESSIONAL' : 'BASIC',
            createdByAdminId: 1 // Requis par le backend
        }, token);

        if (!org) continue;
        console.log(`   ✅ ID: ${org.organizationId}`);

        // 3. Création Admin pour l'Org
        const admin = await request(`/admins/organization/${org.organizationId}`, 'POST', {
            adminFirstName: 'Manager',
            adminLastName: orgName,
            adminEmail: `manager${i}_${suffix}@test.com`,
            adminPassword: 'password123',
            adminRole: 'ORGANIZATION_MANAGER',
            isActive: true
        }, token);

        if (!admin) continue;
        console.log(`   👤 Admin créé: ${admin.adminEmail}`);

        // 4. Création Fleet Manager
        const fm = await request(`/fleet-managers/admin/${admin.adminId}`, 'POST', {
            managerFirstName: 'Fleet',
            managerLastName: `Manager ${i}`,
            managerEmail: `fm${i}_${suffix}@test.com`,
            managerPassword: 'password123',
            isActive: true
        }, token);

        if (!fm) continue;
        console.log(`   📋 Fleet Manager créé: ${fm.managerEmail}`);

        // 5. Création Flotte
        const fleet = await request(`/fleets/fleet-manager/${fm.managerId}`, 'POST', {
            fleetName: `Flotte Principale ${orgName}`,
            fleetDescription: 'Flotte de test générée par script',
            fleetType: 'MIXED'
        }, token);

        if (!fleet) continue;
        console.log(`   🚚 Flotte créée: ${fleet.fleetName}`);

        // 6. Création Véhicules
        for (let v = 1; v <= CONFIG.vehiclesPerFleet; v++) {
            const reg = `LT-${Math.floor(Math.random() * 9000) + 1000}-ZZ`;
            const vehicle = await request('/vehicles', 'POST', {
                vehicleRegistrationNumber: reg,
                vehicleMake: MAKES[Math.floor(Math.random() * MAKES.length)],
                vehicleModel: '2024 Model',
                vehicleType: TYPES[Math.floor(Math.random() * TYPES.length)],
                fuelType: 'DIESEL',
                fleetId: fleet.fleetId,
                state: 'IN_TRANSIT'
            }, token);

            if (vehicle) {
                console.log(`      🚗 Véhicule: ${reg}`);

                // 7. Incidents
                const count = Math.floor(Math.random() * CONFIG.incidentsPerVehicle) + 1;
                for (let inc = 0; inc < count; inc++) {
                    await request('/incidents', 'POST', {
                        incidentTitle: `Incident ${inc + 1}`,
                        incidentDescription: 'Auto-généré',
                        incidentType: INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)],
                        incidentSeverity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
                        incidentDate: new Date().toISOString(),
                        vehicleId: vehicle.vehicleId,
                        reportedById: admin.adminId
                    }, token);
                }
            }
        }
    }

    console.log('\n✨ Seeding terminé avec succès !');
}

main().catch(console.error);
