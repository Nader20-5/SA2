IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'properties')
BEGIN
    CREATE TABLE properties (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        landlord_id     BIGINT          NOT NULL,
        title           NVARCHAR(255)   NOT NULL,
        description     NVARCHAR(MAX)   NULL,
        address         NVARCHAR(500)   NOT NULL,
        city            NVARCHAR(100)   NOT NULL,
        district        NVARCHAR(100)   NULL,
        type            NVARCHAR(20)    NOT NULL CHECK (type IN ('APARTMENT','VILLA','STUDIO','OFFICE','ROOM')),
        monthly_rent    DECIMAL(10,2)   NOT NULL,
        bedrooms        INT             NOT NULL DEFAULT 0,
        bathrooms       INT             NOT NULL DEFAULT 0,
        area_sqm        DECIMAL(8,2)    NULL,
        floor           INT             NULL,
        status          NVARCHAR(20)    NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','INACTIVE')),
        is_available    BIT             NOT NULL DEFAULT 1,
        main_image_url  NVARCHAR(500)   NULL,
        created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX idx_properties_landlord ON properties(landlord_id);
    CREATE INDEX idx_properties_city_status ON properties(city, status);
    CREATE INDEX idx_properties_type_rent ON properties(type, monthly_rent);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'property_images')
BEGIN
    CREATE TABLE property_images (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        property_id     BIGINT          NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        image_url       NVARCHAR(500)   NOT NULL,
        is_main         BIT             NOT NULL DEFAULT 0,
        display_order   INT             NOT NULL DEFAULT 0,
        uploaded_at     DATETIME2       NOT NULL DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'property_amenities')
BEGIN
    CREATE TABLE property_amenities (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        property_id     BIGINT          NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        amenity         NVARCHAR(30)    NOT NULL CHECK (amenity IN ('PARKING','POOL','ELEVATOR','FURNISHED','GYM','SECURITY','BALCONY','GARDEN')),
        CONSTRAINT UQ_property_amenity UNIQUE (property_id, amenity)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'reviews')
BEGIN
    CREATE TABLE reviews (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        property_id     BIGINT          NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        tenant_id       BIGINT          NOT NULL,
        rating          TINYINT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment         NVARCHAR(MAX)   NULL,
        created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_review_tenant_property UNIQUE (property_id, tenant_id)
    );
    CREATE INDEX idx_reviews_property ON reviews(property_id);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'favorites')
BEGIN
    CREATE TABLE favorites (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        tenant_id       BIGINT          NOT NULL,
        property_id     BIGINT          NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_favorite_tenant_property UNIQUE (tenant_id, property_id)
    );
END
