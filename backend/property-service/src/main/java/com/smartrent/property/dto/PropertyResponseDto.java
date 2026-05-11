package com.smartrent.property.dto;

import com.smartrent.property.model.AmenityType;
import com.smartrent.property.model.PropertyStatus;
import com.smartrent.property.model.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponseDto {
    private Long id;
    private Long landlordId;
    private String landlordName;
    private String title;
    private String description;
    private String address;
    private String city;
    private String district;
    private PropertyType type;
    private BigDecimal monthlyRent;
    private int bedrooms;
    private int bathrooms;
    private BigDecimal areaSqm;
    private Integer floor;
    private PropertyStatus status;
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    private String mainImageUrl;
    private List<String> imageUrls;
    private List<AmenityType> amenities;
    private Double averageRating;
    private int reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
