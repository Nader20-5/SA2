package com.smartrent.property.repository;

import com.smartrent.property.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPropertyId(Long propertyId);
    boolean existsByPropertyIdAndTenantId(Long propertyId, Long tenantId);
    Optional<Review> findByIdAndTenantId(Long id, Long tenantId);
}
