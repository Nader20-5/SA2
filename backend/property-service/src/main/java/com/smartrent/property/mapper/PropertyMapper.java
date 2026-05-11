package com.smartrent.property.mapper;

import com.smartrent.property.dto.CreatePropertyDto;
import com.smartrent.property.dto.PropertyResponseDto;
import com.smartrent.property.dto.PropertySummaryDto;
import com.smartrent.property.model.Property;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PropertyMapper {

    @Mapping(target = "imageUrls", ignore = true)
    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "reviewCount", ignore = true)
    @Mapping(target = "landlordName", ignore = true)
    @Mapping(target = "isAvailable", source = "available")
    PropertyResponseDto toResponseDto(Property property);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "landlordId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isAvailable", ignore = true)
    @Mapping(target = "mainImageUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "favorites", ignore = true)
    Property toEntity(CreatePropertyDto dto);

    @Mapping(target = "status", expression = "java(property.getStatus().name())")
    @Mapping(target = "isAvailable", source = "available")
    PropertySummaryDto toSummaryDto(Property property);
}
