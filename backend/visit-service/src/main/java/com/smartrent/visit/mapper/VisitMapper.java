package com.smartrent.visit.mapper;

import com.smartrent.visit.dto.CreateVisitDto;
import com.smartrent.visit.dto.VisitResponseDto;
import com.smartrent.visit.model.VisitRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VisitMapper {

    @Mapping(target = "tenantName", ignore = true)
    @Mapping(target = "tenantEmail", ignore = true)
    VisitResponseDto toResponseDto(VisitRequest visitRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "landlordId", ignore = true)
    @Mapping(target = "propertyTitle", ignore = true)
    @Mapping(target = "propertyAddress", ignore = true)
    @Mapping(target = "suggestedDate", ignore = true)
    @Mapping(target = "suggestedTime", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VisitRequest toEntity(CreateVisitDto dto);
}
