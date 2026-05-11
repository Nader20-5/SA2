package com.smartrent.rental.mapper;

import com.smartrent.rental.dto.CreateRentalDto;
import com.smartrent.rental.dto.DocumentResponseDto;
import com.smartrent.rental.dto.RentalResponseDto;
import com.smartrent.rental.model.ApplicationDocument;
import com.smartrent.rental.model.RentalApplication;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RentalMapper {

    RentalResponseDto toResponseDto(RentalApplication application);

    DocumentResponseDto toDocumentDto(ApplicationDocument document);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "landlordId", ignore = true)
    @Mapping(target = "propertyTitle", ignore = true)
    @Mapping(target = "monthlyRentSnapshot", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "documents", ignore = true)
    RentalApplication toEntity(CreateRentalDto dto);
}
