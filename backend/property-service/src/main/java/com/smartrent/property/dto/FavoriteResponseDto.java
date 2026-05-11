package com.smartrent.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponseDto {
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private String mainImageUrl;
    private BigDecimal monthlyRent;
    private String city;
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    private int bedrooms;
    private int bathrooms;
    private BigDecimal areaSqm;
    private String type;
}
