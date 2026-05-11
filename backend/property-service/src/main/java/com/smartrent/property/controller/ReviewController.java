package com.smartrent.property.controller;

import com.smartrent.property.dto.CreateReviewDto;
import com.smartrent.property.dto.ReviewResponseDto;
import com.smartrent.property.service.interfaces.IReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final IReviewService reviewService;

    // ── GET reviews for a property (public) ──────────────────────
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByProperty(
            @PathVariable Long propertyId) {
        return ResponseEntity.ok(reviewService.getReviewsByProperty(propertyId));
    }

    // ── CREATE review (tenant) ────────────────────────────────────
    @PostMapping("/property/{propertyId}")
    public ResponseEntity<ReviewResponseDto> createReview(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId,
            @Valid @RequestBody CreateReviewDto dto) {
        ReviewResponseDto created = reviewService.createReview(userId, propertyId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── UPDATE review (tenant — ownership checked in service) ─────
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> updateReview(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId,
            @Valid @RequestBody CreateReviewDto dto) {
        return ResponseEntity.ok(reviewService.updateReview(userId, reviewId, dto));
    }

    // ── DELETE review (tenant — ownership checked in service) ─────
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.noContent().build();
    }
}

