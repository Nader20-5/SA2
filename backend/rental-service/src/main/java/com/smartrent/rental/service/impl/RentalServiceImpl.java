package com.smartrent.rental.service.impl;

import com.smartrent.rental.annotation.Auditable;
import com.smartrent.rental.client.PropertyServiceClient;
import com.smartrent.rental.client.UserServiceClient;
import com.smartrent.rental.client.dto.PropertySummaryDto;
import com.smartrent.rental.client.dto.UserResponseDto;
import com.smartrent.rental.dto.*;
import com.smartrent.rental.event.RentalApplicationSubmittedEvent;
import com.smartrent.rental.event.RentalKafkaProducer;
import com.smartrent.rental.exception.*;
import com.smartrent.rental.mapper.RentalMapper;
import com.smartrent.rental.model.ApplicationDocument;
import com.smartrent.rental.model.ApplicationStatus;
import com.smartrent.rental.model.DocumentType;
import com.smartrent.rental.model.RentalApplication;
import com.smartrent.rental.repository.ApplicationDocumentRepository;
import com.smartrent.rental.repository.RentalApplicationRepository;
import com.smartrent.rental.service.interfaces.IRentalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RentalServiceImpl implements IRentalService {

    private final RentalApplicationRepository rentalApplicationRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final RentalMapper rentalMapper;
    private final UserServiceClient userServiceClient; // Only for checking user? Gateway gives role/id.
    private final PropertyServiceClient propertyServiceClient;
    private final FileStorageService fileStorageService;
    private final RentalKafkaProducer rentalKafkaProducer;

    @Override
    @Transactional
    @Auditable(action = "CREATE_RENTAL_APPLICATION", resourceType = "RENTAL")
    public RentalResponseDto createApplication(Long tenantId, CreateRentalDto dto) {
        // Verify property
        PropertySummaryDto property = propertyServiceClient.getPropertyById(dto.getPropertyId());
        if (!"APPROVED".equals(property.getStatus()) || Boolean.FALSE.equals(property.getIsAvailable())) {
            throw new InvalidApplicationStatusException("Property is not available or not approved");
        }

        // Only block if there's already a PENDING application (prevents accidental double-submits)
        if (rentalApplicationRepository.existsByTenantIdAndPropertyIdAndStatus(tenantId, dto.getPropertyId(),
                ApplicationStatus.PENDING)) {
            throw new DuplicateApplicationException("You already have a pending application for this property");
        }
        // Date overlap check
        if (rentalApplicationRepository.existsApprovedOverlappingDates(dto.getPropertyId(), dto.getMoveInDate(),
                dto.getLeaseEndDate())) {
            throw new InvalidApplicationStatusException("These dates are already booked for this property");
        }

        RentalApplication application = rentalMapper.toEntity(dto);
        application.setTenantId(tenantId);
        application.setLandlordId(property.getLandlordId());
        application.setPropertyTitle(property.getTitle());
        application.setMonthlyRentSnapshot(property.getMonthlyRent());
        application.setStatus(ApplicationStatus.PENDING);

        application = rentalApplicationRepository.save(application);

        // Publish Kafka event after successful save
        try {
            RentalApplicationSubmittedEvent event = RentalApplicationSubmittedEvent.builder()
                    .applicationId(application.getId())
                    .propertyId(application.getPropertyId())
                    .tenantId(application.getTenantId())
                    .landlordId(application.getLandlordId())
                    .status(application.getStatus().name())
                    .build();
            rentalKafkaProducer.publishRentalApplicationSubmitted(event);
        } catch (Exception e) {
            log.error("Failed to publish RentalApplicationSubmittedEvent for applicationId={}: {}", application.getId(),
                    e.getMessage());
        }

        return rentalMapper.toResponseDto(application);
    }

    @Override
    @Transactional
    public RentalResponseDto uploadDocuments(Long tenantId, Long applicationId, DocumentType type, MultipartFile file) {
        RentalApplication application = rentalApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RentalApplicationNotFoundException("Rental application not found"));

        if (!application.getTenantId().equals(tenantId)) {
            throw new UnauthorizedRentalActionException(
                    "You are not authorized to upload documents for this application");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new InvalidApplicationStatusException(
                    "Cannot upload documents. Application is not in PENDING status.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new DocumentUploadException("Invalid file");
        }

        String storedPath = fileStorageService.storeFile(file);

        ApplicationDocument document = ApplicationDocument.builder()
                .application(application)
                .documentType(type)
                .fileName(originalFilename)
                .fileUrl("/" + storedPath)
                .fileSizeBytes(file.getSize())
                .build();

        applicationDocumentRepository.save(document);

        // Fetch application again to get updated documents list (since it's a new
        // transaction save)
        return rentalMapper.toResponseDto(application);
    }

    @Override
    public List<RentalResponseDto> getTenantApplications(Long tenantId) {
        return rentalApplicationRepository.findByTenantId(tenantId).stream()
                .map(rentalMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public RentalResponseDto getApplicationById(Long requesterId, String requesterRole, Long applicationId) {
        RentalApplication application = rentalApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RentalApplicationNotFoundException("Rental application not found"));

        if (!"ADMIN".equals(requesterRole) && !application.getTenantId().equals(requesterId)
                && !application.getLandlordId().equals(requesterId)) {
            throw new UnauthorizedRentalActionException("You are not authorized to view this application");
        }

        RentalResponseDto responseDto = rentalMapper.toResponseDto(application);
        return enrichWithTenantDetails(responseDto);
    }

    @Override
    @Transactional
    @Auditable(action = "WITHDRAW_RENTAL_APPLICATION", resourceType = "RENTAL")
    public void withdrawApplication(Long tenantId, Long applicationId) {
        RentalApplication application = rentalApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RentalApplicationNotFoundException("Rental application not found"));

        if (!application.getTenantId().equals(tenantId)) {
            throw new UnauthorizedRentalActionException("You are not authorized to withdraw this application");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new InvalidApplicationStatusException("Only PENDING applications can be withdrawn");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        rentalApplicationRepository.save(application);
    }

    @Override
    public List<RentalResponseDto> getLandlordApplications(Long landlordId) {
        return rentalApplicationRepository.findByLandlordId(landlordId).stream()
                .map(app -> enrichWithTenantDetails(rentalMapper.toResponseDto(app)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @Auditable(action = "APPROVE_RENTAL_APPLICATION", resourceType = "RENTAL")
    public RentalResponseDto approveApplication(Long landlordId, Long applicationId) {
        RentalApplication application = rentalApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RentalApplicationNotFoundException("Rental application not found"));

        if (!application.getLandlordId().equals(landlordId)) {
            throw new UnauthorizedRentalActionException("You are not authorized to approve this application");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new InvalidApplicationStatusException("Only PENDING applications can be approved");
        }

        application.setStatus(ApplicationStatus.APPROVED);
        application.setReviewedAt(LocalDateTime.now());

        application = rentalApplicationRepository.save(application);
        return rentalMapper.toResponseDto(application);
    }

    @Override
    @Transactional
    @Auditable(action = "REJECT_RENTAL_APPLICATION", resourceType = "RENTAL")
    public RentalResponseDto rejectApplication(Long landlordId, Long applicationId, RejectRentalDto dto) {
        RentalApplication application = rentalApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RentalApplicationNotFoundException("Rental application not found"));

        if (!application.getLandlordId().equals(landlordId)) {
            throw new UnauthorizedRentalActionException("You are not authorized to reject this application");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new InvalidApplicationStatusException("Only PENDING applications can be rejected");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(dto.getReason());
        application.setReviewedAt(LocalDateTime.now());
        application = rentalApplicationRepository.save(application);
        return enrichWithTenantDetails(rentalMapper.toResponseDto(application));
    }

    private RentalResponseDto enrichWithTenantDetails(RentalResponseDto dto) {
        try {
            UserResponseDto user = userServiceClient.getUserById(dto.getTenantId());
            dto.setTenantName(user.getFirstName() + " " + user.getLastName());
            dto.setTenantEmail(user.getEmail());
        } catch (Exception e) {
            dto.setTenantName("Unknown Tenant");
            dto.setTenantEmail("Unknown Email");
        }
        return dto;
    }

    @Override
    public List<BookedDateRangeDto> getBookedDates(Long propertyId) {
        return rentalApplicationRepository.findByPropertyIdAndStatus(propertyId, ApplicationStatus.APPROVED)
                .stream()
                .map(app -> new BookedDateRangeDto(app.getMoveInDate(), app.getLeaseEndDate()))
                .collect(Collectors.toList());
    }
}
