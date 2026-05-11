package com.smartrent.property.service.impl;

import com.smartrent.property.dto.FavoriteResponseDto;
import com.smartrent.property.exception.DuplicateFavoriteException;
import com.smartrent.property.exception.FavoriteNotFoundException;
import com.smartrent.property.exception.PropertyNotApprovedException;
import com.smartrent.property.exception.PropertyNotFoundException;
import com.smartrent.property.model.Favorite;
import com.smartrent.property.model.Property;
import com.smartrent.property.model.PropertyStatus;
import com.smartrent.property.repository.FavoriteRepository;
import com.smartrent.property.repository.PropertyRepository;
import com.smartrent.property.service.interfaces.IFavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements IFavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;

    // ── GET favorites for a tenant ───────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<FavoriteResponseDto> getTenantFavorites(Long tenantId) {
        return favoriteRepository.findByTenantId(tenantId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── ADD favorite ──────────────────────────────────────────────
    @Override
    @Transactional
    public void addFavorite(Long tenantId, Long propertyId) {
        // 1. Find property → PropertyNotFoundException if absent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(
                        "Property not found with id: " + propertyId));

        // 2. Status check → must be APPROVED
        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new PropertyNotApprovedException(
                    "Only APPROVED properties can be favorited. Current status: "
                            + property.getStatus());
        }

        // 3. Duplicate check
        if (favoriteRepository.existsByTenantIdAndPropertyId(tenantId, propertyId)) {
            throw new DuplicateFavoriteException(
                    "Property " + propertyId + " is already in your favorites.");
        }

        // 4. Build & persist
        Favorite favorite = Favorite.builder()
                .tenantId(tenantId)
                .property(property)
                .build();

        favoriteRepository.save(favorite);
        log.info("Tenant {} added property {} to favorites", tenantId, propertyId);
    }

    // ── REMOVE favorite ───────────────────────────────────────────
    @Override
    @Transactional
    public void removeFavorite(Long tenantId, Long propertyId) {
        Favorite favorite = favoriteRepository.findByTenantIdAndPropertyId(tenantId, propertyId)
                .orElseThrow(() -> new FavoriteNotFoundException(
                        "Property " + propertyId + " is not in your favorites."));

        favoriteRepository.delete(favorite);
        log.info("Tenant {} removed property {} from favorites", tenantId, propertyId);
    }

    // ── CHECK if a property is favorited ─────────────────────────
    @Override
    @Transactional(readOnly = true)
    public boolean isFavorited(Long tenantId, Long propertyId) {
        return favoriteRepository.existsByTenantIdAndPropertyId(tenantId, propertyId);
    }

    // ── Private helper ────────────────────────────────────────────
    private FavoriteResponseDto toDto(Favorite favorite) {
        Property p = favorite.getProperty();
        return FavoriteResponseDto.builder()
                .id(favorite.getId())
                .propertyId(p.getId())
                .propertyTitle(p.getTitle())
                .mainImageUrl(p.getMainImageUrl())
                .monthlyRent(p.getMonthlyRent())
                .city(p.getCity())
                .isAvailable(p.isAvailable())
                .bedrooms(p.getBedrooms())
                .bathrooms(p.getBathrooms())
                .areaSqm(p.getAreaSqm())
                .type(p.getType().name())
                .build();
    }
}

