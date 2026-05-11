package com.smartrent.property.service.impl;

import com.smartrent.property.dto.CreateReviewDto;
import com.smartrent.property.dto.ReviewResponseDto;
import com.smartrent.property.exception.DuplicateReviewException;
import com.smartrent.property.exception.PropertyNotApprovedException;
import com.smartrent.property.exception.PropertyNotFoundException;
import com.smartrent.property.exception.ReviewNotFoundException;
import com.smartrent.property.exception.UnauthorizedOwnerException;
import com.smartrent.property.mapper.ReviewMapper;
import com.smartrent.property.model.Property;
import com.smartrent.property.model.PropertyStatus;
import com.smartrent.property.model.Review;
import com.smartrent.property.repository.PropertyRepository;
import com.smartrent.property.repository.ReviewRepository;
import com.smartrent.property.service.interfaces.IReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final ReviewMapper reviewMapper;
    private final com.smartrent.property.client.UserServiceClient userServiceClient;

    // ── GET all reviews for a property ───────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByProperty(Long propertyId) {
        List<Review> reviews = reviewRepository.findByPropertyId(propertyId);
        return reviews.stream()
                .map(this::enrichReview)
                .collect(Collectors.toList());
    }

    // ── CREATE review ─────────────────────────────────────────────
    @Override
    @Transactional
    public ReviewResponseDto createReview(Long tenantId, Long propertyId, CreateReviewDto dto) {
        // 1. Find property → PropertyNotFoundException if absent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(
                        "Property not found with id: " + propertyId));

        // 2. Status check → must be APPROVED
        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new PropertyNotApprovedException(
                    "Reviews can only be posted on APPROVED properties. Current status: "
                            + property.getStatus());
        }

        // 3. Duplicate check → one review per tenant per property
        if (reviewRepository.existsByPropertyIdAndTenantId(propertyId, tenantId)) {
            throw new DuplicateReviewException(
                    "You have already reviewed this property.");
        }

        // 4. Build & save
        Review review = Review.builder()
                .property(property)
                .tenantId(tenantId)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Tenant {} created review {} for property {}", tenantId, saved.getId(), propertyId);
        return enrichReview(saved);
    }

    // ── UPDATE review ─────────────────────────────────────────────
    @Override
    @Transactional
    public ReviewResponseDto updateReview(Long tenantId, Long reviewId, CreateReviewDto dto) {
        // 1. Find review
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(
                        "Review not found with id: " + reviewId));

        // 2. Ownership check
        if (!review.getTenantId().equals(tenantId)) {
            throw new UnauthorizedOwnerException(
                    "You are not allowed to edit this review.");
        }

        // 3. Apply patch and save
        review.setRating(dto.getRating());
        if (dto.getComment() != null) {
            review.setComment(dto.getComment());
        }

        Review updated = reviewRepository.save(review);
        log.info("Tenant {} updated review {}", tenantId, reviewId);
        return enrichReview(updated);
    }

    private ReviewResponseDto enrichReview(Review review) {
        ReviewResponseDto dto = reviewMapper.toResponseDto(review);
        try {
            com.smartrent.property.dto.UserResponseDto user = userServiceClient.getUserById(review.getTenantId());
            dto.setTenantFullName(user.getFirstName() + " " + user.getLastName());
        } catch (Exception e) {
            log.warn("Could not fetch tenant name for id {}: {}", review.getTenantId(), e.getMessage());
            dto.setTenantFullName("Anonymous User");
        }
        return dto;
    }


    // ── DELETE review ─────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteReview(Long tenantId, Long reviewId) {
        // 1. Find review
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(
                        "Review not found with id: " + reviewId));

        // 2. Ownership check
        if (!review.getTenantId().equals(tenantId)) {
            throw new UnauthorizedOwnerException(
                    "You are not allowed to delete this review.");
        }

        reviewRepository.delete(review);
        log.info("Tenant {} deleted review {}", tenantId, reviewId);
    }
}
