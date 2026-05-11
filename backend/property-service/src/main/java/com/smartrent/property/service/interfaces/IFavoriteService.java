package com.smartrent.property.service.interfaces;

import com.smartrent.property.dto.FavoriteResponseDto;

import java.util.List;

public interface IFavoriteService {
    List<FavoriteResponseDto> getTenantFavorites(Long tenantId);
    void addFavorite(Long tenantId, Long propertyId);
    void removeFavorite(Long tenantId, Long propertyId);
    boolean isFavorited(Long tenantId, Long propertyId);
}

