# FleetMan - Système de Gestion de Flotte

Application de gestion de flotte de véhicules avec suivi en temps réel, gestion des conducteurs et géofencing.

## 🏗️ Architecture

```
com.polytechnique.fleetman/
├── backend/          # API Spring Boot (Java 17+)
├── fleetman-frontend/ # Application Next.js (React 18+)
└── frontend/         # (Legacy - non utilisé)
```

## 📋 Prérequis

- **Node.js** 18+ et npm
- **Java** 17+
- **Docker** (pour PostgreSQL)
- **Maven** (inclus via wrapper)

## 🚀 Lancement du Projet

### 1. Base de données PostgreSQL

```bash
# Démarrer le conteneur PostgreSQL
docker run -d \
  --name fleetman-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=fleetmanBD \
  -p 5432:5432 \
  postgis/postgis:15-3.3
```

### 2. Backend (API Spring Boot)

```bash
cd backend

# Lancer le serveur (port 9080)
./mvnw spring-boot:run
```

L'API sera disponible sur `http://localhost:9080`

### 3. Frontend (Next.js)

```bash
cd fleetman-frontend

# Installer les dépendances
npm install

# Mode développement (port 3000)
npm run dev

# OU Mode production
npm run build && npm start
```

L'application sera disponible sur `http://localhost:3000`

## 👥 Rôles Utilisateurs

| Rôle | Description | Dashboard |
|------|-------------|-----------|
| `SUPER_ADMIN` | Administrateur système | `/dashboard/superadmin` |
| `ORGANIZATION_MANAGER` | Gestionnaire d'organisation | `/dashboard/manager` |
| `DRIVER` | Conducteur | `/dashboard/driver` |

## 📱 Fonctionnalités Principales

- **Gestion des véhicules** : CRUD, suivi position, historique trajets
- **Gestion des conducteurs** : Profil, permis, contact d'urgence
- **Gestion des flottes** : Organisation des véhicules par flotte
- **Géofencing** : Création de zones géographiques (cercles/polygones)
- **Incidents** : Signalement et suivi des incidents
- **Tableau de bord** : Statistiques en temps réel

## 🔧 Configuration

### Backend (`backend/src/main/resources/application.properties`)

```properties
server.port=9080
spring.datasource.url=jdbc:postgresql://localhost:5432/fleetmanBD
spring.datasource.username=admin
spring.datasource.password=admin
```

### Frontend (`fleetman-frontend/src/lib/axios.ts`)

```typescript
const API_BASE_URL = 'http://localhost:9080';
```

## 📁 Structure Frontend

```
fleetman-frontend/src/
├── app/
│   ├── dashboard/manager/   # Pages gestionnaire
│   │   ├── vehicles/        # Liste + détail véhicules
│   │   ├── drivers/         # Liste + détail conducteurs
│   │   ├── fleets/          # Gestion flottes
│   │   ├── geofences/       # Géofencing
│   │   └── incidents/       # Incidents
│   ├── login/               # Authentification
│   └── register/            # Inscription
├── components/
│   ├── dashboard/           # Composants dashboard
│   └── vehicle/             # Jauges véhicule
├── services/                # API clients
├── types/                   # TypeScript types
└── contexts/                # React contexts
```

## 🧪 Scripts Utiles

```bash
# Frontend
npm run dev          # Développement
npm run build        # Build production
npm run lint         # Vérification ESLint

# Backend
./mvnw spring-boot:run           # Lancer le serveur
./mvnw clean install -DskipTests # Build sans tests

# Base de données
docker exec -it fleetman-postgres psql -U admin -d fleetmanBD
```

## 🔐 Premier Démarrage

1. Lancez PostgreSQL, Backend, puis Frontend
2. Accédez à `http://localhost:3000/register`
3. Créez un compte (automatiquement `ORGANIZATION_MANAGER`)
4. Créez une organisation
5. Commencez à ajouter véhicules, conducteurs, etc.

## 📝 API Endpoints Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/login/admin` | Connexion admin |
| GET | `/vehicles` | Liste véhicules |
| GET | `/drivers` | Liste conducteurs |
| GET | `/organizations/{id}/geofences` | Geofences org |
| POST | `/geofences/circle/admin/{id}` | Créer geofence |

## 🐛 Dépannage

**CORS Error** : Vérifiez que le backend autorise `http://localhost:3000`

**DB Connection** : Vérifiez que PostgreSQL tourne et les credentials sont corrects

**Build Error Leaflet** : Le premier build peut être lent à cause de la bibliothèque de cartes

---

**Auteurs** : Équipe FleetMan - Polytechnique  
**Licence** : MIT
