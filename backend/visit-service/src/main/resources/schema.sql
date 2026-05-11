IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'visit_requests')
BEGIN
    CREATE TABLE visit_requests (
        id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
        tenant_id           BIGINT          NOT NULL,
        landlord_id         BIGINT          NOT NULL,
        property_id         BIGINT          NOT NULL,
        property_title      NVARCHAR(255)   NOT NULL,
        requested_date      DATE            NOT NULL,
        requested_time      TIME            NOT NULL,
        suggested_date      DATE            NULL,
        suggested_time      TIME            NULL,
        status              NVARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED','RESCHEDULED')),
        rejection_reason    NVARCHAR(500)   NULL,
        notes               NVARCHAR(MAX)   NULL,
        created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at          DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX idx_visits_tenant ON visit_requests(tenant_id);
    CREATE INDEX idx_visits_landlord ON visit_requests(landlord_id);
    CREATE INDEX idx_visits_property_date ON visit_requests(property_id, requested_date, requested_time);
END
