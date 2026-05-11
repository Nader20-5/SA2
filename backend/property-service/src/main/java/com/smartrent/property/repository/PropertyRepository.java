package com.smartrent.property.repository;

import com.smartrent.property.model.Property;
import com.smartrent.property.model.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>,
                                            JpaSpecificationExecutor<Property> {

    Page<Property> findByLandlordId(Long landlordId, Pageable pageable);

    List<Property> findByStatus(PropertyStatus status);

    Optional<Property> findByIdAndLandlordId(Long id, Long landlordId);

    long countByStatus(PropertyStatus status);

    Page<Property> findByStatus(PropertyStatus status, Pageable pageable);
}
