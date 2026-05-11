package com.smartrent.property.repository;

import com.smartrent.property.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByTenantId(Long tenantId);
    boolean existsByTenantIdAndPropertyId(Long tenantId, Long propertyId);
    Optional<Favorite> findByTenantIdAndPropertyId(Long tenantId, Long propertyId);
}
