package com.smartrent.property.service.interfaces;

import com.smartrent.property.dto.CreateReviewDto;
import com.smartrent.property.dto.ReviewResponseDto;

import java.util.List;

public interface IReviewService {
    List<ReviewResponseDto> getReviewsByProperty(Long propertyId);
    ReviewResponseDto createReview(Long tenantId, Long propertyId, CreateReviewDto dto);
    ReviewResponseDto updateReview(Long tenantId, Long reviewId, CreateReviewDto dto);
    void deleteReview(Long tenantId, Long reviewId);
}
