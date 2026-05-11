package com.smartrent.property.controller;

import com.smartrent.property.dto.*;
import com.smartrent.property.model.PropertyStatus;
import com.smartrent.property.service.interfaces.IPropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final IPropertyService propertyService;

    // ── Search (public — handles /api/properties and /api/properties/search) ──
    @GetMapping({ "", "/search" })
    public ResponseEntity<Page<PropertyResponseDto>> searchProperties(
            PropertySearchParams params) {
        return ResponseEntity.ok(propertyService.searchProperties(params));
    }

    // ── Get by ID (public) ───────────────────────────────────────
    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyResponseDto> getProperty(
            @PathVariable Long propertyId) {
        return ResponseEntity.ok(propertyService.getPropertyById(propertyId));
    }

    // ── Create (landlord) ────────────────────────────────────────
    @PostMapping
    public ResponseEntity<PropertyResponseDto> createProperty(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreatePropertyDto dto) {
        PropertyResponseDto created = propertyService.createProperty(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── Update (landlord — ownership checked in service) ─────────
    @PutMapping("/{propertyId}")
    public ResponseEntity<PropertyResponseDto> updateProperty(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId,
            @Valid @RequestBody UpdatePropertyDto dto) {
        return ResponseEntity.ok(propertyService.updateProperty(userId, propertyId, dto));
    }

    // ── Delete (landlord — cascades images & amenities) ──────────
    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> deleteProperty(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId) {
        propertyService.deleteProperty(userId, propertyId);
        return ResponseEntity.noContent().build();
    }

    // ── Upload images (landlord — multipart/form-data) ───────────
    @PostMapping(value = "/{propertyId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropertyResponseDto> uploadImages(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId,
            @RequestParam("files") List<MultipartFile> files) {
        PropertyResponseDto updated = propertyService.uploadImages(userId, propertyId, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(updated);
    }

    // ── Delete image (landlord) ──────────────────────────────────
    @DeleteMapping("/{propertyId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId,
            @PathVariable Long imageId) {
        propertyService.deleteImage(userId, propertyId, imageId);
        return ResponseEntity.noContent().build();
    }

    // ── Update status (admin only — checks X-User-Role) ──────────
    @PatchMapping("/{propertyId}/status")
    public ResponseEntity<PropertyResponseDto> updatePropertyStatus(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long propertyId,
            @RequestParam(value = "status") com.smartrent.property.model.PropertyStatus status,
            @RequestParam(value = "reason", required = false) String reason) {

        if (userRole != null && !"ADMIN".equalsIgnoreCase(userRole)) {
            throw new RuntimeException("Only ADMIN users can update property status");
        }

        return ResponseEntity.ok(
                propertyService.updatePropertyStatus(propertyId, status, reason));
    }

    // ── Landlord's own listings ──────────────────────────────────
    @GetMapping({ "/landlord", "/landlord/me" })
    public ResponseEntity<Page<PropertyResponseDto>> getLandlordProperties(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(propertyService.getLandlordProperties(userId, pageable));
    }

    // ── Internal endpoint (consumed by visit-service / rental-service) ─
    @GetMapping("/{propertyId}/internal")
    public ResponseEntity<PropertySummaryDto> getPropertyInternal(
            @PathVariable Long propertyId) {
        return ResponseEntity.ok(propertyService.getPropertyInternal(propertyId));
    }

    // ── Admin stats endpoint ─────────────────────────────────────
    @GetMapping("/admin/stats")
    public ResponseEntity<java.util.Map<String, Long>> getPropertyStats(
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if (userRole != null && !"ADMIN".equalsIgnoreCase(userRole)) {
            throw new RuntimeException("Only ADMIN users can access property stats");
        }
        return ResponseEntity.ok(propertyService.getPropertyStats());
    }

    // ── Admin list endpoint ──────────────────────────────────────
    @GetMapping("/admin/all")
    public ResponseEntity<Page<PropertyResponseDto>> getAllPropertiesForAdmin(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestParam(value = "status", required = false) PropertyStatus status,
            Pageable pageable) {
        if (userRole != null && !"ADMIN".equalsIgnoreCase(userRole)) {
            throw new RuntimeException("Only ADMIN users can access this endpoint");
        }
        return ResponseEntity.ok(propertyService.getAllPropertiesForAdmin(status, pageable));
    }
}
