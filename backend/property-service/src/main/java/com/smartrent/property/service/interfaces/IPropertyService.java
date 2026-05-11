package com.smartrent.property.service.interfaces;

import com.smartrent.property.dto.*;
import com.smartrent.property.model.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IPropertyService {
    PropertyResponseDto createProperty(Long landlordId, CreatePropertyDto dto);
    PropertyResponseDto getPropertyById(Long id);
    Page<PropertyResponseDto> searchProperties(PropertySearchParams params);
    Page<PropertyResponseDto> getLandlordProperties(Long landlordId, Pageable pageable);
    PropertyResponseDto updateProperty(Long landlordId, Long propertyId, UpdatePropertyDto dto);
    void deleteProperty(Long landlordId, Long propertyId);
    PropertyResponseDto uploadImages(Long landlordId, Long propertyId, List<MultipartFile> files);
    void deleteImage(Long landlordId, Long propertyId, Long imageId);
    PropertyResponseDto updatePropertyStatus(Long propertyId, PropertyStatus status, String rejectionReason);
    PropertySummaryDto getPropertyInternal(Long id);
    java.util.Map<String, Long> getPropertyStats();
    Page<PropertyResponseDto> getAllPropertiesForAdmin(PropertyStatus status, Pageable pageable);
}
