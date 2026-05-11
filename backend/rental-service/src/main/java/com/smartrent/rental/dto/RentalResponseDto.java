package com.smartrent.rental.dto;

import com.smartrent.rental.model.ApplicationStatus;
import com.smartrent.rental.model.EmploymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalResponseDto {
    private Long id;
    private Long tenantId;
    private Long landlordId;
    private Long propertyId;
    private String propertyTitle;
    private String tenantName;
    private String tenantEmail;
    private BigDecimal monthlyRentSnapshot;
    private String coverLetter;
    private EmploymentStatus employmentStatus;
    private BigDecimal monthlyIncome;
    private LocalDate moveInDate;
    private LocalDate leaseEndDate;
    private ApplicationStatus status;
    private String rejectionReason;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DocumentResponseDto> documents;
}
