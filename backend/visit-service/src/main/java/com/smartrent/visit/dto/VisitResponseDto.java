package com.smartrent.visit.dto;

import com.smartrent.visit.model.VisitStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitResponseDto {
    private Long id;
    private Long tenantId;
    private String tenantName;
    private String tenantEmail;
    private Long landlordId;
    private Long propertyId;
    private String propertyTitle;
    private String propertyAddress;
    private LocalDate requestedDate;
    private LocalTime requestedTime;
    private LocalDate suggestedDate;
    private LocalTime suggestedTime;
    private VisitStatus status;
    private String rejectionReason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
