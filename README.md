# SmartRent — Project Documentation

## Overview

SmartRent is a full-stack rental property management platform that enables **Tenants** to browse, visit, and apply for rental properties, **Landlords** to list and manage properties and applications, and **Admins** to oversee platform users and system health.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, Axios, React Router 7 |
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Cloud 2023.0.1 |
| **API Gateway** | Spring Cloud Gateway |
| **Service Discovery** | Eureka Server |
| **Database** | Microsoft SQL Server 2022 (database-per-service) |
| **ORM** | Spring Data JPA + Hibernate 6 |
| **Mapping** | MapStruct 1.5.5 + Lombok |
| **Auth** | JWT (issued by user-service, validated by gateway) |
| **Inter-service** | OpenFeign (HTTP) |
| **Containerization** | Docker + Docker Compose |

---

## Project Structure

```
SE2-SmartRend/
├── backend/                          # All Java microservices
│   ├── eureka-server/                # Service Discovery (port 8761)
│   ├── api-gateway/                  # API Gateway (port 8080)
│   ├── user-service/                 # Auth + User + Admin management
│   ├── property-service/             # Properties + Reviews + Favorites
│   ├── visit-service/                # Visit scheduling
│   └── rental-service/               # Rental applications + Documents
│
├── smartrent-frontend/               # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Navbar, Footer, Sidebar, etc.
│   │   │   ├── forms/                # PropertyFormModal
│   │   │   └── layouts/              # TenantLayout, LandlordLayout
│   │   ├── context/                  # AuthContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── admin/                # AdminDashboard
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── landlord/             # Dashboard, MyProperties, Visits, Rentals
│   │   │   └── tenant/               # Home, PropertyDetails, Favorites, etc.
│   │   ├── services/                 # API service layer (Axios)
│   │   ├── styles/                   # Global CSS
│   │   └── utils/                    # Constants
│   └── vite.config.js                # Dev server + proxy → gateway:8080
│
├── docker-compose.yml                # Full stack orchestration
├── .env                              # Environment variables
├── DATABASE.md                       # Database documentation
├── TEAMMATES.md                      # Task assignments
└── README.md                         # This file
```

---

## Architecture Diagram

```
                          ┌──────────────┐
                          │   Frontend   │
                          │  React :3000 │
                          └──────┬───────┘
                                 │  /api/*
                                 ▼
                          ┌──────────────┐
                          │ API Gateway  │
                          │    :8080     │
                          │  JWT Filter  │
                          └──────┬───────┘
                                 │
              ┌─────────────┬────┴─────┬──────────────┐
              ▼             ▼          ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
      │ user-service │ │ property │ │  visit   │ │  rental  │
      │   :8081      │ │ service  │ │ service  │ │ service  │
      │              │ │  :8082   │ │  :8083   │ │  :8084   │
      └──────┬───────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
             │              │            │             │
             ▼              ▼            ▼             ▼
        ┌─────────┐   ┌──────────┐ ┌─────────┐  ┌──────────┐
        │users_db │   │props_db  │ │visits_db│  │rentals_db│
        │ :1433   │   │  (int)   │ │  (int)  │  │  (int)   │
        └─────────┘   └──────────┘ └─────────┘  └──────────┘
              │
              └── All services register with Eureka Server :8761
```

---

## API Gateway Routing

All requests go through the gateway at `localhost:8080`.

| Route Pattern | Target Service |
|--------------|---------------|
| `/api/auth/**` | user-service |
| `/api/users/**` | user-service |
| `/api/admin/**` | user-service |
| `/api/properties/**` | property-service |
| `/api/reviews/**` | property-service |
| `/api/favorites/**` | property-service |
| `/api/visits/**` | visit-service |
| `/api/rentals/**` | rental-service |

**Public endpoints** (no JWT required):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/properties` (browsing)

---

## Running Locally

### With Docker (recommended)
```bash
# 1. Clone and navigate
cd SE2-SmartRend

# 2. Configure environment
cp .env.example .env    # Edit JWT_SECRET and DB_ROOT_PASSWORD

# 3. Start everything
docker-compose up --build

# Services will be available at:
# Frontend:  http://localhost:3000
# Gateway:   http://localhost:8080
# Eureka:    http://localhost:8761
```

### Without Docker (development)
```bash
# 1. Start SQL Server locally on port 1433
# 2. Create 4 databases: users_db, properties_db, visits_db, rentals_db

# 3. Start infrastructure
cd backend/eureka-server && mvn spring-boot:run
cd backend/api-gateway && mvn spring-boot:run

# 4. Start domain services (each in a separate terminal)
cd backend/user-service && mvn spring-boot:run
cd backend/property-service && mvn spring-boot:run
cd backend/visit-service && mvn spring-boot:run
cd backend/rental-service && mvn spring-boot:run

# 5. Start frontend
cd smartrent-frontend && npm install && npm run dev
```

---

## User Roles & Permissions

| Feature | Tenant | Landlord | Admin |
|---------|--------|----------|-------|
| Browse properties | ✅ | ✅ | ✅ |
| View property details | ✅ | ✅ | ✅ |
| Request visits | ✅ | ❌ | ❌ |
| Submit rental applications | ✅ | ❌ | ❌ |
| Write reviews | ✅ | ❌ | ❌ |
| Manage favorites | ✅ | ❌ | ❌ |
| Create properties | ❌ | ✅ | ❌ |
| Approve/reject visits | ❌ | ✅ | ❌ |
| Approve/reject rentals | ❌ | ✅ | ❌ |
| Manage all users | ❌ | ❌ | ✅ |
| View platform stats | ❌ | ❌ | ✅ |
| Approve/reject properties | ❌ | ❌ | ✅ |
