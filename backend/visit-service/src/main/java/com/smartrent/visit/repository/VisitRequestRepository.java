package com.smartrent.visit.repository;

import com.smartrent.visit.model.VisitRequest;
import com.smartrent.visit.model.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {
    List<VisitRequest> findByTenantId(Long tenantId);
    List<VisitRequest> findByLandlordId(Long landlordId);
    boolean existsByPropertyIdAndRequestedDateAndRequestedTimeAndStatus(
        Long propertyId, LocalDate date, LocalTime time, VisitStatus status);
}
