package com.smartrent.rental.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertySummaryDto {
    private Long id;
    private String title;
    private Long landlordId;
    private BigDecimal monthlyRent;
    private String status;
    private Boolean isAvailable;
}
