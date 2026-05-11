$ErrorActionPreference = "Stop"

Write-Host "Checking SQL Server containers..." -ForegroundColor Cyan

# Define the docker-compose services and their respective databases
$databases = @{
    "users-db"      = "users_db"
    "properties-db" = "properties_db"
    "visits-db"     = "visits_db"
    "rentals-db"    = "rentals_db"
}

# The SA password from the .env file
$saPassword = "SmartRent@2024!"

foreach ($service in $databases.Keys) {
    $dbName = $databases[$service]
    
    # Get the container ID dynamically using docker-compose
    $containerId = docker-compose ps -q $service
    
    if ([string]::IsNullOrWhiteSpace($containerId)) {
        Write-Host "Service '$service' is not running. Please run 'docker-compose up -d' first." -ForegroundColor Yellow
        continue
    }

    Write-Host "Creating database '$dbName' in service '$service' (if it doesn't exist)..."
    
    # Execute SQLCMD inside the container to create the database
    $sqlCommand = "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$dbName') BEGIN CREATE DATABASE $dbName; END"
    
    try {
        docker exec -it $containerId /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$saPassword" -Q "$sqlCommand"
        Write-Host "✅ Database '$dbName' is ready!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create database '$dbName' in '$container'." -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host "Done!" -ForegroundColor Cyan
