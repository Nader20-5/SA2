package com.smartrent.property.service.impl;

import com.smartrent.property.annotation.Auditable;
import com.smartrent.property.client.UserServiceClient;
import com.smartrent.property.dto.*;
import com.smartrent.property.exception.PropertyNotFoundException;
import com.smartrent.property.exception.UnauthorizedOwnerException;
import com.smartrent.property.mapper.PropertyMapper;
import com.smartrent.property.model.*;
import com.smartrent.property.repository.PropertyAmenityRepository;
import com.smartrent.property.repository.PropertyImageRepository;
import com.smartrent.property.repository.PropertyRepository;
import com.smartrent.property.service.interfaces.IPropertyService;
import jakarta.persistence.criteria.Join;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements IPropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyAmenityRepository propertyAmenityRepository;
    private final PropertyMapper propertyMapper;
    private final UserServiceClient userServiceClient;
    private final FileStorageService fileStorageService;

    // ──────────────────────────────────────────────────────────────
    //  CREATE
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Auditable(action = "CREATE_PROPERTY", resourceType = "PROPERTY")
    public PropertyResponseDto createProperty(Long landlordId, CreatePropertyDto dto) {
        // Verify landlord exists and is ACTIVE via Feign
        UserResponseDto user = userServiceClient.getUserById(landlordId);
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedOwnerException(
                    "Landlord account is not active. Current status: " + user.getStatus());
        }

        // Map DTO → Entity
        Property property = propertyMapper.toEntity(dto);
        property.setLandlordId(landlordId);
        property.setStatus(PropertyStatus.PENDING);
        property.setAvailable(true);

        // Save property first (need id for amenities)
        Property saved = propertyRepository.save(property);

        // Delete existing amenities (safe on new entity), then re-save
        saveAmenities(saved, dto.getAmenities());

        return enrichResponse(saved);
    }

    // ──────────────────────────────────────────────────────────────
    //  READ — single
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PropertyResponseDto getPropertyById(Long id) {
        Property property = propertyRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new PropertyNotFoundException("Property not found with id: " + id));
        return enrichResponse(property);
    }

    // ──────────────────────────────────────────────────────────────
    //  SEARCH — JpaSpecificationExecutor
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponseDto> searchProperties(PropertySearchParams params) {
        Specification<Property> spec = buildSearchSpec(params);

        Pageable pageable = buildPageable(params);

        Page<Property> page = propertyRepository.findAll(Objects.requireNonNull(spec), Objects.requireNonNull(pageable));

        return page.map(this::enrichResponse);
    }

    // ──────────────────────────────────────────────────────────────
    //  LANDLORD PROPERTIES
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponseDto> getLandlordProperties(Long landlordId, Pageable pageable) {
        return propertyRepository.findByLandlordId(landlordId, pageable)
                .map(this::enrichResponse);
    }

    // ──────────────────────────────────────────────────────────────
    //  UPDATE
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Auditable(action = "UPDATE_PROPERTY", resourceType = "PROPERTY")
    public PropertyResponseDto updateProperty(Long landlordId, Long propertyId, UpdatePropertyDto dto) {
        Property property = findOwnedProperty(landlordId, propertyId);

        // Update allowed fields only — NEVER change status or landlordId
        if (dto.getTitle() != null)       property.setTitle(dto.getTitle());
        if (dto.getDescription() != null) property.setDescription(dto.getDescription());
        if (dto.getAddress() != null)     property.setAddress(dto.getAddress());
        if (dto.getCity() != null)        property.setCity(dto.getCity());
        if (dto.getDistrict() != null)    property.setDistrict(dto.getDistrict());
        if (dto.getType() != null)        property.setType(dto.getType());
        if (dto.getMonthlyRent() != null) property.setMonthlyRent(dto.getMonthlyRent());
        if (dto.getBedrooms() != null)    property.setBedrooms(dto.getBedrooms());
        if (dto.getBathrooms() != null)   property.setBathrooms(dto.getBathrooms());
        if (dto.getAreaSqm() != null)     property.setAreaSqm(dto.getAreaSqm());
        if (dto.getFloor() != null)       property.setFloor(dto.getFloor());

        // Clear and re-save amenities
        if (dto.getAmenities() != null) {
            property.getAmenities().clear();
            propertyRepository.saveAndFlush(property);
            saveAmenities(property, dto.getAmenities());
        }

        Property updated = propertyRepository.save(Objects.requireNonNull(property));
        return enrichResponse(updated);
    }

    // ──────────────────────────────────────────────────────────────
    //  DELETE — cascades to images and amenities
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Auditable(action = "DELETE_PROPERTY", resourceType = "PROPERTY")
    public void deleteProperty(Long landlordId, Long propertyId) {
        Property property = findOwnedProperty(landlordId, propertyId);
        propertyRepository.delete(Objects.requireNonNull(property));
        log.info("Deleted property {} for landlord {}", propertyId, landlordId);
    }

    // ──────────────────────────────────────────────────────────────
    //  UPLOAD IMAGES — now returns PropertyResponseDto
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PropertyResponseDto uploadImages(Long landlordId, Long propertyId, List<MultipartFile> files) {
        Property property = findOwnedProperty(landlordId, propertyId);

        boolean hasExistingImages = !propertyImageRepository.findByPropertyId(propertyId).isEmpty();
        boolean isFirstUpload = !hasExistingImages;

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            // MIME check is enforced inside FileStorageService (jpeg/png only)
            String storedPath = fileStorageService.storeFile(file);

            PropertyImage image = Objects.requireNonNull(PropertyImage.builder()
                    .property(property)
                    .imageUrl(storedPath)
                    .isMain(isFirstUpload && i == 0)
                    .displayOrder(i)
                    .build());

            propertyImageRepository.save(image);

            // Set main_image_url on property for the first image ever uploaded
            if (isFirstUpload && i == 0) {
                property.setMainImageUrl(storedPath);
            }
        }

        Property updated = propertyRepository.save(Objects.requireNonNull(property));
        log.info("Uploaded {} images for property {}", files.size(), propertyId);
        return enrichResponse(updated);
    }

    // ──────────────────────────────────────────────────────────────
    //  DELETE IMAGE
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteImage(Long landlordId, Long propertyId, Long imageId) {
        findOwnedProperty(landlordId, propertyId);

        PropertyImage image = propertyImageRepository.findById(Objects.requireNonNull(imageId))
                .orElseThrow(() -> new PropertyNotFoundException("Image not found with id: " + imageId));

        fileStorageService.deleteFile(image.getImageUrl());
        propertyImageRepository.delete(Objects.requireNonNull(image));

        log.info("Deleted image {} from property {}", imageId, propertyId);
    }

    // ──────────────────────────────────────────────────────────────
    //  UPDATE STATUS — Admin only (now accepts rejectionReason)
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Auditable(action = "UPDATE_PROPERTY_STATUS", resourceType = "PROPERTY")
    public PropertyResponseDto updatePropertyStatus(Long propertyId, PropertyStatus status, String rejectionReason) {
        Property property = propertyRepository.findById(Objects.requireNonNull(propertyId))
                .orElseThrow(() -> new PropertyNotFoundException("Property not found with id: " + propertyId));

        property.setStatus(status);

        // If REJECTED, mark property as unavailable
        if (status == PropertyStatus.REJECTED) {
            property.setAvailable(false);
            log.info("Property {} REJECTED. Reason: {}", propertyId,
                    rejectionReason != null ? rejectionReason : "No reason provided");
        }

        Property updated = propertyRepository.save(Objects.requireNonNull(property));

        log.info("Updated property {} status to {}", propertyId, status);
        return enrichResponse(updated);
    }

    // ──────────────────────────────────────────────────────────────
    //  INTERNAL — Frozen contract DTO
    // ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PropertySummaryDto getPropertyInternal(Long id) {
        Property property = propertyRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new PropertyNotFoundException("Property not found with id: " + id));
        return propertyMapper.toSummaryDto(property);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getPropertyStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("totalProperties", propertyRepository.count());
        stats.put("activeProperties", propertyRepository.countByStatus(PropertyStatus.APPROVED));
        stats.put("pendingApprovals", propertyRepository.countByStatus(PropertyStatus.PENDING));
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponseDto> getAllPropertiesForAdmin(PropertyStatus status, Pageable pageable) {
        Page<Property> page;
        if (status != null) {
            page = propertyRepository.findByStatus(status, pageable);
        } else {
            page = propertyRepository.findAll(pageable);
        }
        return page.map(this::enrichResponse);
    }

    // ══════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════

    /**
     * Ownership check — throws UnauthorizedOwnerException if the property
     * does not belong to the given landlord.
     */
    private Property findOwnedProperty(Long landlordId, Long propertyId) {
        return propertyRepository.findByIdAndLandlordId(propertyId, landlordId)
                .orElseThrow(() -> new UnauthorizedOwnerException(
                        "Property " + propertyId + " does not belong to landlord " + landlordId));
    }

    /**
     * Saves amenity list for a property. Skips if null or empty.
     */
    private void saveAmenities(Property property, List<AmenityType> amenities) {
        if (amenities == null || amenities.isEmpty()) return;

        List<PropertyAmenity> entities = amenities.stream()
                .distinct()
                .map(type -> PropertyAmenity.builder()
                        .property(property)
                        .amenity(type)
                        .build())
                .collect(Collectors.toList());

        propertyAmenityRepository.saveAll(Objects.requireNonNull(entities));
    }

    /**
     * Builds a JPA Specification with the mandatory base filter
     * (status = APPROVED AND is_available = true) plus optional filters
     * chained with .and() only when non-null.
     */
    private Specification<Property> buildSearchSpec(PropertySearchParams params) {
        // Base filter — always required
        Specification<Property> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("status"), PropertyStatus.APPROVED),
                cb.equal(root.get("isAvailable"), true)
        );

        // Optional: city
        if (params.getCity() != null && !params.getCity().isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("city")), "%" + params.getCity().toLowerCase() + "%"));
        }

        // Optional: type
        if (params.getType() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("type"), params.getType()));
        }

        // Optional: minPrice (minRent)
        if (params.getMinPrice() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("monthlyRent"), params.getMinPrice()));
        }

        // Optional: maxPrice (maxRent)
        if (params.getMaxPrice() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("monthlyRent"), params.getMaxPrice()));
        }

        // Optional: amenities list — join with distinct to avoid row duplication
        if (params.getAmenities() != null && !params.getAmenities().isEmpty()) {
            for (AmenityType amenity : params.getAmenities()) {
                spec = spec.and((root, query, cb) -> {
                    query.distinct(true);
                    Join<Property, PropertyAmenity> amenityJoin = root.join("amenities");
                    return cb.equal(amenityJoin.get("amenity"), amenity);
                });
            }
        }

        return spec;
    }

    /**
     * Builds a Pageable from search params with safe defaults.
     */
    private Pageable buildPageable(PropertySearchParams params) {
        int page = Math.max(params.getPage(), 0);
        int size = params.getSize() > 0 ? params.getSize() : 10;

        if (params.getSort() != null && !params.getSort().isBlank()) {
            return PageRequest.of(page, size, Sort.by(params.getSort()));
        }
        return PageRequest.of(page, size, Sort.by("createdAt").descending());
    }

    /**
     * Enriches a Property entity into a full PropertyResponseDto:
     *   - maps image URLs
     *   - maps amenity types
     *   - computes average rating / review count
     *   - calls UserServiceClient to get landlord name
     */
    private PropertyResponseDto enrichResponse(Property property) {
        PropertyResponseDto dto = propertyMapper.toResponseDto(property);

        // Image URLs
        if (property.getImages() != null) {
            dto.setImageUrls(property.getImages().stream()
                    .map(PropertyImage::getImageUrl)
                    .collect(Collectors.toList()));
        }

        // Amenities
        if (property.getAmenities() != null) {
            dto.setAmenities(property.getAmenities().stream()
                    .map(PropertyAmenity::getAmenity)
                    .collect(Collectors.toList()));
        }

        // Reviews — average rating + count
        if (property.getReviews() != null && !property.getReviews().isEmpty()) {
            double avg = property.getReviews().stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            dto.setAverageRating(Math.round(avg * 10.0) / 10.0);
            dto.setReviewCount(property.getReviews().size());
        } else {
            dto.setAverageRating(0.0);
            dto.setReviewCount(0);
        }

        // Landlord name enrichment via Feign
        try {
            UserResponseDto user = userServiceClient.getUserById(property.getLandlordId());
            dto.setLandlordName(user.getFirstName() + " " + user.getLastName());
        } catch (Exception e) {
            log.warn("Could not fetch landlord name for id {}: {}", property.getLandlordId(), e.getMessage());
            dto.setLandlordName("Unknown");
        }

        return dto;
    }
}
