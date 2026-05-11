package com.smartrent.property.repository;

import com.smartrent.property.model.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {
    List<PropertyImage> findByPropertyId(Long propertyId);
    Optional<PropertyImage> findByPropertyIdAndIsMainTrue(Long propertyId);
}
