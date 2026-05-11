package com.smartrent.property.dto;

import com.smartrent.property.model.AmenityType;
import com.smartrent.property.model.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePropertyDto {
    private String title;
    private String description;
    private String address;
    private String city;
    private String district;
    private PropertyType type;
    private BigDecimal monthlyRent;
    private Integer bedrooms;
    private Integer bathrooms;
    private BigDecimal areaSqm;
    private Integer floor;
    private List<AmenityType> amenities;
}
