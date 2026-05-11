package com.smartrent.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private Long id;
    private Long propertyId;
    private Long tenantId;
    private String tenantFullName;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}

