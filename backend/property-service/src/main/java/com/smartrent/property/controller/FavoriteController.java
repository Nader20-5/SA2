package com.smartrent.property.controller;

import com.smartrent.property.dto.FavoriteResponseDto;
import com.smartrent.property.service.interfaces.IFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final IFavoriteService favoriteService;

    // ── GET all favorites for the current tenant ──────────────────
    @GetMapping
    public ResponseEntity<List<FavoriteResponseDto>> getTenantFavorites(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(favoriteService.getTenantFavorites(userId));
    }

    // ── CHECK if a property is in the tenant's favorites ─────────
    @GetMapping("/{propertyId}/check")
    public ResponseEntity<Boolean> isFavorited(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId) {
        return ResponseEntity.ok(favoriteService.isFavorited(userId, propertyId));
    }

    // ── ADD a property to favorites ───────────────────────────────
    @PostMapping("/{propertyId}")
    public ResponseEntity<Void> addFavorite(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId) {
        favoriteService.addFavorite(userId, propertyId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // ── REMOVE a property from favorites ──────────────────────────
    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> removeFavorite(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId) {
        favoriteService.removeFavorite(userId, propertyId);
        return ResponseEntity.noContent().build();
    }
}

