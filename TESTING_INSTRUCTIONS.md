# How to Run and Test SmartRent locally

I have configured the project specifically for your machine to bypass the network issues you were experiencing when downloading large Docker images (like Microsoft SQL Server). 

Here is what was already set up for you:
1. **Databases Created**: Created `users_db`, `properties_db`, `visits_db`, and `rentals_db` directly on your local Windows SQL Server (`MSSQLSERVER`).
2. **SQL Login Enabled**: Enabled the `sa` account on your local SQL Server with the password `StrongPassw0rd!`.
3. **Environment Setup**: Created the `.env` file with the necessary secrets.
4. **Docker Configurations Fixed**: Added the missing `Dockerfile` for the frontend, fixed the backend Dockerfiles to use standard Maven (since `mvnw` was missing), and configured `docker-compose.yml` to connect to your local Windows SQL Server instead of trying to download the heavy SQL Server Docker image.

---

### Step 1: Start the Project using Docker Compose

Since the setup is complete, you just need to run the Docker Compose command to build and start the Spring Boot microservices and the React frontend.

1. Open a terminal (PowerShell or Command Prompt) in the project root directory:
   `d:\Downloads\3rd Year College\Projects\SE2-SmartRent`
2. Run the following command:
   ```bash
   docker-compose up -d --build
   ```
3. Wait for the command to finish. It will build the Java services and the React frontend, then start them in the background.

*(Note: Depending on your system resources, the first build might take a few minutes as it compiles all 6 Java microservices and the React application).*

### Step 2: Verify the Services are Running

You can check the status of all your containers by opening the **Docker Desktop** application and looking at the `se2-smartrent` environment. All 7 containers should have a "Running" status.

Alternatively, run this in your terminal:
```bash
docker-compose ps
```

### Step 3: Accessing the Application

Once everything is up and running, you can access the different parts of the system using your web browser:

- **Frontend (Tenant/Landlord UI)**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **Eureka Service Discovery Registry**: [http://localhost:8761](http://localhost:8761)

### Step 4: Testing the Flow

1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. **Register a new user**: Go to the login page and click "Register". Create a test Tenant or Landlord account.
3. **Login**: Use the credentials you just created.
4. **Explore**: Depending on the role you chose, try creating a property listing, browsing properties, or adding favorites.

### Step 5: Stopping the Project

When you are done testing, you can stop all services to free up your system's memory:

```bash
docker-compose down
```
