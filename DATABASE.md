# SmartRent — Database Documentation

> **Engine:** Microsoft SQL Server 2022  
> **Architecture:** Database-per-service (4 isolated databases)  
> **ORM:** Hibernate 6 via Spring Data JPA  
> **Schema management:** Auto-created on first boot via `schema.sql` + `spring.jpa.hibernate.ddl-auto=update`

---

## 1. `users_db` — User Service Database

**Port:** `1433` (exposed)  
**Container:** `users-db`  

### Table: `users`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `first_name` | `NVARCHAR(100)` | NOT NULL |
| `last_name` | `NVARCHAR(100)` | NOT NULL |
| `email` | `NVARCHAR(255)` | NOT NULL, **UNIQUE** |
| `password_hash` | `NVARCHAR(255)` | NOT NULL |
| `phone` | `NVARCHAR(20)` | NULL |
| `role` | `NVARCHAR(20)` | NOT NULL, CHECK: `TENANT`, `LANDLORD`, `ADMIN` |
| `status` | `NVARCHAR(20)` | NOT NULL, DEFAULT `ACTIVE`, CHECK: `PENDING`, `ACTIVE`, `INACTIVE` |
| `profile_picture_url` | `NVARCHAR(500)` | NULL |
| `created_at` | `DATETIME2` | NOT NULL, DEFAULT `GETDATE()` |
| `updated_at` | `DATETIME2` | NOT NULL, DEFAULT `GETDATE()` |

**Indexes:**
- `idx_users_email` → `email`
- `idx_users_role_status` → `(role, status)`

---

## 2. `properties_db` — Property Service Database

**Container:** `properties-db`

### Table: `properties`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `landlord_id` | `BIGINT` | NOT NULL *(references users.id cross-DB)* |
| `title` | `NVARCHAR(255)` | NOT NULL |
| `description` | `NVARCHAR(MAX)` | NULL |
| `address` | `NVARCHAR(500)` | NOT NULL |
| `city` | `NVARCHAR(100)` | NOT NULL |
| `district` | `NVARCHAR(100)` | NULL |
| `type` | `NVARCHAR(20)` | NOT NULL, CHECK: `APARTMENT`, `VILLA`, `STUDIO`, `OFFICE`, `ROOM` |
| `monthly_rent` | `DECIMAL(10,2)` | NOT NULL |
| `bedrooms` | `INT` | NOT NULL, DEFAULT `0` |
| `bathrooms` | `INT` | NOT NULL, DEFAULT `0` |
| `area_sqm` | `DECIMAL(8,2)` | NULL |
| `floor` | `INT` | NULL |
| `status` | `NVARCHAR(20)` | NOT NULL, DEFAULT `PENDING`, CHECK: `PENDING`, `APPROVED`, `REJECTED`, `INACTIVE` |
| `is_available` | `BIT` | NOT NULL, DEFAULT `1` |
| `main_image_url` | `NVARCHAR(500)` | NULL |
| `created_at` | `DATETIME2` | NOT NULL |
| `updated_at` | `DATETIME2` | NOT NULL |

**Indexes:**
- `idx_properties_landlord` → `landlord_id`
- `idx_properties_city_status` → `(city, status)`
- `idx_properties_type_rent` → `(type, monthly_rent)`

### Table: `property_images`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `property_id` | `BIGINT` | NOT NULL, **FK** → `properties(id)` ON DELETE CASCADE |
| `image_url` | `NVARCHAR(500)` | NOT NULL |
| `is_main` | `BIT` | NOT NULL, DEFAULT `0` |
| `display_order` | `INT` | NOT NULL, DEFAULT `0` |
| `uploaded_at` | `DATETIME2` | NOT NULL |

### Table: `property_amenities`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `property_id` | `BIGINT` | NOT NULL, **FK** → `properties(id)` ON DELETE CASCADE |
| `amenity` | `NVARCHAR(30)` | NOT NULL, CHECK: `PARKING`, `POOL`, `ELEVATOR`, `FURNISHED`, `GYM`, `SECURITY`, `BALCONY`, `GARDEN` |

**Constraints:** `UNIQUE(property_id, amenity)`

### Table: `reviews`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `property_id` | `BIGINT` | NOT NULL, **FK** → `properties(id)` ON DELETE CASCADE |
| `tenant_id` | `BIGINT` | NOT NULL *(cross-DB reference to users.id)* |
| `rating` | `TINYINT` | NOT NULL, CHECK: `1–5` |
| `comment` | `NVARCHAR(MAX)` | NULL |
| `created_at` | `DATETIME2` | NOT NULL |
| `updated_at` | `DATETIME2` | NOT NULL |

**Constraints:** `UNIQUE(property_id, tenant_id)` — one review per tenant per property  
**Indexes:** `idx_reviews_property` → `property_id`

### Table: `favorites`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `tenant_id` | `BIGINT` | NOT NULL |
| `property_id` | `BIGINT` | NOT NULL, **FK** → `properties(id)` ON DELETE CASCADE |
| `created_at` | `DATETIME2` | NOT NULL |

