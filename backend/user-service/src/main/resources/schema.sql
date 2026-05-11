IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        first_name      NVARCHAR(100) NOT NULL,
        last_name       NVARCHAR(100) NOT NULL,
        email           NVARCHAR(255) NOT NULL,
        password_hash   NVARCHAR(255) NOT NULL,
        phone           NVARCHAR(20)  NULL,
        role            NVARCHAR(20)  NOT NULL CHECK (role IN ('TENANT','LANDLORD','ADMIN')),
        status          NVARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING','ACTIVE','INACTIVE')),
        profile_picture_url NVARCHAR(500) NULL,
        created_at      DATETIME2     NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2     NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_users_email UNIQUE (email)
    );

    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role_status ON users(role, status);
END
