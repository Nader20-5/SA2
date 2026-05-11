# SmartRent — Team Task Assignments

This document outlines the remaining work and assignments for the team to complete the SmartRent application. The frontend has been successfully aligned with the backend microservices architecture, and the database schema is fully defined. 

The primary remaining work involves **completing the backend business logic** (the marked `// TODO: implement` sections in the Java controllers and services).

---

## 1. User Service & Auth Module
**Assigned to:** [Teammate 1 Name]  
**Focus:** Authentication, JWT generation, and User/Admin management.

### Tasks:
- **`AuthService.java`**: 
  - Implement `register()` to create a new user in `users_db` and hash passwords.
  - Implement `login()` to verify credentials and generate JWT tokens.
- **`UserService.java`**:
  - Implement profile retrieval (`getOwnProfile`) and update (`updateOwnProfile`).
  - Implement `getUserInternal()` for cross-service calls (e.g., property-service fetching landlord details).
- **`AdminService.java`**:
  - Implement `getAllUsers()` with pagination and filtering by Role/Status.
  - Implement `updateUserStatus()` (Activate/Suspend).
  - Implement `getPlatformStats()` to aggregate total users, active properties (via Feign Client), etc.
- **Testing:** Verify JWT tokens are correctly validated by the `api-gateway`.

---

## 2. Property Service & Reviews
**Assigned to:** [Teammate 2 Name]  
**Focus:** Core property listings, search, favorites, and reviews.

### Tasks:
- **`PropertyService.java`**:
  - Implement `searchProperties()` with dynamic filtering (city, type, price, etc.) using Spring Data JPA Specifications.
  - Implement `createProperty()`, `updateProperty()`, and `deleteProperty()`.
  - Implement image uploading (`uploadImages()`) to save files to the `uploads/` directory and save URLs in `property_images`.
  - Implement `updatePropertyStatus()` for Admin approvals.
- **`ReviewService.java`**:
  - Implement CRUD operations for reviews. Ensure one review per tenant per property.
- **`FavoriteService.java`**:
  - Implement adding/removing properties to/from a tenant's favorites list.
- **Integration:** Use OpenFeign to fetch landlord names from `user-service` when returning property DTOs.

---

## 3. Visit Service & Notifications
**Assigned to:** [Teammate 3 Name]  
**Focus:** Scheduling and managing property visits between tenants and landlords.

### Tasks:
- **`VisitService.java`**:
  - Implement `createVisit()` to request a visit. Validate that the property exists via OpenFeign call to `property-service`.
  - Implement `getTenantVisits()` and `getLandlordVisits()`.
  - Implement state machine transitions: `approveVisit()`, `rejectVisit()`, and `rescheduleVisit()`.
  - Ensure status constraints are respected (e.g., cannot approve a cancelled visit).
- **Validation:** Prevent overlapping visits for the same property at the same time.

---

## 4. Rental Service & Document Uploads
**Assigned to:** [Teammate 4 Name]  
**Focus:** Handling rental applications and secure document storage.

### Tasks:
- **`RentalService.java`**:
  - Implement `createApplication()`. Snapshot the `monthly_rent` from the property at the time of application (via OpenFeign).
  - Implement document uploads (`uploadDocuments()`) for proof of income, national ID, etc.
  - Implement `getTenantApplications()` and `getLandlordApplications()`.
  - Implement `approveApplication()` and `rejectApplication()`.
- **Validation:** Ensure a tenant cannot apply for the same property twice if an application is already pending or approved.

---

## 5. Frontend Integration & QA
**Assigned to:** [Shared / Team Lead]  
**Focus:** End-to-end testing and bug fixing.

### Tasks:
- **Verify API Mappings:** Run the React app (`npm run dev`) and test all flows against the local Docker backend.
- **Error Handling:** Ensure the frontend gracefully handles 400/403/404/500 errors returned by the Spring Boot microservices.
- **File Uploads:** Test multipart file uploads for property images and rental application documents.
- **State Management:** Ensure React Context correctly maintains the authentication state and theme across page reloads.

---

## Development Workflow

1. Start your local environment using `docker-compose up --build`.
2. Find your assigned endpoints in the respective controllers (look for `// TODO: implement`).
3. Write the business logic in the `Service` classes.
4. Interact with the database using the `Repository` interfaces.
5. Use the provided `Mapper` interfaces (MapStruct) to convert between Entities and DTOs.
6. Test your endpoints using Postman or directly via the React frontend.
