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
public class PropertySearchParams {
    private String city;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private PropertyType type;
    private List<AmenityType> amenities;
    private int page;
    private int size;
    private String sort;
}
