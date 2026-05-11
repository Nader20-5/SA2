package com.smartrent.rental.service.interfaces;

import com.smartrent.rental.dto.*;
import com.smartrent.rental.model.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IRentalService {
    RentalResponseDto createApplication(Long tenantId, CreateRentalDto dto);
    RentalResponseDto uploadDocuments(Long tenantId, Long applicationId, DocumentType type, MultipartFile file);
    List<RentalResponseDto> getTenantApplications(Long tenantId);
    RentalResponseDto getApplicationById(Long requesterId, String requesterRole, Long applicationId);
    void withdrawApplication(Long tenantId, Long applicationId);
    List<RentalResponseDto> getLandlordApplications(Long landlordId);
    RentalResponseDto approveApplication(Long landlordId, Long applicationId);
    RentalResponseDto rejectApplication(Long landlordId, Long applicationId, RejectRentalDto dto);
    List<BookedDateRangeDto> getBookedDates(Long propertyId);
}
