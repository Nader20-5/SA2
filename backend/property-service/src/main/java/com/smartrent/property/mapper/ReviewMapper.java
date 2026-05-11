package com.smartrent.property.mapper;

import com.smartrent.property.dto.CreateReviewDto;
import com.smartrent.property.dto.ReviewResponseDto;
import com.smartrent.property.model.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "property.id", target = "propertyId")
    @Mapping(target = "tenantFullName", ignore = true)
    ReviewResponseDto toResponseDto(Review review);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Review toEntity(CreateReviewDto dto);
}
