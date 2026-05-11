IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rental_applications')
BEGIN
    CREATE TABLE rental_applications (
        id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
        tenant_id               BIGINT          NOT NULL,
        landlord_id             BIGINT          NOT NULL,
        property_id             BIGINT          NOT NULL,
        property_title          NVARCHAR(255)   NOT NULL,
        monthly_rent_snapshot   DECIMAL(10,2)   NOT NULL,
        cover_letter            NVARCHAR(MAX)   NULL,
        employment_status       NVARCHAR(20)    NOT NULL
                                CHECK (employment_status IN ('EMPLOYED','SELF_EMPLOYED','STUDENT','RETIRED','OTHER')),
        monthly_income          DECIMAL(10,2)   NULL,
        move_in_date            DATE            NOT NULL,
        status                  NVARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING','APPROVED','REJECTED','WITHDRAWN')),
        rejection_reason        NVARCHAR(1000)  NULL,
        reviewed_at             DATETIME2       NULL,
        created_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at              DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX idx_rental_tenant ON rental_applications(tenant_id);
    CREATE INDEX idx_rental_landlord ON rental_applications(landlord_id);
    CREATE INDEX idx_rental_property_status ON rental_applications(property_id, status);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'application_documents')
BEGIN
    CREATE TABLE application_documents (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        application_id  BIGINT          NOT NULL REFERENCES rental_applications(id) ON DELETE CASCADE,
        document_type   NVARCHAR(30)    NOT NULL
                        CHECK (document_type IN ('PROOF_OF_INCOME','NATIONAL_ID','EMPLOYMENT_LETTER','OTHER')),
        file_name       NVARCHAR(255)   NOT NULL,
        file_url        NVARCHAR(500)   NOT NULL,
        file_size_bytes BIGINT          NOT NULL,
        uploaded_at     DATETIME2       NOT NULL DEFAULT GETDATE()
    );
END
