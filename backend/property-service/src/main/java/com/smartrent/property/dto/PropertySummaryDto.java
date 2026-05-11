package com.smartrent.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Frozen cross-service contract — consumed by visit-service and rental-service.
 * DO NOT add, remove, or rename any fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertySummaryDto {
    private Long id;
    private Long landlordId;
    private String title;
    private String status;        // "APPROVED", "PENDING", etc.
    @JsonProperty("isAvailable")
    private Boolean isAvailable;
    private BigDecimal monthlyRent;
}
