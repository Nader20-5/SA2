package com.smartrent.property.dto;

import com.smartrent.property.model.AmenityType;
import com.smartrent.property.model.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class CreatePropertyDto {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    private String district;

    @NotNull
    private PropertyType type;

    @NotNull
    @Positive
    private BigDecimal monthlyRent;

    private int bedrooms;
    private int bathrooms;
    private BigDecimal areaSqm;
    private Integer floor;
    private List<AmenityType> amenities;
}