**Constraints:** `UNIQUE(tenant_id, property_id)`

---

## 3. `visits_db` — Visit Service Database

**Container:** `visits-db`

### Table: `visit_requests`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `tenant_id` | `BIGINT` | NOT NULL |
| `landlord_id` | `BIGINT` | NOT NULL |
| `property_id` | `BIGINT` | NOT NULL |
| `property_title` | `NVARCHAR(255)` | NOT NULL *(denormalized)* |
| `requested_date` | `DATE` | NOT NULL |
| `requested_time` | `TIME` | NOT NULL |
| `suggested_date` | `DATE` | NULL *(set on reschedule)* |
| `suggested_time` | `TIME` | NULL |
| `status` | `NVARCHAR(20)` | NOT NULL, DEFAULT `PENDING`, CHECK: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `RESCHEDULED` |
| `rejection_reason` | `NVARCHAR(500)` | NULL |
| `notes` | `NVARCHAR(MAX)` | NULL |
| `created_at` | `DATETIME2` | NOT NULL |
| `updated_at` | `DATETIME2` | NOT NULL |

**Indexes:**
- `idx_visits_tenant` → `tenant_id`
- `idx_visits_landlord` → `landlord_id`
- `idx_visits_property_date` → `(property_id, requested_date, requested_time)`

---

## 4. `rentals_db` — Rental Service Database

**Container:** `rentals-db`

### Table: `rental_applications`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `tenant_id` | `BIGINT` | NOT NULL |
| `landlord_id` | `BIGINT` | NOT NULL |
| `property_id` | `BIGINT` | NOT NULL |
| `property_title` | `NVARCHAR(255)` | NOT NULL *(denormalized)* |
| `monthly_rent_snapshot` | `DECIMAL(10,2)` | NOT NULL |
| `cover_letter` | `NVARCHAR(MAX)` | NULL |
| `employment_status` | `NVARCHAR(20)` | NOT NULL, CHECK: `EMPLOYED`, `SELF_EMPLOYED`, `STUDENT`, `RETIRED`, `OTHER` |
| `monthly_income` | `DECIMAL(10,2)` | NULL |
| `move_in_date` | `DATE` | NOT NULL |
| `status` | `NVARCHAR(20)` | NOT NULL, DEFAULT `PENDING`, CHECK: `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN` |
| `rejection_reason` | `NVARCHAR(1000)` | NULL |
| `reviewed_at` | `DATETIME2` | NULL |
| `created_at` | `DATETIME2` | NOT NULL |
| `updated_at` | `DATETIME2` | NOT NULL |

**Indexes:**
- `idx_rental_tenant` → `tenant_id`
- `idx_rental_landlord` → `landlord_id`
- `idx_rental_property_status` → `(property_id, status)`

### Table: `application_documents`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT IDENTITY(1,1)` | **PK** |
| `application_id` | `BIGINT` | NOT NULL, **FK** → `rental_applications(id)` ON DELETE CASCADE |
| `document_type` | `NVARCHAR(30)` | NOT NULL, CHECK: `PROOF_OF_INCOME`, `NATIONAL_ID`, `EMPLOYMENT_LETTER`, `OTHER` |
| `file_name` | `NVARCHAR(255)` | NOT NULL |
| `file_url` | `NVARCHAR(500)` | NOT NULL |
| `file_size_bytes` | `BIGINT` | NOT NULL |
| `uploaded_at` | `DATETIME2` | NOT NULL |

---

## ER Diagram (Cross-Service Relationships)

> ⚠️ Cross-database foreign keys are **logical only** — enforced at the application layer via OpenFeign, not at the SQL level.

```
┌─────────────────┐       ┌──────────────────────┐
│   users_db      │       │   properties_db      │
│                 │       │                      │
│  users ─────────┼──────►│  properties          │
│    id ◄─────────┼───────┤    landlord_id       │
│                 │       │                      │
│                 │       │  reviews             │
│    id ◄─────────┼───────┤    tenant_id         │
│                 │       │                      │
│                 │       │  favorites           │
│    id ◄─────────┼───────┤    tenant_id         │
└────────┬────────┘       └──────────┬───────────┘
         │                           │
         │                           │ property_id (logical)
         │                           ▼
┌────────┴────────┐       ┌──────────────────────┐
│   visits_db     │       │   rentals_db         │
│                 │       │                      │
│  visit_requests │       │  rental_applications │
│    tenant_id    │       │    tenant_id         │
│    landlord_id  │       │    landlord_id       │
│    property_id  │       │    property_id       │
└─────────────────┘       └──────────────────────┘
```

---

## Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `DB_HOST` | All 4 services | Database container hostname |
| `DB_PASSWORD` / `DB_ROOT_PASSWORD` | All 4 services + DBs | SQL Server SA password |
| `JWT_SECRET` | user-service, api-gateway | JWT signing key |
| `EUREKA_URI` | All services + gateway | Discovery server URL |
